# ZIP Onboarding Output Specification

## 1. Purpose

This document defines the final ZIP output contract for the Wedding Surface Agent.

The ZIP package must be ready for AIHompy-style turnkey onboarding and must preserve all generated JSON, images, manifests, QA reports, and advanced SEO/AEO/GEO strategy files.

---

## 2. Canonical ZIP Name

```yaml
zip_file_name:
  format: "{tenant_slug}_factory_onboarding_final.zip"
  example: "studio_blanc_factory_onboarding_final.zip"
```

For development builds:

```yaml
dev_zip_file_name:
  format: "{tenant_slug}_factory_onboarding_draft_{YYYYMMDD_HHmm}.zip"
```

---

## 3. Canonical Folder Structure

```text
brand_onboarding_bundle/
├── 01_upload/
│   ├── universal_content_assets_final.json
│   ├── brand_profiles.json
│   ├── design_config.json
│   ├── gnb_ia_config.json
│   ├── gallery_albums.json
│   ├── gallery_photos.json
│   ├── album_taxonomy_nodes.json
│   └── visual_asset_url_map_master.json
├── 02_semantic_strategy/
│   ├── search_intent_map.json
│   ├── qis_growth_registry.json
│   ├── entity_keyword_map.json
│   ├── local_geo_intent_map.json
│   └── ai_answer_opportunity_map.json
├── 03_knowledge_graph/
│   ├── brand_knowledge_graph.json
│   ├── entity_registry.json
│   ├── entity_relation_edges.json
│   ├── claim_proof_boundary_graph.json
│   └── semantic_surface_map.json
├── 04_schema/
│   ├── schema_readiness_map.json
│   ├── jsonld_generation_plan.json
│   └── rich_result_eligibility_report.json
├── 05_ux_copy/
│   ├── copy_system.json
│   ├── microcopy_library.json
│   ├── cta_strategy_map.json
│   └── form_ux_intent_capture_map.json
├── 06_visual_experience/
│   ├── visual_experience_map.json
│   ├── page_visual_sequence_map.json
│   ├── ai_visual_brief_pack.json
│   └── image_crop_and_layout_map.json
├── 07_growth/
│   ├── growth_experiment_backlog.json
│   ├── content_refresh_calendar.json
│   ├── ai_visibility_observation_plan.json
│   ├── search_console_observation_plan.json
│   └── conversion_experiment_plan.json
├── 08_manifests/
│   ├── final_package_manifest.json
│   ├── sha256_manifest.json
│   ├── content_publication_gate.json
│   ├── richmedia_block_manifest.json
│   └── image_reference_map.json
├── 09_qa/
│   ├── validation_report.json
│   ├── semantic_photo_qa_report.json
│   ├── commercial_copy_quality_report.json
│   ├── schema_readiness_report.json
│   ├── search_readiness_report.json
│   ├── ux_copy_quality_report.json
│   └── render_readiness_report.json
└── images/
    ├── albums/
    ├── guide/
    └── ai_visuals/
```

---

## 4. Required Export Groups

### 4.1 `01_upload`

The `01_upload` group is mandatory and is the only canonical import group.

```yaml
required_01_upload_files:
  - universal_content_assets_final.json
  - brand_profiles.json
  - design_config.json
  - gnb_ia_config.json
  - gallery_albums.json
  - gallery_photos.json
  - album_taxonomy_nodes.json
  - visual_asset_url_map_master.json
```

If any of these files are missing, export status is `blocked`.

---

### 4.2 `02_semantic_strategy`

```yaml
semantic_strategy_files:
  - search_intent_map.json
  - qis_growth_registry.json
  - entity_keyword_map.json
  - local_geo_intent_map.json
  - ai_answer_opportunity_map.json
```

For MVP, this group may be optional.

For v1, this group is required.

---

### 4.3 `03_knowledge_graph`

```yaml
knowledge_graph_files:
  - brand_knowledge_graph.json
  - entity_registry.json
  - entity_relation_edges.json
  - claim_proof_boundary_graph.json
  - semantic_surface_map.json
```

For v1, this group is required.

---

### 4.4 `04_schema`

```yaml
schema_files:
  - schema_readiness_map.json
  - jsonld_generation_plan.json
  - rich_result_eligibility_report.json
```

---

### 4.5 `05_ux_copy`

```yaml
ux_copy_files:
  - copy_system.json
  - microcopy_library.json
  - cta_strategy_map.json
  - form_ux_intent_capture_map.json
```

---

### 4.6 `06_visual_experience`

```yaml
visual_experience_files:
  - visual_experience_map.json
  - page_visual_sequence_map.json
  - ai_visual_brief_pack.json
  - image_crop_and_layout_map.json
```

---

### 4.7 `07_growth`

```yaml
growth_files:
  - growth_experiment_backlog.json
  - content_refresh_calendar.json
  - ai_visibility_observation_plan.json
  - search_console_observation_plan.json
  - conversion_experiment_plan.json
```

For MVP, this group may be generated as a strategy placeholder.

---

### 4.8 `08_manifests`

```yaml
manifest_files:
  - final_package_manifest.json
  - sha256_manifest.json
  - content_publication_gate.json
  - richmedia_block_manifest.json
  - image_reference_map.json
```

`final_package_manifest.json` and `sha256_manifest.json` are mandatory.

---

### 4.9 `09_qa`

```yaml
qa_files:
  - validation_report.json
  - semantic_photo_qa_report.json
  - commercial_copy_quality_report.json
  - schema_readiness_report.json
  - search_readiness_report.json
  - ux_copy_quality_report.json
  - render_readiness_report.json
```

MVP may include only `validation_report.json` and `semantic_photo_qa_report.json`, but v1 must include all QA files.

---

## 5. Images Folder Contract

```text
images/
├── albums/
│   ├── {album_id}/
│   │   ├── 001_{album_short}_{usage}.webp
│   │   ├── thumb_001_{album_short}_{usage}.webp
│   │   └── ...
├── guide/
│   └── ...
└── ai_visuals/
    └── ...
```

### 5.1 Actual Photo Rules

Actual portfolio or gallery images should be placed under:

```text
images/albums/{album_id}/
```

### 5.2 AI Visual Rules

AI-generated public or internal visuals should be placed under:

```text
images/ai_visuals/
```

Every public AI visual must have a matching record in `visual_asset_url_map_master.json`.

### 5.3 Guide Graphics

Non-AI explanatory graphics may be placed under:

```text
images/guide/
```

---

## 6. Manifest Contract

### 6.1 `final_package_manifest.json`

```ts
export type FinalPackageManifest = {
  package_id: string;
  tenant_id: string;
  tenant_slug: string;
  official_brand_name: string;
  industry_type: 'wedding_sdm';
  generated_at: string;
  package_status: 'onboarding_ready' | 'conditional_onboarding_ready' | 'blocked';
  core_files: ManifestFileRecord[];
  advanced_files: ManifestFileRecord[];
  image_files: ManifestFileRecord[];
  qa_reports: ManifestFileRecord[];
  summary: {
    uca_count: number;
    gallery_album_count: number;
    gallery_photo_count: number;
    visual_asset_count: number;
    qa_pass_count: number;
    qa_fail_count: number;
    review_required_count: number;
  };
};

export type ManifestFileRecord = {
  path: string;
  file_name: string;
  file_type: 'json' | 'image' | 'markdown' | 'report' | 'other';
  required: boolean;
  sha256?: string;
  size_bytes?: number;
};
```

### 6.2 `sha256_manifest.json`

```ts
export type Sha256Manifest = {
  generated_at: string;
  files: Array<{
    path: string;
    sha256: string;
    size_bytes: number;
  }>;
};
```

---

## 7. UCA Dedup Safety

The ZIP must not include multiple canonical UCA-like files.

Forbidden duplicate patterns:

```yaml
forbidden_duplicate_patterns:
  - "**/universal_content_assets.json"
  - "**/universal_content_assets_ssot_final_extended.json"
  - "**/universal_content_assets_reference.json"
```

Allowed canonical file:

```text
01_upload/universal_content_assets_final.json
```

If QA needs a reference UCA summary file, name it without `universal_content_assets`.

Recommended:

```text
09_qa/reference/uca_summary_for_review.json
```

---

## 8. Path Resolution Rules

All image references in JSON must resolve to:

1. a file in the ZIP package, or
2. a valid external URL, or
3. a staging path with explicit status `staged`.

Fields that must be checked:

```yaml
image_reference_fields:
  - image_path
  - thumbnail_path
  - image_url
  - thumbnail
  - hero_image
  - hero_image_url
  - cover_image_url
  - gallery_images[].url
  - images[].url
  - visual_asset_url
```

Unresolved image references fail export unless the asset is `draft` or `internal_only`.

---

## 9. Export Status Rules

```yaml
onboarding_ready:
  condition:
    - all required 01_upload files exist
    - all JSON files valid
    - no critical QA failure
    - no unresolved public image reference
    - no forbidden public UCA type
    - no public AI visual missing disclosure

conditional_onboarding_ready:
  condition:
    - required 01_upload files exist
    - non-critical review_required items remain
    - unresolved items are excluded from public active assets

blocked:
  condition:
    - required file missing
    - invalid JSON
    - public image rights unknown
    - forbidden public UCA type exists
    - UCA duplicate risk unresolved
    - body_richtext missing from public detailed assets
```

---

## 10. Export Preflight Checklist

```yaml
preflight_checklist:
  json:
    - all required JSON files exist
    - all JSON is valid UTF-8
    - all JSON parses successfully

  ssot:
    - UCA types allowed
    - forbidden types absent
    - body_richtext present
    - category mapping valid

  visual:
    - image paths resolve
    - AI visuals have disclosure
    - public photos have rights status

  qa:
    - validation_report exists
    - critical gates pass
    - review_required items listed

  manifest:
    - final_package_manifest exists
    - sha256_manifest exists
    - file count matches manifest
```

---

## 11. Non-Goals

This specification does not define:

- actual AIHompy import engine implementation
- CDN upload implementation
- client billing
- production deployment topology
- external SEO performance guarantee

