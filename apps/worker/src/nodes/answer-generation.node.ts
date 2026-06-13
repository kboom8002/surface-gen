import { randomUUID } from 'crypto';
import { z } from 'zod';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { getModelForTask } from '../services/model-client.js';
import { UniversalContentAssetSchema } from '@surface-gen/schemas';
import { supabaseAdmin } from '../services/supabase-admin.js';

const AnswerOutputSchema = z.object({
  answers: z.array(z.object({
    qis_id: z.string(),
    question: z.string(),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    body_richtext: z.string().min(650), // Min 650 characters for answer
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
    blueprint: z.string(),
    funnel: z.string(),
  })).min(1).max(5),
});

const SYSTEM_PROMPT = `You are a senior Korean wedding coordinator and content guide writer for the AIHompy platform.
Generate detailed answer content assets for the given QIS (Question-Intent-Search) questions using the brand truth.

CRITICAL RULES:
- Write ALL answer content in Korean (한국어).
- Never invent unverified reviews, certifications, or pricing.
- Every answer's body_richtext must be at least 650 Korean characters (including HTML tags).
- Use HTML tags: h2, h3, p, ul, li, strong.
- Slugs must be lowercase English with hyphens only.
- Output ONLY valid JSON matching the schema. No markdown wrapping.`;

export async function answerGenerationNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'answer_generation');
  try {
    const tenantSlug = state.tenantSlug;
    const bt = state.intermediate.brandTruthSheet;
    const brandName = bt?.officialBrandName ?? tenantSlug;
    const positioning = bt?.positioning ?? '';
    const verifiedFacts = bt?.verifiedFacts?.map(f => `- ${f.fact} (source: ${f.source})`).join('\n') ?? '';

    // Fetch QIS questions from strategy
    const strategy = state.intermediate.semanticStrategy as Record<string, unknown> | undefined;
    let qisQuestions: Array<Record<string, unknown>> = [];
    if (strategy && strategy['qisGrowthRegistry']) {
      const qis = strategy['qisGrowthRegistry'] as { questions: Array<Record<string, unknown>> };
      qisQuestions = qis.questions.slice(0, 3); // Take top 3 for MVP/E2E
    }

    // Fallback if strategy failed to provide QIS
    if (qisQuestions.length === 0) {
      qisQuestions = [
        { qis_id: 'qis_01', question_ko: '웨딩 스튜디오 선택 기준은 무엇인가요?', question_type: 'selection_criteria', answer_uca_type: 'answer', priority: 'p1' },
        { qis_id: 'qis_02', question_ko: '웨딩 촬영 비용은 얼마인가요?', question_type: 'budget_planning', answer_uca_type: 'answer', priority: 'p1' },
        { qis_id: 'qis_03', question_ko: '야외 촬영과 스튜디오 촬영의 차이는 무엇인가요?', question_type: 'comparison_tradeoff', answer_uca_type: 'answer', priority: 'p1' },
      ];
    }

    const userPrompt = `Brand: ${brandName}
TenantSlug: ${tenantSlug}
Brand Positioning: ${positioning}
Verified Facts:
${verifiedFacts}

Questions to answer:
${JSON.stringify(qisQuestions, null, 2)}

Generate detailed answers for these questions matching the Answer schema. Each answer's body_richtext must be at least 650 characters.`;

    const model = getModelForTask('structured_generation');
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
    if (!jsonMatch) throw new Error('No JSON found in Answer Generation response');

    const rawData: unknown = JSON.parse(jsonMatch[0]);
    const parsed = AnswerOutputSchema.parse(rawData);

    const answerAssets = parsed.answers.map((ans, idx) =>
      UniversalContentAssetSchema.parse({
        id: randomUUID(),
        tenant_id: tenantSlug,
        type: 'answer' as const, // NEVER 'answer_faq'
        category: 'answers',
        title: ans.question,
        slug: ans.slug,
        summary: ans.body_richtext.replace(/<[^>]+>/g, '').substring(0, 150),
        body: ans.body_richtext.replace(/<[^>]+>/g, ''),
        body_richtext: ans.body_richtext,
        status: 'active' as const,
        review_status: ans.question.includes('비용') || ans.question.includes('가격') ? 'review_required' as const : 'pending_review' as const,
        sort_order: idx,
        json_payload: {
          seo_title: ans.seo_title ?? `${ans.question} | ${brandName} 가이드`,
          meta_description: ans.meta_description ?? ans.body_richtext.replace(/<[^>]+>/g, '').substring(0, 150),
          universal_blueprint_type: ans.blueprint,
          funnel_stage: ans.funnel,
          qis_id: ans.qis_id,
        },
      }),
    );

    // Persist to DB
    const rows = answerAssets.map((a) => ({
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

    await completeJobStep(stepId, true, `Answers: ${answerAssets.length} assets generated & upserted.`);
    return {
      intermediate: { ...state.intermediate, answerAssets },
      runtime: {
        ...state.runtime,
        currentNode: 'article_generation',
        completedNodes: [...state.runtime.completedNodes, 'answer_generation'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
