# 12-Gate Validation Spec

## 1. Purpose

This file provides implementable specifications for the 12 validation gates.

Each gate must be implemented as a deterministic validator where possible. LLM-based evaluation may be used only for semantic assessment and repair suggestions.

---

## 2. Validator Interface

```ts
export type ValidatorContext = {
  projectId: string;
  tenantId: string;
  files: GeneratedJsonFile[];
  assets: UniversalContentAsset[];
  galleryAlbums: GalleryAlbum[];
  galleryPhotos: GalleryPhoto[];
  visualAssets: VisualAssetMapRecord[];
  advancedOutputs: Record<string, unknown>;
};

export type Validator = (context: ValidatorContext) => Promise<GateResult> | GateResult;
```

---

## 3. Required Gate Implementations

```yaml
gate_implementations:
  gate_01_encoding:
    function: validateEncodingAndJson
    deterministic: true

  gate_02_content_density:
    function: validateContentDensity
    deterministic: true

  gate_03_type_registry:
    function: validateSsotTypeRegistry
    deterministic: true

  gate_04_uca_dedup:
    function: validateUcaDedup
    deterministic: true

  gate_05_gnb_ia_sync:
    function: validateGnbIaSync
    deterministic: true

  gate_06_seo_aeo_readiness:
    function: validateSeoAeoReadiness
    deterministic: mostly

  gate_07_knowledge_graph_integrity:
    function: validateKnowledgeGraphIntegrity
    deterministic: true

  gate_08_schema_readiness:
    function: validateSchemaReadiness
    deterministic: true

  gate_09_ai_answer_extractability:
    function: validateAiAnswerExtractability
    deterministic: mostly

  gate_10_visual_experience:
    function: validateVisualExperience
    deterministic: mostly

  gate_11_ux_copy_quality:
    function: validateUxCopyQuality
    deterministic: mixed

  gate_12_growth_operability:
    function: validateGrowthOperability
    deterministic: true
```

---

## 4. MVP vs v1 Gate Requirements

```yaml
mvp_required:
  - gate_01_encoding
  - gate_02_content_density
  - gate_03_type_registry
  - gate_04_uca_dedup
  - gate_05_gnb_ia_sync
  - gate_06_seo_aeo_readiness

v1_required:
  - all_12_gates
```

---

## 5. Repair Mapping

```yaml
repair_mapping:
  invalid_json:
    repair_node: json_repair_node
  content_density_fail:
    repair_node: body_expansion_node
  forbidden_type:
    repair_node: ssot_type_mapping_node
  duplicate_uca_id:
    repair_node: id_slug_repair_node
  unresolved_relation:
    repair_node: relation_resolver_node
  missing_seo:
    repair_node: seo_metadata_node
  weak_answer:
    repair_node: answer_rewrite_node
  unsupported_claim:
    repair_node: claim_boundary_rewrite_node
  ai_visual_policy_fail:
    repair_node: ai_visual_policy_rewrite_node
```

---

## 6. Report Requirements

Every validation run must produce:

```yaml
validation_report:
  project_id:
  run_id:
  status: pass | warning | fail | blocked
  gate_results:
  fatal_count:
  warning_count:
  repairable_count:
  human_review_required_count:
  export_allowed:
  generated_at:
```

---

## 7. Acceptance Criteria

```yaml
accepted_when:
  - all gates return typed GateResult
  - every failure has code and recommendedAction
  - repairable failures map to a repair node
  - fatal failures block export
  - validation report can be rendered in QA Center UI
```
