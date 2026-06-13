# Handoff Workflow Integration Spec

## 1. Purpose

This spec explains how handoff import options integrate with the existing LangGraph workflow.

The agent must support both internal and external production modes without duplicating the entire graph.

---

## 2. New Project Settings

Projects need import mode settings.

```ts
export type ProjectProductionMode =
  | "full_internal"
  | "external_image_analysis"
  | "prompt_only_ai_visual"
  | "hybrid_handoff";
```

```ts
export type ProjectHandoffSettings = {
  image_analysis_mode: "internal" | "external_import" | "hybrid_selective";
  ai_visual_mode: "prompt_only_external_generation" | "internal_generation_disabled";
  allow_selective_reanalysis: boolean;
  require_human_review_for_imported_visuals: boolean;
};
```

---

## 3. New LangGraph Nodes

```yaml
new_nodes:
  handoff_import_router_node:
    purpose: "Detect whether imported artifacts exist and route graph accordingly."

  image_analysis_handoff_import_node:
    purpose: "Validate and persist external photo semantic manifest."

  ai_visual_prompt_export_node:
    purpose: "Generate prompt package for external image generation."

  ai_visual_result_import_node:
    purpose: "Validate and persist externally generated AI visuals."

  handoff_validation_report_node:
    purpose: "Create import report and human review items."
```

---

## 4. Modified Existing Nodes

```yaml
modified_nodes:
  photo_inventory_node:
    change: "Can source photo records from imported handoff package."

  photo_taxonomy_node:
    change: "Skips internal vision analysis if approved imported manifest exists."

  photo_docent_node:
    change: "Uses imported copy seed and only patches missing/failed fields."

  visual_experience_node:
    change: "Uses imported visual_context_compact if available."

  ai_visual_os_node:
    change: "Generates prompts/briefs only; image generation result is imported later."

  validation_12_gates_node:
    change: "Adds handoff import validation gate and AI visual source gate."
```

---

## 5. Routing Logic

```yaml
routing_logic:
  if image_analysis_mode == external_import:
    - require image_analysis_handoff_import_node before photo_taxonomy_node
    - photo_taxonomy_node consumes imported manifest
    - internal image analysis skipped unless selective reanalysis triggered

  if image_analysis_mode == hybrid_selective:
    - import approved manifest
    - run internal analysis only for missing or low-confidence records

  if ai_visual_mode == prompt_only_external_generation:
    - ai_visual_os_node creates ai_visual_brief_pack
    - graph pauses or marks waiting_for_external_generation
    - user imports ai_visual_generation_result_manifest
    - graph resumes with ai_visual_result_import_node
```

---

## 6. Job Status Additions

```yaml
new_job_statuses:
  waiting_for_image_analysis_handoff:
    meaning: "The workflow is paused until external image analysis package is imported."

  waiting_for_ai_visual_generation:
    meaning: "AI visual prompts were exported and the workflow waits for generated image files."

  handoff_import_validation_failed:
    meaning: "Imported package failed validation."

  handoff_review_required:
    meaning: "Imported package is accepted but requires human review before public use."
```

---

## 7. Recommended UX Flow

```text
Project Intake
  ↓
Choose production mode:
  - Full internal
  - External image analysis import
  - Hybrid cost-optimized
  - Prompt-only AI visual generation
  ↓
Upload original images or handoff package
  ↓
Run handoff validation
  ↓
Approve accepted records
  ↓
Run downstream content generation
  ↓
Export prompt package for AI visuals if needed
  ↓
Import generated AI visuals
  ↓
Run final visual/source QA
  ↓
Export onboarding ZIP
```

---

## 8. Acceptance Criteria

```yaml
accepted_when:
  - project can choose external image analysis mode
  - user can upload handoff package
  - imported manifests are validated with Zod
  - image files are resolved and hash-checked where possible
  - imported metadata can feed gallery and portfolio generation
  - AI visual prompts can be exported without generating images
  - externally generated AI visuals can be imported and validated
  - final ZIP preserves source_type and disclosure metadata
```
