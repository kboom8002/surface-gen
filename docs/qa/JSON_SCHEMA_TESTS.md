# JSON Schema Tests

## 1. Purpose

JSON Schema tests ensure all generated output files conform to the expected shape before export.

The product must validate both core onboarding JSON files and advanced strategy files.

---

## 2. Core Files Under Test

```yaml
core_files:
  - universal_content_assets_final.json
  - brand_profiles.json
  - design_config.json
  - gnb_ia_config.json
  - gallery_albums.json
  - gallery_photos.json
  - album_taxonomy_nodes.json
  - visual_asset_url_map_master.json
```

---

## 3. Advanced Files Under Test

```yaml
advanced_files:
  semantic_strategy:
    - search_intent_map.json
    - qis_growth_registry.json
    - entity_keyword_map.json
    - local_geo_intent_map.json
    - ai_answer_opportunity_map.json
  knowledge_graph:
    - brand_knowledge_graph.json
    - entity_registry.json
    - entity_relation_edges.json
    - claim_proof_boundary_graph.json
    - semantic_surface_map.json
  schema:
    - schema_readiness_map.json
    - jsonld_generation_plan.json
    - rich_result_eligibility_report.json
  ux_copy:
    - copy_system.json
    - microcopy_library.json
    - cta_strategy_map.json
    - form_ux_intent_capture_map.json
  visual_experience:
    - visual_experience_map.json
    - page_visual_sequence_map.json
    - ai_visual_brief_pack.json
    - image_crop_and_layout_map.json
  growth:
    - growth_experiment_backlog.json
    - content_refresh_calendar.json
    - ai_visibility_observation_plan.json
    - search_console_observation_plan.json
    - conversion_experiment_plan.json
```

---

## 4. Test Strategy

```yaml
test_strategy:
  zod_parse:
    description: Every generated file must parse against package schema.
  required_fields:
    description: Required fields must exist for all public records.
  enum_values:
    description: type/category/status/review_status enums must be valid.
  relation_resolution:
    description: IDs referenced across files must resolve.
  snapshot_safety:
    description: Golden fixture outputs should remain stable unless spec changes.
```

---

## 5. Suggested Test Files

```text
tests/unit/json-schema/core-output-schema.test.ts
tests/unit/json-schema/advanced-output-schema.test.ts
tests/unit/json-schema/uca-schema.test.ts
tests/unit/json-schema/gallery-schema.test.ts
tests/unit/json-schema/knowledge-graph-schema.test.ts
tests/unit/json-schema/export-bundle-schema.test.ts
```

---

## 6. Acceptance Criteria

```yaml
accepted_when:
  - invalid fixture fails with expected error
  - valid fixture passes
  - required 8 JSON files all have schema coverage
  - advanced files all have schema coverage by v1
```
