/**
 * GNB/IA node prompt builder.
 *
 * The GNB/IA for wedding_sdm is largely deterministic (6 standard nodes),
 * but this prompt supports LLM-assisted customisation of labels and metadata.
 *
 * Standard nodes (from GNB_STANDARD_KEYS): portfolio, catalog, gallery, answers, about, contact
 * Maximum top-level nodes: 7
 *
 * UCA type mapping rules (AGENTS.md):
 *   package → program
 *   packages/pricing → catalog section
 *   faq/guide → answers section
 */

export type GnbIaPromptResult = {
  system: string;
  user: string;
  promptVersion: string;
};

export type GnbIaPromptVars = {
  tenantSlug: string;
  brandName: string;
  serviceDomains: string[];
  preferredLanguage: 'ko' | 'en';
};

/**
 * Build the GNB/IA customisation prompt.
 * The deterministic skeleton is generated in the node itself;
 * this prompt is used for label/copy localisation if needed.
 */
export function buildGnbIaPrompt(vars: GnbIaPromptVars): GnbIaPromptResult {
  return {
    promptVersion: 'gnb-ia.v1.0.0',
    system: `You are a UX information architect for the wedding_sdm industry.
Generate a CMS-ready GNB/IA configuration for the given brand.

RULES:
- Must include exactly these 6 standard section keys: portfolio, catalog, gallery, answers, about, contact
- Maximum 7 top-level GNB nodes
- "packages" or "pricing" must map to the "catalog" section (NOT a new top-level node)
- "faq" or "guide" must map to the "answers" section (NOT a new top-level node)
- ssot_types must only contain allowed wedding_sdm UCA types
- Forbidden UCA types in ssot_types: gallery_photos, answer_faq, package, guide_article, image_asset, page_config
- Use "program" never "package" in ssot_types
- Output in ${vars.preferredLanguage === 'ko' ? 'Korean' : 'English'} for label fields`,
    user: `Generate GNB/IA for:
Brand: ${vars.brandName}
Tenant: ${vars.tenantSlug}
Service domains: ${vars.serviceDomains.join(', ')}

Return JSON matching GnbIaConfig schema with 6 nodes (portfolio, catalog, gallery, answers, about, contact).`,
  };
}
