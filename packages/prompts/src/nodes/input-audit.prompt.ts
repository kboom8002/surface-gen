/**
 * Input audit prompt builder.
 *
 * The input_audit node is deterministic (no LLM call needed for basic checks),
 * but this prompt is provided for optional LLM-assisted gap analysis
 * on factsheet content when text is available.
 */

export type InputAuditPromptVars = {
  officialBrandName: string;
  tenantSlug: string;
  factsheetFileCount: number;
  imageFileCount: number;
};

export type InputAuditPromptResult = {
  system: string;
  user: string;
  promptVersion: string;
};

/**
 * Build the prompt for LLM-assisted input readiness analysis.
 * Only used when a factsheet text is available for richer gap detection.
 */
export function buildInputAuditPrompt(vars: InputAuditPromptVars): InputAuditPromptResult {
  return {
    promptVersion: 'input-audit.v1.0.0',
    system: `You are an expert wedding brand onboarding specialist for the wedding_sdm industry.
Your task is to assess the readiness of the provided brand factsheet and image data.

SAFETY POLICY:
- Only assess what is actually present in the provided data.
- Do NOT invent, assume, or fabricate any missing information.
- Missing critical data must be listed in missingCritical.
- Output must be valid JSON matching the InputReadinessReport schema exactly.
- canProceed must be false if missingCritical is non-empty.`,
    user: `Assess the onboarding readiness for:
Brand: ${vars.officialBrandName}
Tenant: ${vars.tenantSlug}
Factsheet file count: ${vars.factsheetFileCount}
Image file count: ${vars.imageFileCount}

Return ONLY a JSON object with this exact shape:
{
  "overallScore": <number 0-100>,
  "hasBrandName": <boolean>,
  "hasFactsheet": <boolean>,
  "imageCount": <number>,
  "imageCountSufficient": <boolean — true if imageCount >= 20>,
  "missingCritical": <string[]>,
  "missingRecommended": <string[]>,
  "warnings": <string[]>,
  "canProceed": <boolean — false if missingCritical is non-empty>
}`,
  };
}
