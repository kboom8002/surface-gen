import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { GnbIaConfigSchema } from '@surface-gen/schemas';
import { getModelForTask } from '../services/model-client.js';

const SYSTEM_PROMPT = `You are a professional UX/IA strategist specializing in the Korean wedding industry (wedding_sdm).
Generate a GNB (Global Navigation Bar) and Information Architecture configuration for a wedding studio brand based on the brand truth provided.

CRITICAL RULES:
- Write ALL user-facing labels, page intents, customer questions, and primary CTAs in Korean (한국어).
- The industry_type must be "wedding_sdm".
- Standard wedding_sdm GNB must contain 5-7 top-level nodes mapping to standard tabs:
  1. portfolio (포트폴리오) -> template: "portfolio_list", ssot_types: ["portfolio", "portfolio_docent", "style_collection"]
  2. catalog (패키지·가격) -> template: "catalog_list", ssot_types: ["program", "product", "compare", "policy_card", "process_step"]
  3. gallery (갤러리) -> template: "gallery_grid", ssot_types: ["gallery"]
  4. answers (가이드·FAQ) -> template: "answers_list", ssot_types: ["answer", "article", "checklist", "comparison", "style_guide"]
  5. about (브랜드) -> template: "about_brand", ssot_types: ["about_brand", "brand_truth", "evidence", "person", "brand_story"]
  6. contact (상담·예약) -> template: "contact_form", ssot_types: ["contact_info", "match_brief", "cta_block"]
- Slugs/keys must stay in English as specified above.
- Refine the label, page_intent, customer_question, and primary_cta for each node based on the brand's specific positioning and verified facts.
- Output ONLY valid JSON matching the GnbIaConfig schema. No markdown wrapping.`;

export async function gnbIaNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'gnb_ia');
  try {
    const tenantSlug = state.tenantSlug;
    const bt = state.intermediate.brandTruthSheet;
    const brandName = bt?.officialBrandName ?? tenantSlug;
    const positioning = bt?.positioning ?? '';
    const serviceDomains = bt?.serviceDomains ?? [];

    const userPrompt = `Brand Name: ${brandName}
Tenant Slug: ${tenantSlug}
Brand Positioning: ${positioning}
Service Domains: ${serviceDomains.join(', ')}

Please generate the GNB/IA configuration matching the GnbIaConfig schema.
Structure:
{
  "tenant_slug": "${tenantSlug}",
  "industry_type": "wedding_sdm",
  "version": "1.0.0",
  "nodes": [
    {
      "key": "portfolio",
      "label": "포트폴리오",
      "href": "/portfolio",
      "template": "portfolio_list",
      "ssot_types": ["portfolio", "portfolio_docent", "style_collection"],
      "is_enabled": true,
      "page_intent": "Korean explanation of page intent specific to this brand",
      "customer_question": "Korean question this page answers",
      "primary_cta": "Korean CTA label tailored to this brand",
      "sort_order": 0
    },
    ... (continue for catalog, gallery, answers, about, contact)
  ],
  "mobile_bottom_nav": [
    { "key": "portfolio", "label": "포트폴리오", "icon": "camera", "href": "/portfolio" },
    { "key": "gallery", "label": "갤러리", "icon": "images", "href": "/gallery" },
    { "key": "answers", "label": "FAQ", "icon": "help", "href": "/answers" },
    { "key": "contact", "label": "상담", "icon": "phone", "href": "/contact" }
  ]
}`;

    const model = getModelForTask('planner');
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
    if (!jsonMatch) throw new Error('No JSON found in GNB/IA generation response');

    const rawConfig: unknown = JSON.parse(jsonMatch[0]);
    const gnbIaConfig = GnbIaConfigSchema.parse(rawConfig);

    await completeJobStep(stepId, true, `GNB/IA: ${gnbIaConfig.nodes.length} nodes`);
    return {
      intermediate: { ...state.intermediate, gnbIaConfig },
      runtime: {
        ...state.runtime,
        currentNode: 'photo_inventory',
        completedNodes: [...state.runtime.completedNodes, 'gnb_ia'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
