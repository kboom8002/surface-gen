# 02. Domain Model

## 1. Domain Summary
The system models a wedding brand onboarding project as a set of source materials, agent jobs, generated SSoT assets, visual semantic records, knowledge graph outputs, validation reports, human review items, and export packages.

## 2. Main Domain Entities

### Project
Represents one tenant onboarding project.

```yaml
Project:
  id:
  tenant_id:
  tenant_slug:
  official_brand_name:
  industry_type: wedding_sdm
  status:
  created_by:
  created_at:
  updated_at:
```

### SourceFile
Represents uploaded non-image files such as factsheets, package policies, evidence, and benchmark notes.

```yaml
SourceFile:
  id:
  project_id:
  file_type:
  file_name:
  storage_path:
  mime_type:
  size_bytes:
  parse_status:
  extracted_text:
```

### SourceImage
Represents uploaded images before or during normalization.

```yaml
SourceImage:
  id:
  project_id:
  original_file_name:
  normalized_file_name:
  storage_path:
  thumbnail_path:
  album_id:
  photo_id:
  rights_status:
  contains_face:
  contains_logo:
  contains_customer_name:
  consent_status:
  metadata:
```

### AgentJob
Represents a long-running factory run.

```yaml
AgentJob:
  id:
  project_id:
  job_type:
  status:
  current_node:
  state:
  error:
  started_at:
  finished_at:
```

### AgentJobStep
Represents one node execution in a job.

```yaml
AgentJobStep:
  id:
  job_id:
  node_name:
  status:
  input_ref:
  output_ref:
  token_usage:
  error:
  started_at:
  finished_at:
```

### GeneratedAsset
Represents one generated public or draft SSoT UCA asset.

```yaml
GeneratedAsset:
  id:
  project_id:
  uca_id:
  type:
  category:
  title:
  status:
  review_status:
  sort_order:
  pinned:
  json_payload:
  body_richtext:
  relations:
  qa_status:
```

### GalleryAlbum
Represents an album-level gallery record for export.

```yaml
GalleryAlbum:
  album_id:
  tenant_id:
  album_title:
  album_slug:
  album_type:
  service_domain:
  representative_photo_id:
  cover_image_path:
  photo_count:
  album_intro:
  related_program_ids:
  related_answer_ids:
```

### GalleryPhoto
Represents a photo-level export record, not a public UCA type.

```yaml
GalleryPhoto:
  photo_id:
  album_id:
  tenant_id:
  image_path:
  thumbnail_path:
  alt:
  caption:
  scene_note:
  style_note:
  recommended_for:
  service_domain:
  scene_type:
  subject_tags:
  mood_tags:
  style_tags:
  composition_tags:
  vibe_vector:
  usage_role:
  rights_status:
  review_status:
```

### KnowledgeGraphNode
Represents a brand graph node.

```yaml
KnowledgeGraphNode:
  node_id:
  node_type:
  label:
  payload:
  confidence:
  source_basis:
```

### KnowledgeGraphEdge
Represents a relationship between graph nodes.

```yaml
KnowledgeGraphEdge:
  from_node_id:
  relation:
  to_node_id:
  confidence:
  evidence_ids:
  payload:
```

### QAReport
Represents a validation report.

```yaml
QAReport:
  id:
  project_id:
  report_type:
  status:
  report:
```

### HumanReviewItem
Represents a review-required item.

```yaml
HumanReviewItem:
  id:
  project_id:
  item_type:
  target_id:
  severity:
  reason:
  suggested_action:
  status:
  resolution_note:
```

## 3. Domain Relationships

```text
Project
 ├── SourceFile[]
 ├── SourceImage[]
 ├── AgentJob[]
 ├── GeneratedAsset[]
 ├── GalleryAlbum[]
 ├── GalleryPhoto[]
 ├── KnowledgeGraphNode[]
 ├── KnowledgeGraphEdge[]
 ├── QAReport[]
 └── HumanReviewItem[]
```

## 4. Asset Flow

```text
SourceFile + SourceImage
  → normalized input records
  → agent intermediate outputs
  → generated assets
  → validators
  → review items
  → export JSON files
  → ZIP package
```

## 5. State Model

### Project Status

```yaml
project_status:
  - draft
  - intake_ready
  - running
  - review_required
  - qa_failed
  - export_ready
  - exported
  - archived
```

### Job Status

```yaml
job_status:
  - queued
  - running
  - paused
  - waiting_for_review
  - repairing
  - completed
  - failed
  - cancelled
```

### Review Status

```yaml
review_status:
  - approved
  - review_required
  - rejected
  - internal_only
```

### Asset Status

```yaml
asset_status:
  - active
  - draft
  - suspended
  - archived
```

## 6. Canonical Boundaries
- `GeneratedAsset` stores UCA-like content assets.
- `GalleryPhoto` stores photo-level metadata and must not be exported as public UCA type.
- `SourceImage` is raw/normalized source state; `GalleryPhoto` is CMS export state.
- `KnowledgeGraphNode/Edge` are semantic outputs and do not replace UCA assets.
- QA reports are separate from generated outputs.
