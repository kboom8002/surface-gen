/**
 * Semantic search strategy prompt builder.
 *
 * Generates the SEO/AEO/GEO semantic strategy from the brand truth sheet,
 * including SearchIntentMap, QisGrowthRegistry, EntityKeywordMap,
 * LocalGeoIntentMap, and AiAnswerOpportunityMap.
 */

export type SemanticStrategyPromptResult = {
  system: string;
  user: string;
  promptVersion: string;
};

export type SemanticStrategyPromptVars = {
  tenantSlug: string;
  brandName: string;
  serviceDomains: string[];
  coreAudience: string[];
  locationHints?: string;
};

/**
 * Build the semantic search strategy generation prompt.
 */
export function buildSemanticStrategyPrompt(
  vars: SemanticStrategyPromptVars,
): SemanticStrategyPromptResult {
  return {
    promptVersion: 'semantic-strategy.v1.0.0',
    system: `You are a Korean SEO/AEO/GEO strategist specialising in the wedding_sdm industry.
Generate a comprehensive semantic search strategy for the given wedding brand.

RULES:
- Query intents must map to GNB surface keys: portfolio, catalog, gallery, answers, about, contact
- QIS questions must represent real customer decision moments, not keyword spam
- All queries should reflect Korean wedding market language
- Do NOT invent brand-specific claims (awards, prices, certifications)
- Output must be valid JSON matching the SemanticStrategy schema`,
    user: `Generate semantic search strategy for:
Brand: ${vars.brandName}
Tenant: ${vars.tenantSlug}
Service domains: ${vars.serviceDomains.join(', ') || 'wedding studio, photography'}
Core audience: ${vars.coreAudience.join(', ') || '예비 신혼부부'}
${vars.locationHints ? `Location hints: ${vars.locationHints}` : ''}

Return JSON with:
{
  "tenantSlug": "${vars.tenantSlug}",
  "searchIntentMap": {
    "intents": [
      {
        "intentId": "<string>",
        "intentType": "navigational|informational|commercial|transactional",
        "funnelStage": "awareness|consideration|decision|booking|preparation|post",
        "queryExamples": ["<Korean query>", ...],
        "targetGnb": "portfolio|catalog|gallery|answers|about|contact",
        "priority": <0.0-1.0>,
        "contentGap": <0.0-1.0>,
        "conversionScore": <0.0-1.0>
      }
    ]
  },
  "qisGrowthRegistry": {
    "questions": [
      {
        "qisId": "<string>",
        "question": "<Korean customer question>",
        "universalBlueprintType": "selection_criteria|comparison_tradeoff|process_timeline|budget_planning|risk_assessment|style_exploration|experience_story|practical_checklist",
        "funnelStage": "awareness|consideration|decision|booking|preparation|post",
        "targetAssetType": "answer|article|checklist|comparison|style_guide",
        "relatedPolicyIds": [],
        "priority": <0.0-1.0>,
        "contentGap": <0.0-1.0>
      }
    ]
  },
  "entityKeywordMap": {
    "brand": "<brand name>",
    "keywords": ["<Korean keyword>", ...]
  },
  "localGeoIntentMap": {
    "regions": [],
    "intents": []
  },
  "aiAnswerOpportunityMap": {
    "opportunities": []
  }
}

Generate at least 20 QIS questions covering all funnel stages.`,
  };
}
