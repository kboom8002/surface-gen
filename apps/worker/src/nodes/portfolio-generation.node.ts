import { z } from 'zod';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import { getModelForTask } from '../services/model-client.js';
import { UniversalContentAssetSchema } from '@surface-gen/schemas';
import { supabaseAdmin } from '../services/supabase-admin.js';
import { randomUUID } from 'crypto';

// ────────────────────────────────────────────────────────────────────────────
// Schema for LLM structured output
// ────────────────────────────────────────────────────────────────────────────
const PortfolioOutputSchema = z.object({
  portfolios: z.array(z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(50),
    body_richtext: z.string().min(500),
    style_tags: z.array(z.string()).max(5),
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  })).min(1).max(5),
  portfolio_docents: z.array(z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(50),
    body_richtext: z.string().min(800),
    linked_portfolio_slug: z.string(),
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  })).min(1).max(5),
  style_collections: z.array(z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(50),
    body_richtext: z.string().min(600),
    style_keywords: z.array(z.string()),
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  })).min(1).max(3),
});

const SYSTEM_PROMPT = `You are a senior Korean wedding brand copywriter for the AIHompy platform (wedding_sdm industry).
Generate portfolio content assets based on the brand truth sheet provided.

CRITICAL RULES:
- Write ALL content in Korean (한국어).
- Never invent customer reviews, awards, certifications, partnerships, or media mentions.
- Never invent exact prices, refund policies, or delivery guarantees.
- Mark any unverified claims with [검토 필요] instead of stating them as fact.
- portfolio_docent body_richtext must be at least 1000 Korean characters.
- style_collection body_richtext must be at least 800 Korean characters.
- Use HTML tags (h2, h3, p, ul, li, strong, em) in body_richtext.
- Slugs must be lowercase English with hyphens only (e.g., "natural-wedding-portfolio").
- Generate brand-specific content based ONLY on the provided brand truth — do NOT use generic templates.

OUTPUT: Return ONLY valid JSON matching the schema. No prose before or after.`;

export async function portfolioGenerationNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'portfolio_generation');
  try {
    const bt = state.intermediate?.brandTruthSheet;
    const brandName = bt?.officialBrandName ?? state.tenantSlug;
    const positioning = bt?.positioning ?? '';
    const serviceDomains = bt?.serviceDomains?.join(', ') ?? '웨딩 사진 촬영';
    const coreAudience = bt?.coreAudience?.join(', ') ?? '예비 신혼부부';
    const programs = bt?.programs?.map(p => p.name).join(', ') ?? '';
    const verifiedFacts = bt?.verifiedFacts?.map(f => `- ${f.fact} (출처: ${f.source})`).join('\n') ?? '';

    const userPrompt = `Brand: ${brandName}
TenantSlug: ${state.tenantSlug}
Positioning: ${positioning}
ServiceDomains: ${serviceDomains}
CoreAudience: ${coreAudience}
Programs: ${programs}
VerifiedFacts:
${verifiedFacts}

Generate portfolio content for this wedding studio brand.
Portfolios must reflect ONLY verified facts above. Missing info → use [검토 필요].

Return JSON:
{
  "portfolios": [
    {
      "title": "포트폴리오 제목 (Korean)",
      "slug": "portfolio-slug-en",
      "summary": "2-3 sentence Korean summary (min 50 chars)",
      "body_richtext": "<h2>...</h2><p>...min 500 Korean chars using HTML tags...</p>",
      "style_tags": ["natural", "editorial"],
      "seo_title": "SEO title Korean",
      "meta_description": "meta description Korean"
    }
  ],
  "portfolio_docents": [
    {
      "title": "도슨트 제목 (Korean)",
      "slug": "docent-slug-en",
      "summary": "Korean summary",
      "body_richtext": "<h2>...min 1000 Korean chars...</h2>",
      "linked_portfolio_slug": "matching-portfolio-slug",
      "seo_title": "SEO title",
      "meta_description": "meta desc"
    }
  ],
  "style_collections": [
    {
      "title": "스타일 컬렉션 제목",
      "slug": "style-collection-slug",
      "summary": "Korean summary",
      "body_richtext": "<h2>...min 800 Korean chars...</h2>",
      "style_keywords": ["natural", "romantic"],
      "seo_title": "SEO title",
      "meta_description": "meta desc"
    }
  ]
}

Generate 2-3 portfolios, 2-3 docents (one per portfolio), 1-2 style collections.`;

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
    if (!jsonMatch) throw new Error('No JSON found in portfolio generation response');

    const rawData: unknown = JSON.parse(jsonMatch[0]);
    const parsed = PortfolioOutputSchema.parse(rawData);

    // Build UCAs from parsed data
    const assets = [
      ...parsed.portfolios.map((p, i) =>
        UniversalContentAssetSchema.parse({
          id: randomUUID(),
          tenant_id: state.tenantSlug,
          type: 'portfolio' as const,
          category: 'portfolio',
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          body: p.body_richtext.replace(/<[^>]+>/g, ''),
          body_richtext: p.body_richtext,
          status: 'draft' as const,
          review_status: 'pending_review' as const,
          sort_order: i + 1,
          json_payload: {
            style_tags: p.style_tags,
            seo_title: p.seo_title ?? `${p.title} | ${brandName}`,
            meta_description: p.meta_description ?? p.summary,
          },
        }),
      ),
      ...parsed.portfolio_docents.map((d, i) =>
        UniversalContentAssetSchema.parse({
          id: randomUUID(),
          tenant_id: state.tenantSlug,
          type: 'portfolio_docent' as const,
          category: 'portfolio',
          title: d.title,
          slug: d.slug,
          summary: d.summary,
          body: d.body_richtext.replace(/<[^>]+>/g, ''),
          body_richtext: d.body_richtext,
          status: 'draft' as const,
          review_status: 'pending_review' as const,
          sort_order: 100 + i,
          json_payload: {
            linked_portfolio_slug: d.linked_portfolio_slug,
            seo_title: d.seo_title ?? `${d.title} | ${brandName}`,
            meta_description: d.meta_description ?? d.summary,
          },
        }),
      ),
      ...parsed.style_collections.map((sc, i) =>
        UniversalContentAssetSchema.parse({
          id: randomUUID(),
          tenant_id: state.tenantSlug,
          type: 'style_collection' as const,
          category: 'portfolio',
          title: sc.title,
          slug: sc.slug,
          summary: sc.summary,
          body: sc.body_richtext.replace(/<[^>]+>/g, ''),
          body_richtext: sc.body_richtext,
          status: 'draft' as const,
          review_status: 'pending_review' as const,
          sort_order: 200 + i,
          json_payload: {
            style_keywords: sc.style_keywords,
            seo_title: sc.seo_title ?? `${sc.title} | ${brandName}`,
            meta_description: sc.meta_description ?? sc.summary,
          },
        }),
      ),
    ];

    // Persist to DB
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
      `Generated ${assets.length} portfolio assets (${parsed.portfolios.length} portfolios, ${parsed.portfolio_docents.length} docents, ${parsed.style_collections.length} style collections)`,
    );

    const existingPortfolios = state.intermediate?.portfolioAssets ?? [];
    return {
      intermediate: {
        ...state.intermediate,
        portfolioAssets: [...existingPortfolios, ...assets],
      },
      runtime: {
        ...state.runtime,
        currentNode: 'catalog_generation',
        completedNodes: [...state.runtime.completedNodes, 'portfolio_generation'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return {
      runtime: {
        ...state.runtime,
        currentNode: 'portfolio_generation',
        status: 'failed',
        errorMessage: msg,
      },
    };
  }
}
