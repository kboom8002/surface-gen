# AI Visual Generation Handoff Spec

## 1. Purpose

This spec defines the prompt-only AI visual workflow.

The agent webapp generates AI visual briefs and prompts. It does **not** have to generate images internally. Another AI image tool or human-operated generation workflow creates the image files. The resulting files and generation metadata are imported back into the app.

This is required because visual generation tools, cost profiles, quality controls, and licensing requirements may vary by operator.

---

## 2. Core Policy

AI visual generation must never replace actual portfolio work.

```yaml
non_negotiables:
  - AI visuals cannot represent actual wedding portfolio work.
  - AI visuals cannot be used as proof of real service results.
  - AI visuals must include disclosure metadata when public.
  - AI visual files must map back to prompt_id and visual_asset_id.
  - Imported AI visuals must pass validation before public use.
```

---

## 3. Agent-Generated Prompt Package

The app must generate:

```text
ai_visual_prompt_package/
├── ai_visual_brief_pack.json
├── ai_visual_prompt_manifest.json
├── negative_prompt_policy.json
├── visual_usage_map.json
└── README_FOR_EXTERNAL_GENERATOR.md
```

---

## 4. `ai_visual_brief_pack.json`

```ts
export type AiVisualBriefPack = {
  pack_version: string;
  tenant_slug: string;
  industry_type: string;
  generated_at: string;
  briefs: AiVisualBrief[];
};

export type AiVisualBrief = {
  visual_asset_id: string;
  prompt_id: string;
  target_page: string;
  target_block: string;
  visual_job_to_be_done: string;
  source_ssot_refs: string[];
  allowed_usage: string[];
  prohibited_usage: string[];
  can_represent_actual_work: false;
  disclosure_required: boolean;
  disclosure_text?: string;
  aspect_ratio: string;
  mobile_crop_safe_area?: string;
  style_constraints: string[];
  positive_prompt: string;
  negative_prompt: string;
  qa_checklist: string[];
};
```

---

## 5. External Generation Result Package

After external generation, the user imports:

```text
ai_visual_generation_handoff_package/
├── ai_visuals/
│   ├── vis_{tenant_slug}_{usage}_{000}.png
│   ├── vis_{tenant_slug}_{usage}_{001}.webp
│   └── ...
├── metadata/
│   ├── ai_visual_generation_result_manifest.json
│   └── handoff_manifest.json
└── README.md optional
```

---

## 6. `ai_visual_generation_result_manifest.json`

```ts
export type AiVisualGenerationResultManifest = {
  manifest_version: string;
  handoff_type: "ai_visual_generation_result";
  tenant_slug: string;
  industry_type: string;
  generated_by: {
    tool: string;
    model?: string;
    operator?: string;
    generation_date?: string;
  };
  results: AiVisualGenerationResult[];
};

export type AiVisualGenerationResult = {
  visual_asset_id: string;
  prompt_id: string;
  file_name: string;
  file_path: string;
  sha256?: string;
  source_type: "ai_editorial_visual" | "ai_process_visual" | "ai_concept_visual" | "placeholder_visual";
  generation_channel: string;
  source_ssot_refs: string[];
  intended_usage: string[];
  allowed_pages: string[];
  prohibited_pages: string[];
  disclosure_required: boolean;
  disclosure_text?: string;
  rights_status: "generated_asset_review_required" | "approved_for_limited_public_use" | "rejected";
  qa_status: "unchecked" | "passed" | "failed" | "review_required";
  can_represent_actual_work: false;
  notes?: string;
};
```

---

## 7. Import Validation

```yaml
validation_rules:
  identity:
    - every visual_asset_id must exist in ai_visual_brief_pack
    - every prompt_id must match original prompt package
    - tenant_slug must match project tenant_slug
    - industry_type must match project industry_type

  files:
    - file_path must exist
    - sha256 must match if provided
    - image file extension must be allowed

  safety:
    - can_represent_actual_work must be false
    - source_type must not be actual_photo
    - disclosure_text required if disclosure_required is true
    - prohibited_pages must include portfolio proof surfaces unless explicitly allowed as guide-only

  workflow:
    - imported image remains review_required until accepted by human reviewer
    - failed images are excluded from visual_asset_url_map_master.json
```

---

## 8. Visual Asset Map Integration

Accepted AI visuals are added to `visual_asset_url_map_master.json` with strict metadata.

```json
{
  "visual_asset_id": "vis_studio_blanc_answer_dark_hall_001",
  "source_type": "ai_process_visual",
  "file_path": "images/ai_visuals/vis_studio_blanc_answer_dark_hall_001.webp",
  "prompt_id": "prompt_studio_blanc_dark_hall_001",
  "source_ssot_refs": ["answer_studio_blanc_dark_hall"],
  "allowed_pages": ["answers", "article"],
  "prohibited_pages": ["portfolio", "gallery_proof", "review", "case_study"],
  "disclosure_required": true,
  "disclosure_text": "이 이미지는 설명을 돕기 위한 AI 생성 안내 이미지이며 실제 촬영 포트폴리오가 아닙니다.",
  "can_represent_actual_work": false,
  "review_status": "approved"
}
```

---

## 9. UX Requirement

The app must support this UI flow:

```text
AI Visual OS generates prompts
        ↓
User exports prompt package
        ↓
External AI tool generates images
        ↓
User imports generated files + result manifest
        ↓
App validates prompt_id and visual_asset_id mapping
        ↓
Human reviewer approves limited usage
        ↓
Images become available for richmedia block assembly
```
