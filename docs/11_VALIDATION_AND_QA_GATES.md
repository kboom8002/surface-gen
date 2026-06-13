# 11. Validation and QA Gates

## 1. Purpose

This document defines the validation system for the Wedding Surface Agent.

The product must never treat LLM output as production-ready until it passes:

1. structured output validation
2. Zod schema parsing
3. deterministic validation
4. policy and truth checks
5. human review when required
6. export preflight

The validation system is a product feature, not a technical afterthought.

---

## 2. Validation Philosophy

```yaml
validation_principles:
  fail_safely:
    rule: Invalid or risky outputs must become draft, review_required, or blocked.

  deterministic_first:
    rule: Use code validators before asking an LLM to repair content.

  repair_with_limits:
    rule: Repair loops are capped and must report unresolved issues.

  public_output_strict:
    rule: Public CMS assets require stronger validation than draft/internal assets.

  traceable:
    rule: Every failure should point to file, asset id, field, reason, and recommended action.
```

---

## 3. Validation Layers

```yaml
validation_layers:
  layer_1_schema:
    owner: packages/schemas
    checks:
      - Zod parsing
      - enum validity
      - required fields
      - payload shape

  layer_2_deterministic:
    owner: packages/validators
    checks:
      - character length
      - forbidden type
      - duplicate id
      - relation resolution
      - image path resolution
      - ZIP manifest consistency

  layer_3_semantic:
    owner: worker validation nodes
    checks:
      - visible-only image description
      - unsupported claim risk
      - AI visual misuse
      - weak answer extractability

  layer_4_human:
    owner: reviewer UI
    checks:
      - image rights
      - price/policy facts
      - customer reviews
      - awards/certifications
      - AI visual public approval

  layer_5_export:
    owner: packaging service
    checks:
      - required files exist
      - only canonical final files are in 01_upload
      - sha256 manifest matches
      - no blocking QA issue remains
```

---

## 4. Advanced 12-Gate Pipeline

### Gate 01. UTF-8 Encoding Gate

```yaml
id: gate_01_encoding
severity: fatal
checks:
  - all JSON files are UTF-8
  - all JSON files parse successfully
  - no invalid control characters
  - no replacement-character corruption
fail_action:
  - block_export
```

### Gate 02. Content Density Gate

```yaml
id: gate_02_content_density
severity: fatal_for_public_assets
checks:
  - body exists for detailed public assets
  - body_richtext exists for detailed public assets
  - body_richtext is not equal to summary
  - type-specific minimum Korean character counts are met
minimums:
  about_brand: 900
  brand_truth: 500
  portfolio_docent: 1000
  style_collection: 800
  program: 1000
  policy_card: 600
  answer: 650
  article: 3000
  contact_info: 500
  match_brief: 500
repair_action:
  - body_expansion_node
```

### Gate 03. SSoT Type and Registry Gate

```yaml
id: gate_03_type_registry
severity: fatal
checks:
  - all UCA types are allowed for wedding_sdm
  - forbidden public UCA types are absent
  - category mapping is valid
  - status/review_status enums are valid
forbidden_types:
  - gallery_photos
  - answer_faq
  - package
  - guide_article
  - image_asset
  - page_config
repair_action:
  - type_mapping_patch_node
```

### Gate 04. UCA Dedup Gate

```yaml
id: gate_04_uca_dedup
severity: fatal
checks:
  - UCA ids are unique
  - only one universal_content_assets_final.json exists in 01_upload
  - QA/reference files do not contain competing universal_content_assets payloads
  - no duplicate slug within same type and tenant
repair_action:
  - dedup_patch_node
```

### Gate 05. GNB/IA Sync Gate

```yaml
id: gate_05_gnb_ia_sync
severity: fatal
checks:
  - all standard GNB keys exist or are intentionally disabled
  - every GNB node maps to allowed ssot_types
  - every public UCA category maps to a GNB surface
  - mobile bottom nav uses valid keys
standard_keys:
  - portfolio
  - catalog
  - gallery
  - answers
  - about
  - contact
repair_action:
  - gnb_relation_patch_node
```

### Gate 06. SEO/AEO Readiness Gate

```yaml
id: gate_06_seo_aeo_readiness
severity: blocking_for_v1
checks:
  - seo_title exists for public detailed assets
  - meta_description exists for public detailed assets
  - answer_first_sentence exists for answers
  - article has toc, key_takeaways, h2 sections
  - image alt/caption coverage is acceptable
repair_action:
  - seo_aeo_patch_node
```

### Gate 07. Knowledge Graph Integrity Gate

```yaml
id: gate_07_knowledge_graph_integrity
severity: blocking_for_v1
checks:
  - brand node exists
  - major asset nodes exist
  - claim nodes have proof or boundary
  - orphan entity count is below threshold
  - KG edge references resolve
repair_action:
  - knowledge_graph_repair_node
```

### Gate 08. Schema.org Readiness Gate

```yaml
id: gate_08_schema_readiness
severity: blocking_for_v1
checks:
  - each eligible asset has target schema type
  - required fields are present or explicitly missing
  - rich result eligibility is reported
  - JSON-LD generation plan is valid
repair_action:
  - schema_readiness_patch_node
```

### Gate 09. AI Answer Extractability Gate

```yaml
id: gate_09_ai_answer_extractability
severity: blocking_for_v1
checks:
  - answer_first_sentence is direct and self-contained
  - answer_short gives a complete answer
  - decision_criteria exists
  - caution exists for risk/commercial questions
  - source_basis exists
repair_action:
  - answer_rewrite_node
```

### Gate 10. Visual Experience Gate

```yaml
id: gate_10_visual_experience
severity: blocking_for_v1
checks:
  - actual photos and AI visuals are separated
  - public AI visuals include disclosure
  - can_represent_actual_work is false for AI visuals
  - mobile crop rules exist for key visuals
  - page visual sequence exists
repair_action:
  - visual_experience_patch_node
```

### Gate 11. UX Copy Quality Gate

```yaml
id: gate_11_ux_copy_quality
severity: blocking_for_v1
checks:
  - CTA maps to next best action
  - page tone matches customer state
  - microcopy exists for forms and empty states
  - repetition watchlist is respected
  - no vague CTA-only copy
repair_action:
  - ux_copy_rewrite_node
```

### Gate 12. Growth Operability Gate

```yaml
id: gate_12_growth_operability
severity: blocking_for_v1
checks:
  - content_refresh_calendar exists
  - growth_experiment_backlog exists
  - ai_visibility_observation_plan exists
  - search_console_observation_plan exists
  - update triggers exist by asset type
repair_action:
  - growth_plan_patch_node
```

---

## 5. Gate Result Shape

```ts
export type GateResult = {
  gateId: string;
  gateName: string;
  status: 'pass' | 'warning' | 'fail' | 'blocked';
  severity: 'info' | 'warning' | 'blocking' | 'fatal';
  checkedAt: string;
  failures: GateFailure[];
  warnings: GateWarning[];
  summary: string;
};

export type GateFailure = {
  code: string;
  message: string;
  fileName?: string;
  assetId?: string;
  fieldPath?: string;
  expected?: unknown;
  actual?: unknown;
  recommendedAction: string;
  repairNode?: string;
};
```

---

## 6. Export Blocking Rules

```yaml
export_blocking_rules:
  block_if:
    - any fatal gate fails
    - required 8 JSON files missing
    - invalid JSON exists
    - forbidden UCA type exists
    - unresolved public image rights exist
    - AI visual is marked as actual work
    - critical human review item remains open
  allow_conditional_if:
    - warnings exist but no fatal/blocking issue
    - review_required assets are draft or excluded from public export
```

---

# Handoff Validation Gate Extension

Add a Handoff Import Gate to the QA pipeline.

```yaml
handoff_import_gate:
  checks:
    - handoff manifest schema valid
    - type-specific manifest schema valid
    - image paths resolve
    - sha256 matches if provided
    - imported actual photos have rights status
    - AI visuals have can_represent_actual_work false
    - AI visuals preserve prompt_id and visual_asset_id mapping
    - disclosure text exists when required
```

Failure behavior:

```yaml
fatal:
  - invalid manifest JSON
  - path traversal attempt
  - AI visual marked as actual_photo
  - visual_asset_id not found in exported prompt package

review_required:
  - unknown image rights
  - low confidence photo metadata
  - possible customer identity exposure
```
