# Structured Output Schemas

## 1. Purpose

This document defines the structured output schemas that model calls must target. The implementation source of truth is `packages/schemas` using Zod.

No model output should be accepted unless it conforms to one of these schemas.

## 2. Schema Package Layout

```text
packages/schemas/src/
├── index.ts
├── common.ts
├── brand-factsheet.ts
├── input-readiness.ts
├── brand-truth.ts
├── gnb-ia.ts
├── photo-taxonomy.ts
├── gallery.ts
├── ssot-uca.ts
├── semantic-strategy.ts
├── knowledge-graph.ts
├── schema-readiness.ts
├── ux-copy.ts
├── visual-experience.ts
├── ai-visual.ts
├── growth.ts
├── qa.ts
└── export-bundle.ts
```

## 3. Common Enums

```ts
export const IndustryTypeSchema = z.enum(['wedding_sdm']);

export const ReviewStatusSchema = z.enum([
  'approved',
  'review_required',
  'rejected',
  'internal_only',
]);

export const AssetStatusSchema = z.enum([
  'active',
  'draft',
  'suspended',
]);
```

## 4. UCA Type Schema

```ts
export const WeddingUcaTypeSchema = z.enum([
  'about_brand',
  'brand_truth',
  'evidence',
  'portfolio',
  'gallery',
  'portfolio_docent',
  'style_collection',
  'program',
  'product',
  'compare',
  'policy_card',
  'process_step',
  'answer',
  'article',
  'checklist',
  'style_guide',
  'contact_info',
  'match_brief',
  'cta_block',
  'review',
  'case_study',
  'person',
  'creator',
  'brand_story',
  'vendor_partner',
  'web_presence',
  'comparison',
]);
```

Forbidden types must be checked by validators:

```ts
export const ForbiddenPublicUcaTypes = [
  'gallery_photos',
  'answer_faq',
  'package',
  'guide_article',
  'image_asset',
  'page_config',
] as const;
```

## 5. InputReadinessReportSchema

Required fields:

```yaml
InputReadinessReport:
  readiness_score: number
  readiness_level: not_ready | minimum_ready | standard_ready | turnkey_ready
  available_inputs_summary: object
  missing_critical_fields: array
  review_required_items: array
  image_rights_risk: low | medium | high | critical
  next_required_actions: array
```

## 6. BrandTruthSheetSchema

Required sections:

```yaml
BrandTruthSheet:
  strategic_truth:
  operational_truth:
  facts:
  assumptions:
  needs_confirmation:
  forbidden_claims:
  allowed_claims:
  claim_boundaries:
```

Each allowed claim must include:

```yaml
AllowedClaim:
  claim_id:
  claim_text:
  proof:
  boundary:
  status: allowed | limited | hold | prohibited
  source_basis:
```

## 7. GnbIaConfigSchema

Required fields:

```yaml
GnbIaConfig:
  industry_type: wedding_sdm
  ia_version:
  desktop_gnb:
  mobile_bottom_nav:
  nodes:
  alias_map:
```

Desktop GNB must include standard keys:

```yaml
standard_keys:
  - portfolio
  - catalog
  - gallery
  - answers
  - about
  - contact
```

## 8. PhotoTaxonomyRecordSchema

Required fields:

```yaml
PhotoTaxonomyRecord:
  tenant_id:
  album_id:
  photo_id:
  image_path:
  visual_facts:
    visible_subject:
    visible_space:
    indoor_outdoor:
    lighting_condition:
    main_pose_or_action:
    visible_objects:
  taxonomy:
    service_domain:
    scene_type:
    subject_tags:
    mood_tags:
    style_tags:
    composition_tags:
    usage_role:
    vibe_vector:
  qa:
    confidence:
    uncertainty_note:
    human_review_required:
    forbidden_claims_checked:
```

## 9. PhotoDocentRecordSchema

Required fields:

```yaml
PhotoDocentRecord:
  tenant_id:
  album_id:
  photo_id:
  alt:
  caption:
  scene_note:
  style_note:
  recommended_for:
  qa:
    confidence:
    human_review_required:
```

Length rules are deterministic validator rules, not only schema rules.

## 10. UniversalContentAssetSchema

Required fields:

```yaml
UniversalContentAsset:
  id:
  tenant_id:
  type:
  category:
  title:
  slug:
  summary:
  status:
  review_status:
  sort_order:
  pinned:
  body:
  body_richtext:
  json_payload:
  relations:
  seo:
```

## 11. Semantic Strategy Schemas

Schemas:

```yaml
SearchIntentMap:
  intents:
    - intent_id
    - intent_type
    - query_examples
    - target_gnb
    - target_asset_types
    - funnel_stage
    - priority_score

QisGrowthRegistry:
  questions:
    - qid
    - canonical_question
    - query_variants
    - user_intent
    - funnel_stage
    - search_surface
    - target_asset_type
    - related_entity_ids
    - priority_score
    - update_frequency

EntityKeywordMap:
  entities:
    - entity_id
    - entity_type
    - canonical_label
    - synonyms
    - related_queries
    - target_assets
```

## 12. Knowledge Graph Schemas

```yaml
BrandKnowledgeGraph:
  nodes:
    - node_id
    - node_type
    - label
    - payload
    - confidence
    - source_basis
  edges:
    - from
    - relation
    - to
    - confidence
    - evidence_ids
```

## 13. Schema Readiness Schemas

```yaml
SchemaReadinessMap:
  per_asset:
    - uca_id
    - ssot_type
    - target_schema_type
    - required_schema_fields
    - available_fields
    - missing_fields
    - rich_result_eligibility
    - recommended_patch
```

## 14. UX Copy Schemas

```yaml
CopySystem:
  brand_voice:
  page_copy_rules:
  microcopy_library:
  repetition_watchlist:

CtaStrategyMap:
  low_intent:
  mid_intent:
  high_intent:
  risk_resolution:
  visual_preference:
```

## 15. AI Visual Schemas

```yaml
AiVisualBrief:
  visual_asset_id:
  target_page:
  target_block:
  visual_job_to_be_done:
  source_ssot_refs:
  positive_prompt:
  negative_prompt:
  aspect_ratio:
  mobile_crop_safe_area:
  disclosure_text:
  can_represent_actual_work: false
  qa_checklist:
```

## 16. QA Schemas

```yaml
GateResult:
  gate_id:
  gate_name:
  status: pass | warning | fail
  severity:
  checked_items:
  failures:
  warnings:
  repair_suggestions:

QaReport:
  overall_status:
  gate_results:
  fatal_errors:
  warnings:
```

## 17. Export Bundle Schema

```yaml
ExportBundleManifest:
  project_id:
  tenant_slug:
  generated_at:
  required_files:
  advanced_files:
  image_files:
  sha256_manifest:
  package_status:
```

## 18. Implementation Rule

The markdown schemas in this document are descriptive. The executable source of truth must be Zod schemas in `packages/schemas`.
