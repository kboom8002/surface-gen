/**
 * Brand truth prompt builder.
 *
 * Extracts and classifies brand truth from the raw factsheet text.
 * Outputs a BrandTruthSheet with verified facts, assumptions, review-required
 * fields, and forbidden claims.
 *
 * CRITICAL SAFETY RULES (must appear in every system prompt):
 * - Never invent customer reviews, awards, certifications, partnerships, or media mentions.
 * - Never invent exact prices, refund policies, or delivery guarantees.
 * - Missing or ambiguous data must go into reviewRequired, NOT be fabricated.
 * - Forbidden claims (e.g. "100% 만족 보장", "업계 최고") must be listed in forbiddenClaims.
 */

export type BrandTruthPromptResult = {
  system: string;
  user: string;
  promptVersion: string;
};

/**
 * Build the brand truth extraction prompt.
 *
 * @param factsheetText - Raw text extracted from the uploaded factsheet files.
 *                        Truncated to 8000 chars to stay within context limits.
 * @param tenantSlug    - Tenant identifier used to anchor the output.
 */
export function buildBrandTruthPrompt(
  factsheetText: string,
  tenantSlug: string,
): BrandTruthPromptResult {
  return {
    promptVersion: 'brand-truth.v1.0.0',
    system: `You are a wedding brand strategist for the wedding_sdm industry.
Extract and classify brand truth from the provided factsheet.

CRITICAL SAFETY RULES — follow these exactly:
1. Never invent customer reviews, awards, certifications, partnerships, or media mentions.
2. Never invent exact prices, refund policies, or delivery guarantees.
3. Missing or ambiguous data MUST go into "reviewRequired", NOT be fabricated.
4. Forbidden claims (예: "100% 만족 보장", "업계 최고", "추가금 절대 없음") MUST be in "forbiddenClaims".
5. Output must be valid JSON matching the BrandTruthSheet schema exactly.

SSoT TYPE RULES for wedding_sdm:
- Allowed types: about_brand, brand_truth, evidence, portfolio, gallery, portfolio_docent,
  style_collection, program, product, compare, policy_card, process_step, answer, article,
  checklist, style_guide, contact_info, match_brief, cta_block, review, case_study, person,
  creator, brand_story, vendor_partner, web_presence, comparison
- Forbidden types: gallery_photos, answer_faq, package, guide_article, image_asset, page_config
- ALWAYS use "program" — never "package"`,
    user: `Extract brand truth for tenant: ${tenantSlug}

Factsheet content:
---
${factsheetText.substring(0, 8000)}
---

Return ONLY a JSON object with this exact shape (omit optional fields if no data is available):
{
  "tenantSlug": "${tenantSlug}",
  "officialBrandName": "<string — required>",
  "positioning": "<string — 1 sentence, or omit>",
  "coreAudience": ["<audience segment>", ...],
  "doNotMisread": ["<misconception to avoid>", ...],
  "serviceDomains": ["<domain>", ...],
  "programs": [
    { "name": "<string>", "included": ["<string>"], "excluded": ["<string>"] }
  ],
  "pricingBasis": "<string or 'review_required'>",
  "policies": [
    { "type": "<cancellation|change|refund|etc>", "summary": "<string>" }
  ],
  "verifiedFacts": [
    { "fact": "<string>", "source": "<source in factsheet>" }
  ],
  "assumptions": [
    { "assumption": "<string>", "confidence": <0.0-1.0> }
  ],
  "reviewRequired": [
    { "field": "<field name>", "reason": "<why human review needed>" }
  ],
  "forbiddenClaims": ["<claim that cannot be published>", ...]
}`,
  };
}
