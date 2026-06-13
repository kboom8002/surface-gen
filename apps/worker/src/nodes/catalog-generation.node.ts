import { randomUUID } from 'crypto';
import { z } from 'zod';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { getModelForTask } from '../services/model-client.js';
import { UniversalContentAssetSchema } from '@surface-gen/schemas';
import { supabaseAdmin } from '../services/supabase-admin.js';

const CatalogOutputSchema = z.object({
  programs: z.array(z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(50),
    body_richtext: z.string().min(1000), // Min 1000 characters for program
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  })).min(1).max(4),
  policies: z.array(z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(50),
    body_richtext: z.string().min(600), // Min 600 characters for policy_card
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  })).min(1).max(3),
  process_steps: z.array(z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(30),
    body_richtext: z.string().min(200),
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  })).min(1).max(3),
});

const SYSTEM_PROMPT = `You are a professional Korean wedding studio coordinator and copywriter for the AIHompy platform.
Generate catalog content assets (programs, policies, and process steps) based on the brand truth provided.

CRITICAL RULES:
- Write ALL content in Korean (한국어).
- Never invent exact pricing or refund terms that are not explicitly verified. Mark missing pricing details with "review_required" or [검토 필요].
- Every "program" body_richtext must be at least 1000 Korean characters (including HTML tags).
- Every "policy_card" body_richtext must be at least 600 Korean characters (including HTML tags).
- Use proper HTML structures: h2, h3, p, ul, li, strong.
- The review_status for pricing-related programs and policies must be "review_required".
- Slugs must be lowercase English with hyphens only.
- Output ONLY valid JSON matching the schema. No markdown wrapping.`;

export async function catalogGenerationNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'catalog_generation');
  try {
    const tenantSlug = state.tenantSlug;
    const bt = state.intermediate.brandTruthSheet;
    const brandName = bt?.officialBrandName ?? tenantSlug;
    const positioning = bt?.positioning ?? '';
    const programsInfo = bt?.programs ?? [];
    const verifiedFacts = bt?.verifiedFacts?.map(f => `- ${f.fact} (source: ${f.source})`).join('\n') ?? '';
    const policiesInfo = bt?.policies ?? [];

    const userPrompt = `Brand: ${brandName}
TenantSlug: ${tenantSlug}
Positioning: ${positioning}
Verified Brand Facts:
${verifiedFacts}
Stated Programs in Facts:
${JSON.stringify(programsInfo, null, 2)}
Stated Policies in Facts:
${JSON.stringify(policiesInfo, null, 2)}

Please generate:
1. Wedding programs (type: "program", category: "catalog"). Each program's body_richtext must be at least 1000 characters.
2. Policies (type: "policy_card", category: "catalog"). Each policy_card's body_richtext must be at least 600 characters.
3. Process steps (type: "process_step", category: "catalog").`;

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
    if (!jsonMatch) throw new Error('No JSON found in Catalog Generation response');

    const rawData: unknown = JSON.parse(jsonMatch[0]);
    const parsed = CatalogOutputSchema.parse(rawData);

    const assets = [
      ...parsed.programs.map((p, idx) =>
        UniversalContentAssetSchema.parse({
          id: randomUUID(),
          tenant_id: tenantSlug,
          type: 'program' as const,
          category: 'catalog',
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          body: p.body_richtext.replace(/<[^>]+>/g, ''),
          body_richtext: p.body_richtext,
          status: 'draft' as const,
          review_status: 'review_required' as const, // Pricing and specifics always require review
          sort_order: idx,
          json_payload: {
            seo_title: p.seo_title ?? `${p.title} | ${brandName}`,
            meta_description: p.meta_description ?? p.summary,
            pricing_status: 'review_required',
          },
        }),
      ),
      ...parsed.policies.map((p, idx) =>
        UniversalContentAssetSchema.parse({
          id: randomUUID(),
          tenant_id: tenantSlug,
          type: 'policy_card' as const,
          category: 'catalog',
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          body: p.body_richtext.replace(/<[^>]+>/g, ''),
          body_richtext: p.body_richtext,
          status: 'draft' as const,
          review_status: 'review_required' as const,
          sort_order: 10 + idx,
          json_payload: {
            seo_title: p.seo_title ?? `${p.title} | ${brandName}`,
            meta_description: p.meta_description ?? p.summary,
            requires_review: true,
          },
        }),
      ),
      ...parsed.process_steps.map((p, idx) =>
        UniversalContentAssetSchema.parse({
          id: randomUUID(),
          tenant_id: tenantSlug,
          type: 'process_step' as const,
          category: 'catalog',
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          body: p.body_richtext.replace(/<[^>]+>/g, ''),
          body_richtext: p.body_richtext,
          status: 'active' as const,
          review_status: 'pending_review' as const,
          sort_order: 20 + idx,
          json_payload: {
            seo_title: p.seo_title ?? `${p.title} | ${brandName}`,
            meta_description: p.meta_description ?? p.summary,
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
      `Catalog: ${assets.length} assets generated & upserted.`,
    );

    return {
      intermediate: { ...state.intermediate, catalogAssets: assets },
      runtime: {
        ...state.runtime,
        currentNode: 'crosslink_schema',
        completedNodes: [...state.runtime.completedNodes, 'catalog_generation'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
