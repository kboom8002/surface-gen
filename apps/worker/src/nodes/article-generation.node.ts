import { z } from 'zod';
import type { FactoryJobState } from '../state/factory-job-state';
import { createJobStep, completeJobStep } from '../services/job-state-store';
import { getModelForTask } from '../services/model-client';
import { UniversalContentAssetSchema } from '@surface-gen/schemas';
import { supabaseAdmin } from '../services/supabase-admin';
import { randomUUID } from 'crypto';

const ArticleOutputSchema = z.object({
  articles: z.array(z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(80),
    body_richtext: z.string().min(2000),
    topic: z.string(),
    target_intent: z.string(),
    seo_title: z.string(),
    meta_description: z.string(),
  })).min(1).max(4),
});

const SYSTEM_PROMPT = `You are a Korean wedding industry content writer for the AIHompy platform.
Generate informative wedding-related articles (아티클) for a specific wedding studio brand.

CRITICAL RULES:
- Write ALL content in Korean (한국어).
- Each article body_richtext must be at least 3000 Korean characters.
- Use HTML tags: h2, h3, p, ul, li, strong, em, blockquote.
- Content must be genuinely helpful to brides/grooms — not just advertising.
- Never invent specific prices, certifications, reviews, or exact facts not provided.
- Use [검토 필요] for unverified claims.
- Slugs must be lowercase English with hyphens only.
- Generate brand-specific articles that connect to this brand's actual services and style.

OUTPUT: Return ONLY valid JSON.`;

export async function articleGenerationNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'article_generation');
  try {
    const bt = state.intermediate?.brandTruthSheet;
    const brandName = bt?.officialBrandName ?? state.tenantSlug;
    const positioning = bt?.positioning ?? '';
    const serviceDomains = bt?.serviceDomains?.join(', ') ?? '웨딩 사진 촬영';
    const programs = bt?.programs?.map(p => p.name).join(', ') ?? '';

    // Get QIS questions from semantic strategy for article topics
    const strategy = state.intermediate?.semanticStrategy as Record<string, unknown> | undefined;
    const qisQuestions: string[] = [];
    if (strategy && typeof strategy === 'object' && 'qisGrowthRegistry' in strategy) {
      const qis = strategy['qisGrowthRegistry'] as { questions: Array<{ question_ko: string; priority: string }> };
      qis.questions
        .filter(q => q.priority === 'p1')
        .slice(0, 3)
        .forEach(q => qisQuestions.push(q.question_ko));
    }

    const userPrompt = `Brand: ${brandName}
TenantSlug: ${state.tenantSlug}
Positioning: ${positioning}
ServiceDomains: ${serviceDomains}
Programs: ${programs}
Top QIS Questions to address:
${qisQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Generate 2-3 comprehensive Korean wedding articles. Each must be at least 3000 Korean characters.
Make them genuinely informative for brides/grooms, subtly showing this brand's expertise.

Return JSON:
{
  "articles": [
    {
      "title": "웨딩 촬영 완벽 가이드 (Korean title)",
      "slug": "wedding-photo-guide",
      "summary": "80+ char Korean summary of what readers learn",
      "body_richtext": "<h2>제목</h2><p>최소 3000자 본문 HTML...</p>",
      "topic": "웨딩 촬영 가이드",
      "target_intent": "촬영 준비 방법 알아보기",
      "seo_title": "SEO optimized title (Korean)",
      "meta_description": "compelling meta description (Korean, under 160 chars)"
    }
  ]
}`;

    const model = getModelForTask('longform_generation');
    const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    const content =
      typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in article generation response');

    const rawData: unknown = JSON.parse(jsonMatch[0]);
    const parsed = ArticleOutputSchema.parse(rawData);

    const assets = parsed.articles.map((a, i) =>
      UniversalContentAssetSchema.parse({
        id: randomUUID(),
        tenant_id: state.tenantSlug,
        type: 'article' as const,
        category: 'answers',
        title: a.title,
        slug: a.slug,
        summary: a.summary,
        body: a.body_richtext.replace(/<[^>]+>/g, ''),
        body_richtext: a.body_richtext,
        status: 'draft' as const,
        review_status: 'pending_review' as const,
        sort_order: i + 1,
        json_payload: {
          topic: a.topic,
          target_intent: a.target_intent,
          char_count: a.body_richtext.replace(/<[^>]+>/g, '').length,
          seo_title: a.seo_title,
          meta_description: a.meta_description,
        },
      }),
    );

    // Persist
    const rows = assets.map((a) => ({
      id: a.id,
      project_id: state.projectId,
      job_id: state.jobId,
      tenant_id: state.tenantSlug,
      uca_id: a.id,
      asset_type: a.type,
      category: a.category,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      body: a.body ?? null,
      body_richtext: a.body_richtext ?? null,
      status: a.status,
      review_status: a.review_status,
      sort_order: a.sort_order,
      json_payload: a.json_payload,
    }));

    const { error } = await supabaseAdmin.from('generated_assets').upsert(rows, {
      onConflict: 'id',
    });
    if (error) throw new Error(`DB upsert failed: ${error.message}`);

    await completeJobStep(
      stepId,
      true,
      `Generated ${assets.length} articles (avg ${Math.round(assets.reduce((acc, a) => acc + String(a.body ?? '').length, 0) / assets.length)} chars)`,
    );

    const existingArticles = state.intermediate?.articleAssets ?? [];
    return {
      intermediate: {
        ...state.intermediate,
        articleAssets: [...existingArticles, ...assets],
      },
      runtime: {
        ...state.runtime,
        currentNode: 'ssot_materialization',
        completedNodes: [...state.runtime.completedNodes, 'article_generation'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return {
      runtime: {
        ...state.runtime,
        currentNode: 'article_generation',
        status: 'failed',
        errorMessage: msg,
      },
    };
  }
}
