# Handoff Import UI Spec

## 1. Purpose

The UI must allow operators to import external image analysis and AI visual generation results.

---

## 2. Routes

```yaml
routes:
  image_analysis_handoff:
    path: /projects/[id]/handoff/image-analysis
    purpose: "Upload and validate external image analysis package."

  ai_visual_prompt_export:
    path: /projects/[id]/handoff/ai-visual-prompts
    purpose: "Export prompt package for external image generation."

  ai_visual_result_import:
    path: /projects/[id]/handoff/ai-visual-results
    purpose: "Upload externally generated AI visual files and manifest."

  handoff_validation_center:
    path: /projects/[id]/handoff/validation
    purpose: "Review import results, errors, and required approvals."
```

---

## 3. Image Analysis Handoff Screen

Required UI sections:

```yaml
sections:
  production_mode_selector:
    options:
      - internal analysis
      - external analysis import
      - hybrid selective reanalysis

  package_upload:
    accepts:
      - .zip
      - .json
      - image files

  expected_structure_panel:
    shows:
      - images/albums/**
      - metadata/photo_semantic_manifest.json
      - metadata/handoff_manifest.json

  validation_results:
    shows:
      - accepted records
      - review_required records
      - rejected records
      - missing file paths
      - duplicate photo_ids

  accept_import_button:
    enabled_when:
      - no fatal validation errors
```

---

## 4. AI Visual Prompt Export Screen

Required UI sections:

```yaml
sections:
  prompt_pack_summary:
    shows:
      - number of visual briefs
      - target pages
      - disclosure requirements
      - prohibited usage

  export_button:
    action: "Download ai_visual_prompt_package.zip"

  external_generation_instruction:
    text: "Use the exported prompts in your chosen image generation tool. Do not change prompt_id or visual_asset_id."
```

---

## 5. AI Visual Result Import Screen

Required UI sections:

```yaml
sections:
  result_package_upload:
    accepts:
      - .zip
      - image files
      - ai_visual_generation_result_manifest.json

  prompt_mapping_validation:
    checks:
      - prompt_id exists
      - visual_asset_id exists
      - file_path resolves
      - source_type is AI visual type
      - can_represent_actual_work is false

  visual_preview_grid:
    shows:
      - image preview
      - target page
      - intended usage
      - disclosure text
      - review status

  approve_limited_usage:
    action: "Approve selected AI visuals for allowed pages only."
```

---

## 6. UX Copy Rules

```yaml
copy_rules:
  - Never say imported AI visuals are portfolio photos.
  - Use “AI 안내 이미지” or “AI 생성 설명 이미지”.
  - Show disclosure status clearly.
  - Show rights/review status before public use.
  - Warn if imported image metadata has low confidence.
```
