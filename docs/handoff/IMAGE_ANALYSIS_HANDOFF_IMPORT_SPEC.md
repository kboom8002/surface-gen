# Image Analysis Handoff Import Spec

## 1. Purpose

This spec defines how the app imports image analysis results that were produced outside the agent webapp.

The external workflow may be:

- a separate GPT session
- a human-supervised image analysis process
- another internal tool
- another AI vision model
- a batch processing script

The handoff must include the original or normalized image files plus structured metadata JSON.

---

## 2. Required Handoff Package

```text
image_analysis_handoff_package/
├── images/
│   ├── albums/
│   │   ├── {album_id}/
│   │   │   ├── 001_*.png|jpg|jpeg|webp
│   │   │   └── ...
│   └── thumbnails/ optional
├── metadata/
│   ├── photo_semantic_manifest.json
│   ├── photo_selection_index.json optional
│   ├── visual_context_compact.json optional
│   └── handoff_manifest.json
└── README.md optional
```

---

## 3. `handoff_manifest.json`

```json
{
  "handoff_type": "image_analysis",
  "handoff_version": "1.0.0",
  "project_hint": {
    "tenant_slug": "example_studio",
    "industry_type": "wedding_sdm"
  },
  "created_by": {
    "tool": "external_gpt_session",
    "model": "gpt-vision-or-other",
    "operator": "human_or_system_name"
  },
  "created_at": "2026-06-12T00:00:00Z",
  "analysis_policy": {
    "visible_facts_only": true,
    "no_unverified_location": true,
    "no_unverified_brand_or_fabric": true,
    "no_result_guarantee": true
  },
  "files": [
    {
      "relative_path": "images/albums/example_album_001/001_studio_scene.webp",
      "sha256": "...",
      "declared_type": "actual_photo"
    }
  ]
}
```

---

## 4. `photo_semantic_manifest.json`

This is the canonical import artifact for external image analysis.

```ts
export type PhotoSemanticManifest = {
  manifest_version: string;
  tenant_slug: string;
  industry_type: string;
  analysis_source: {
    tool: string;
    model?: string;
    prompt_version?: string;
    operator?: string;
  };
  photos: PhotoSemanticRecord[];
};
```

```ts
export type PhotoSemanticRecord = {
  tenant_id?: string;
  album_id: string;
  photo_id: string;
  original_file_name: string;
  file_name: string;
  image_path: string;
  thumbnail_path?: string;
  image_hash?: string;
  rights_status: "approved" | "review_required" | "rejected" | "unknown";
  review_status: "approved" | "review_required" | "rejected" | "internal_only";

  visible_facts: {
    visible_subject: string[];
    visible_space?: string;
    indoor_outdoor?: "indoor" | "outdoor" | "mixed" | "unknown";
    lighting_condition?: string;
    main_pose_or_action?: string;
    visible_objects?: string[];
  };

  taxonomy: {
    service_domain?: string;
    scene_type?: string;
    subject_tags: string[];
    mood_tags: string[];
    style_tags: string[];
    composition_tags: string[];
    usage_role_candidates?: string[];
    vibe_vector?: {
      bright_to_moody?: number;
      natural_to_editorial?: number;
      relaxed_to_formal?: number;
      minimal_to_luxury?: number;
      intimate_to_grand?: number;
      documentary_to_directed?: number;
    };
  };

  copy: {
    alt: string;
    caption: string;
    scene_note?: string;
    style_note?: string;
    recommended_for?: string;
  };

  qa: {
    confidence: number;
    uncertainty_note?: string;
    human_review_required: boolean;
    forbidden_claims_checked: boolean;
    possible_face_exposure?: boolean;
    possible_logo_exposure?: boolean;
    possible_customer_identity_exposure?: boolean;
  };
};
```

---

## 5. Validation Rules

Imported image analysis must pass these checks before becoming available to downstream nodes.

```yaml
validation_rules:
  manifest:
    - handoff_type must be image_analysis
    - manifest_version must be supported
    - industry_type must match project industry_type
    - tenant_slug must match or be explicitly mapped

  files:
    - every image_path must exist in uploaded package or storage
    - sha256 must match if provided
    - duplicate photo_id is blocked
    - duplicate file_name within album is blocked

  metadata:
    - required visible_facts fields must exist
    - copy.alt must exist
    - copy.caption must exist
    - confidence must be between 0 and 1
    - low confidence creates review item

  safety:
    - rights_status unknown blocks public use
    - customer identity exposure creates review item
    - forbidden claims in caption/notes are blocked
```

---

## 6. Import Behavior

```yaml
import_behavior:
  accepted_records:
    - inserted into photo_semantic_analyses
    - linked to source_images
    - available to gallery generation
    - available to portfolio_docent generation

  review_required_records:
    - inserted but marked review_required
    - excluded from public hero/cover until approved
    - visible in handoff validation center

  rejected_records:
    - not used downstream
    - error stored in handoff_import_reports
```

---

## 7. Downstream Usage

When external image analysis is imported, the agent must prefer imported metadata over rerunning image analysis.

```yaml
priority_order:
  1: approved_imported_photo_semantic_manifest
  2: app_generated_photo_semantic_manifest
  3: on_demand_reanalysis_for_selected_images
```

Selective reanalysis is allowed only when:

```yaml
reanalysis_triggers:
  - confidence < 0.7
  - image selected as home hero
  - image selected as album cover
  - image selected for public proof surface
  - human reviewer flags mismatch
  - metadata conflicts with visible rights or filename mapping
```
