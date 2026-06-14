import { randomUUID } from 'crypto';
import { z } from 'zod';
import { createJobStep, completeJobStep } from '../services/job-state-store';
import type { FactoryJobState } from '../state/factory-job-state';
import { getModelForTask } from '../services/model-client';
import { UniversalContentAssetSchema } from '@surface-gen/schemas';
import { supabaseAdmin } from '../services/supabase-admin';

const AboutContactOutputSchema = z.object({
  about_brand: z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(50),
    body_richtext: z.string().min(900), // Min 900 characters for about_brand
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  }),
  brand_story: z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(50),
    body_richtext: z.string().min(500),
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  }),
  contact_info: z.object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9_-]+$/),
    summary: z.string().min(50),
    body_richtext: z.string().min(500), // Min 500 characters for contact_info
    seo_title: z.string().optional(),
    meta_description: z.string().optional(),
  }),
});

const SYSTEM_PROMPT = `You are a senior Korean wedding studio marketer and brand story copywriter for the AIHompy platform.
Generate about_brand, brand_story, and contact_info content assets based on the brand truth provided.

CRITICAL RULES:
- Write ALL content in Korean (한국어).
- Never invent customer reviews, awards, certifications, or media mentions.
- Never invent unverified contact channels or exact addresses. If missing, mark them with "review_required" or [검토 필요].
- about_brand body_richtext must be at least 900 Korean characters.
- contact_info body_richtext must be at least 500 Korean characters.
- Use HTML tags (h2, h3, p, ul, li, strong).
- Slugs must be lowercase English with hyphens only.
- Output ONLY valid JSON matching the schema. No markdown wrapping.`;

export async function aboutContactGenerationNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'about_contact_generation');
  try {
    const tenantSlug = state.tenantSlug;
    const bt = state.intermediate.brandTruthSheet;
    const brandName = bt?.officialBrandName ?? tenantSlug;
    const positioning = bt?.positioning ?? '';
    const serviceDomains = bt?.serviceDomains ?? [];
    const verifiedFacts = bt?.verifiedFacts?.map(f => `- ${f.fact} (source: ${f.source})`).join('\n') ?? '';

    const userPrompt = `Brand: ${brandName}
TenantSlug: ${tenantSlug}
Positioning: ${positioning}
ServiceDomains: ${serviceDomains.join(', ')}
Verified Brand Facts:
${verifiedFacts}

Please generate:
1. about_brand (type: "about_brand", category: "about"). body_richtext >= 900 characters.
2. brand_story (type: "brand_story", category: "about").
3. contact_info (type: "contact_info", category: "contact"). body_richtext >= 500 characters.`;

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
    if (!jsonMatch) throw new Error('No JSON found in About/Contact Generation response');

    const rawData: unknown = JSON.parse(jsonMatch[0]);
    const parsed = AboutContactOutputSchema.parse(rawData);

    const assets = [
      UniversalContentAssetSchema.parse({
        id: randomUUID(),
        tenant_id: tenantSlug,
        type: 'about_brand' as const,
        category: 'about',
        title: parsed.about_brand.title,
        slug: parsed.about_brand.slug,
        summary: parsed.about_brand.summary,
        body: parsed.about_brand.body_richtext.replace(/<[^>]+>/g, ''),
        body_richtext: parsed.about_brand.body_richtext,
        status: 'active' as const,
        review_status: 'pending_review' as const,
        sort_order: 0,
        json_payload: {
          seo_title: parsed.about_brand.seo_title ?? `${parsed.about_brand.title} | ${brandName}`,
          meta_description: parsed.about_brand.meta_description ?? parsed.about_brand.summary,
        },
      }),
      UniversalContentAssetSchema.parse({
        id: randomUUID(),
        tenant_id: tenantSlug,
        type: 'brand_story' as const,
        category: 'about',
        title: parsed.brand_story.title,
        slug: parsed.brand_story.slug,
        summary: parsed.brand_story.summary,
        body: parsed.brand_story.body_richtext.replace(/<[^>]+>/g, ''),
        body_richtext: parsed.brand_story.body_richtext,
        status: 'active' as const,
        review_status: 'pending_review' as const,
        sort_order: 1,
        json_payload: {
          seo_title: parsed.brand_story.seo_title ?? `${parsed.brand_story.title} | ${brandName}`,
          meta_description: parsed.brand_story.meta_description ?? parsed.brand_story.summary,
        },
      }),
      UniversalContentAssetSchema.parse({
        id: randomUUID(),
        tenant_id: tenantSlug,
        type: 'contact_info' as const,
        category: 'contact',
        title: parsed.contact_info.title,
        slug: parsed.contact_info.slug,
        summary: parsed.contact_info.summary,
        body: parsed.contact_info.body_richtext.replace(/<[^>]+>/g, ''),
        body_richtext: parsed.contact_info.body_richtext,
        status: 'active' as const,
        review_status: 'review_required' as const, // Contact details always require human review
        sort_order: 2,
        json_payload: {
          seo_title: parsed.contact_info.seo_title ?? `${parsed.contact_info.title} | ${brandName}`,
          meta_description: parsed.contact_info.meta_description ?? parsed.contact_info.summary,
          requires_review: true,
        },
      }),
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
      `About/Contact: ${assets.length} assets generated & upserted.`,
    );

    return {
      intermediate: { ...state.intermediate, aboutContactAssets: assets },
      runtime: {
        ...state.runtime,
        currentNode: 'crosslink_schema',
        completedNodes: [...state.runtime.completedNodes, 'about_contact_generation'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
