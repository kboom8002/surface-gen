import { z } from 'zod';

/**
 * Semantic search strategy schemas.
 * Output of the semantic_strategy node — covers SEO/AEO/GEO intent structures.
 *
 * Key structures:
 *   SearchIntentMap      — maps customer query intents to GNB surfaces
 *   QisGrowthRegistry   — Question-Intent-Surface registry for AEO/GEO
 *   EntityKeywordMap    — brand entity → keyword associations
 *   LocalGeoIntentMap   — location-based intent clusters
 *   AiAnswerOpportunityMap — AI answer engine opportunity targets
 */

// ── Search Intent ─────────────────────────────────────────────────────────────

export const IntentTypeSchema = z.enum([
  'navigational',
  'informational',
  'commercial',
  'transactional',
]);

export const FunnelStageSchema = z.enum([
  'awareness',
  'consideration',
  'decision',
  'booking',
  'preparation',
  'post',
]);

export const GnbSurfaceKeySchema = z.enum([
  'portfolio',
  'catalog',
  'gallery',
  'answers',
  'about',
  'contact',
]);

export const SearchIntentItemSchema = z.object({
  intentId: z.string().min(1),
  intentType: IntentTypeSchema,
  funnelStage: FunnelStageSchema,
  queryExamples: z.array(z.string()).min(1),
  targetGnb: GnbSurfaceKeySchema,
  priority: z.number().min(0).max(1),
  contentGap: z.number().min(0).max(1),
  conversionScore: z.number().min(0).max(1),
});

export const SearchIntentMapSchema = z.object({
  intents: z.array(SearchIntentItemSchema),
});

// ── QIS Growth Registry ───────────────────────────────────────────────────────

export const UniversalBlueprintTypeSchema = z.enum([
  'selection_criteria',
  'comparison_tradeoff',
  'process_timeline',
  'budget_planning',
  'risk_assessment',
  'style_exploration',
  'experience_story',
  'practical_checklist',
]);

export const QisItemSchema = z.object({
  qisId: z.string().min(1),
  question: z.string().min(1),
  universalBlueprintType: UniversalBlueprintTypeSchema,
  funnelStage: FunnelStageSchema,
  targetAssetType: z.string().min(1),
  relatedPolicyIds: z.array(z.string()),
  priority: z.number().min(0).max(1),
  contentGap: z.number().min(0).max(1),
});

export const QisGrowthRegistrySchema = z.object({
  questions: z.array(QisItemSchema).min(1),
});

// ── Entity Keyword Map ────────────────────────────────────────────────────────

export const EntityKeywordMapSchema = z.object({
  brand: z.string().min(1),
  keywords: z.array(z.string()),
  semanticClusters: z
    .array(
      z.object({
        clusterId: z.string(),
        clusterName: z.string(),
        keywords: z.array(z.string()),
      }),
    )
    .optional(),
});

// ── Local Geo Intent Map ──────────────────────────────────────────────────────

export const LocalGeoIntentItemSchema = z.object({
  region: z.string().min(1),
  queryExamples: z.array(z.string()),
  targetGnb: GnbSurfaceKeySchema,
  priority: z.number().min(0).max(1),
});

export const LocalGeoIntentMapSchema = z.object({
  regions: z.array(z.string()),
  intents: z.array(LocalGeoIntentItemSchema),
});

// ── AI Answer Opportunity Map ─────────────────────────────────────────────────

export const AiAnswerOpportunitySchema = z.object({
  opportunityId: z.string().min(1),
  question: z.string().min(1),
  engineTarget: z.enum(['google_ai_overviews', 'chatgpt', 'perplexity', 'naver_ai', 'general']),
  targetAssetType: z.string().min(1),
  priority: z.number().min(0).max(1),
});

export const AiAnswerOpportunityMapSchema = z.object({
  opportunities: z.array(AiAnswerOpportunitySchema),
});

// ── Top-level Semantic Strategy ───────────────────────────────────────────────

export const SemanticStrategySchema = z.object({
  tenantSlug: z.string().min(1),
  searchIntentMap: SearchIntentMapSchema,
  qisGrowthRegistry: QisGrowthRegistrySchema,
  entityKeywordMap: EntityKeywordMapSchema,
  localGeoIntentMap: LocalGeoIntentMapSchema.optional(),
  aiAnswerOpportunityMap: AiAnswerOpportunityMapSchema.optional(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type IntentType = z.infer<typeof IntentTypeSchema>;
export type FunnelStage = z.infer<typeof FunnelStageSchema>;
export type GnbSurfaceKey = z.infer<typeof GnbSurfaceKeySchema>;
export type SearchIntentItem = z.infer<typeof SearchIntentItemSchema>;
export type SearchIntentMap = z.infer<typeof SearchIntentMapSchema>;
export type UniversalBlueprintType = z.infer<typeof UniversalBlueprintTypeSchema>;
export type QisItem = z.infer<typeof QisItemSchema>;
export type QisGrowthRegistry = z.infer<typeof QisGrowthRegistrySchema>;
export type EntityKeywordMap = z.infer<typeof EntityKeywordMapSchema>;
export type LocalGeoIntentMap = z.infer<typeof LocalGeoIntentMapSchema>;
export type AiAnswerOpportunityMap = z.infer<typeof AiAnswerOpportunityMapSchema>;
export type SemanticStrategy = z.infer<typeof SemanticStrategySchema>;
