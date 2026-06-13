# Handoff Import Overview

## 1. Purpose

This document extends the Wedding Surface Agent repository with a **handoff import option**.

The agent webapp does not have to perform every expensive or specialized AI task internally. It must support importing validated external artifacts produced by another GPT session, another AI tool, or a human-operated asset workflow.

Two handoff modes are now first-class product paths:

1. **External Image Analysis Handoff**  
   Images and image metadata are analyzed outside the app and imported as files.

2. **AI Visual Generation Handoff**  
   The app generates AI visual prompts and usage briefs, but does not generate final images. Another image generation system creates the images, and the resulting image files plus metadata are imported back into the app.

This change reduces API cost, improves flexibility, and allows higher-quality human-supervised visual production.

---

## 2. Non-Goals

The handoff import option must not weaken safety, validation, or SSoT consistency.

The system must not:

- trust external JSON without validation
- mark imported assets as approved automatically
- treat AI-generated visuals as actual portfolio work
- bypass image rights review
- bypass photo semantic QA
- bypass `visual_asset_url_map_master.json`
- bypass final ZIP validation

---

## 3. Handoff Modes

```yaml
handoff_modes:
  internal_analysis:
    description: "The app analyzes original images through its own AI vision pipeline."
    status: supported

  external_image_analysis_import:
    description: "The user uploads image files and metadata JSON generated outside the app."
    status: required

  prompt_only_ai_visual_generation:
    description: "The app creates visual prompts/briefs, external AI generates images, and the user imports generated image files."
    status: required
```

---

## 4. Core Principle

The app should distinguish between:

```yaml
source_of_visual_truth:
  actual_photo:
    meaning: "Real client/brand/portfolio photo."
    may_represent_actual_work: true

  externally_analyzed_actual_photo:
    meaning: "Real image analyzed outside the app, imported with metadata."
    may_represent_actual_work: true_if_rights_approved

  ai_generated_visual:
    meaning: "AI-created visual generated outside the app from app-created prompt briefs."
    may_represent_actual_work: false

  placeholder_or_staging_visual:
    meaning: "Temporary visual, not approved for final public use."
    may_represent_actual_work: false
```

---

## 5. Required Import Surfaces

The webapp must provide UI/API import options for:

```yaml
import_surfaces:
  image_analysis_handoff:
    route: "/projects/[id]/handoff/image-analysis"
    accepts:
      - image files
      - photo_semantic_manifest.json
      - photo_selection_index.json optional
      - visual_context_compact.json optional

  ai_visual_handoff:
    route: "/projects/[id]/handoff/ai-visuals"
    accepts:
      - generated AI visual image files
      - ai_visual_generation_result_manifest.json
      - prompt_id mapping
      - disclosure metadata

  handoff_validation_center:
    route: "/projects/[id]/handoff/validation"
    purpose:
      - validate imported manifests
      - resolve image paths
      - create human review items
      - accept or reject import batch
```

---

## 6. Import Lifecycle

```text
External artifact created
        ↓
User uploads handoff package
        ↓
File integrity check
        ↓
JSON schema validation
        ↓
Image path and hash matching
        ↓
Domain policy validation
        ↓
Human review items created where needed
        ↓
Accepted records stored in DB
        ↓
Agent downstream nodes consume imported manifest
        ↓
Final ZIP references imported assets
```

---

## 7. Product Impact

This handoff architecture changes the agent from a closed pipeline into a flexible production system.

The agent can now operate in three modes:

```yaml
production_modes:
  full_internal:
    description: "The app runs all analysis and generation steps internally."

  hybrid_cost_optimized:
    description: "Image analysis or image generation is done externally and imported."

  agency_workflow:
    description: "Human operators use external GPT/image tools, then import audited artifacts."
```
