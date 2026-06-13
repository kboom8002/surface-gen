# 05. Database Schema Specification

## 1. Purpose

This document defines the canonical Supabase Postgres database schema for the Wedding Surface Agent webapp.

The database must support:

- multi-project wedding_sdm onboarding jobs
- Brand Factsheet and source file intake
- image upload and rights metadata
- long-running LangGraph agent jobs
- generated SSoT assets
- gallery photo metadata
- SEO/AEO/GEO strategy outputs
- brand knowledge graph outputs
- QA reports
- human review workflow
- JSON and ZIP export tracking

The schema is designed for Specification-Driven Development and must remain aligned with:

- `docs/02_DOMAIN_MODEL.md`
- `docs/10_SSOT_OUTPUT_CONTRACT.md`
- `docs/agents/AGENT_STATE_SCHEMA.md`
- `docs/domain/ZIP_ONBOARDING_OUTPUT_SPEC.md`
- `docs/backend/SUPABASE_SCHEMA.sql`

## 2. Design Principles

```yaml
schema_principles:
  tenant_scoped:
    meaning: "All user-facing records must be scoped by project_id and owner/team access."

  job_stateful:
    meaning: "Long-running agent jobs must persist state, node progress, retry count, and failure details."

  llm_output_not_trusted:
    meaning: "Raw model output must not become approved production data without schema validation and QA."

  ssot_first:
    meaning: "Generated CMS content is represented as SSoT-compliant generated_assets before JSON export."

  reviewable:
    meaning: "Claims, policies, image rights, reviews, awards, AI visual public use, and final publish require review states."

  export_reproducible:
    meaning: "Generated JSON and ZIP packages are recorded with SHA256 and manifest metadata."
```

## 3. Core Entity Groups

```yaml
entity_groups:
  identity_and_access:
    - profiles
    - organizations
    - organization_members

  project_intake:
    - projects
    - source_files
    - source_images

  agent_runtime:
    - agent_jobs
    - agent_job_steps
    - agent_artifacts

  generated_content:
    - generated_assets
    - gallery_albums
    - gallery_photos
    - album_taxonomy_nodes
    - visual_asset_records

  semantic_outputs:
    - semantic_strategy_outputs
    - knowledge_graph_nodes
    - knowledge_graph_edges
    - schema_readiness_records
    - growth_experiments

  qa_and_review:
    - qa_reports
    - qa_gate_results
    - human_review_items

  export:
    - generated_json_files
    - export_packages
```

## 4. Identity and Access Tables

### 4.1 profiles

Stores user metadata linked to Supabase Auth users.

```yaml
profiles:
  id: uuid primary key, auth.users.id
  display_name: text
  email: text
  avatar_url: text nullable
  default_organization_id: uuid nullable
  created_at: timestamptz
  updated_at: timestamptz
```

### 4.2 organizations

Supports future team-based use. MVP may create one default organization per user.

```yaml
organizations:
  id: uuid primary key
  name: text
  slug: text unique
  created_by: uuid references profiles.id
  created_at: timestamptz
  updated_at: timestamptz
```

### 4.3 organization_members

```yaml
organization_members:
  id: uuid primary key
  organization_id: uuid references organizations.id
  user_id: uuid references profiles.id
  role: owner | admin | operator | reviewer | viewer
  created_at: timestamptz
```

## 5. Project Intake Tables

### 5.1 projects

Represents one brand onboarding project.

```yaml
projects:
  id: uuid primary key
  organization_id: uuid references organizations.id
  tenant_slug: text not null
  official_brand_name: text not null
  industry_type: text default wedding_sdm
  status: draft | intake_ready | running | review_required | export_ready | exported | blocked
  created_by: uuid references profiles.id
  settings: jsonb
  created_at: timestamptz
  updated_at: timestamptz
```

Rules:

- `industry_type` is `wedding_sdm` for MVP.
- `tenant_slug` must be lowercase slug-safe text.
- `status=export_ready` is allowed only after required QA gates pass.

### 5.2 source_files

Stores uploaded Brand Factsheet, policy documents, evidence files, and other non-image materials.

```yaml
source_files:
  id: uuid primary key
  project_id: uuid references projects.id
  file_type: brand_factsheet | package_policy | evidence | reference | other
  file_name: text
  storage_path: text
  mime_type: text
  size_bytes: bigint
  parse_status: pending | parsed | failed | skipped
  extracted_text: text nullable
  extracted_json: jsonb
  checksum_sha256: text nullable
  created_by: uuid references profiles.id
  created_at: timestamptz
```

Rules:

- Brand Factsheet is required before agent execution.
- Parsed extracted text is input material, not a final truth source unless classified.

### 5.3 source_images

Stores uploaded original images and rights metadata.

```yaml
source_images:
  id: uuid primary key
  project_id: uuid references projects.id
  original_file_name: text
  normalized_file_name: text nullable
  storage_path: text
  thumbnail_path: text nullable
  album_id: text nullable
  photo_id: text nullable
  sequence_index: integer nullable
  rights_status: approved | review_required | restricted | rejected | unknown
  contains_face: boolean nullable
  contains_logo: boolean nullable
  contains_customer_name: boolean nullable
  consent_status: approved | review_required | restricted | unknown
  public_use_allowed: boolean default false
  metadata: jsonb
  checksum_sha256: text nullable
  created_by: uuid references profiles.id
  created_at: timestamptz
  updated_at: timestamptz
```

Rules:

- Public image usage requires `public_use_allowed=true` and non-rejected rights status.
- `photo_id` must follow `{tenant_slug}_album_{000}_photo_{000}` once normalized.
- Images with `rights_status=unknown` are not eligible for public surfaces.

## 6. Agent Runtime Tables

### 6.1 agent_jobs

Tracks each long-running LangGraph execution.

```yaml
agent_jobs:
  id: uuid primary key
  project_id: uuid references projects.id
  job_type: full_factory | partial_regeneration | qa_only | export_only
  status: queued | running | paused | review_required | completed | failed | cancelled
  current_node: text nullable
  state: jsonb
  retry_count: jsonb
  error: jsonb nullable
  requested_by: uuid references profiles.id
  started_at: timestamptz nullable
  finished_at: timestamptz nullable
  created_at: timestamptz
  updated_at: timestamptz
```

Rules:

- Long model calls are executed by worker only.
- `state` is a checkpoint snapshot and may include references to artifacts rather than full large payloads.

### 6.2 agent_job_steps

Node-level execution trace.

```yaml
agent_job_steps:
  id: uuid primary key
  job_id: uuid references agent_jobs.id
  project_id: uuid references projects.id
  node_name: text
  step_index: integer
  status: queued | running | completed | failed | skipped | waiting_for_human
  input_ref: jsonb
  output_ref: jsonb
  token_usage: jsonb
  duration_ms: integer nullable
  error: jsonb nullable
  started_at: timestamptz nullable
  finished_at: timestamptz nullable
  created_at: timestamptz
```

### 6.3 agent_artifacts

Stores intermediate artifacts that are too large or too important to keep only inside `agent_jobs.state`.

```yaml
agent_artifacts:
  id: uuid primary key
  project_id: uuid references projects.id
  job_id: uuid references agent_jobs.id
  artifact_type: text
  artifact_name: text
  storage_path: text nullable
  payload: jsonb nullable
  sha256: text nullable
  created_at: timestamptz
```

Use for:

- brand truth sheet
- semantic strategy outputs
- graph outputs
- raw safe debug outputs
- repair outputs

## 7. Generated Content Tables

### 7.1 generated_assets

Represents SSoT-compliant UCA assets before final JSON export.

```yaml
generated_assets:
  id: uuid primary key
  project_id: uuid references projects.id
  uca_id: text not null
  type: text not null
  category: text not null
  title: text not null
  slug: text not null
  summary: text
  status: active | draft | suspended | archived
  review_status: approved | review_required | rejected | internal_only
  sort_order: integer
  pinned: boolean
  body: text nullable
  body_richtext: text nullable
  json_payload: jsonb
  relations: jsonb
  seo: jsonb
  source_basis: jsonb
  qa_status: unchecked | pass | warning | fail
  created_by_job_id: uuid references agent_jobs.id nullable
  created_at: timestamptz
  updated_at: timestamptz
```

Rules:

- `uca_id` must be unique per project.
- Public detailed assets require `body` and `body_richtext`.
- Forbidden types must never be exported.

### 7.2 gallery_albums

```yaml
gallery_albums:
  id: uuid primary key
  project_id: uuid references projects.id
  album_id: text not null
  title: text
  slug: text
  service_domain: text
  style_tags: text[]
  mood_tags: text[]
  vibe_vector_summary: jsonb
  representative_photo_id: text nullable
  cover_image_path: text nullable
  album_intro: text nullable
  portfolio_docent: text nullable
  related_asset_ids: jsonb
  status: active | draft | suspended
  review_status: approved | review_required | rejected
  sort_order: integer
  created_at: timestamptz
  updated_at: timestamptz
```

### 7.3 gallery_photos

`gallery_photos` are not public UCA types. They are exported to `gallery_photos.json`.

```yaml
gallery_photos:
  id: uuid primary key
  project_id: uuid references projects.id
  album_id: text not null
  photo_id: text not null
  source_image_id: uuid references source_images.id nullable
  file_name: text
  image_path: text
  thumbnail_path: text
  identity: jsonb
  visual_facts: jsonb
  taxonomy: jsonb
  copy: jsonb
  qa: jsonb
  rights_status: text
  review_status: text
  usage_role: text
  experience_mode: text nullable
  sort_order: integer
  created_at: timestamptz
  updated_at: timestamptz
```

### 7.4 album_taxonomy_nodes

```yaml
album_taxonomy_nodes:
  id: uuid primary key
  project_id: uuid references projects.id
  node_id: text not null
  node_type: scene | subject | mood | style | composition | vibe_cluster | service_domain
  label: text
  description: text nullable
  related_photo_ids: jsonb
  related_album_ids: jsonb
  sort_order: integer
  created_at: timestamptz
```

### 7.5 visual_asset_records

Tracks actual photos, AI visuals, diagrams, and placeholders.

```yaml
visual_asset_records:
  id: uuid primary key
  project_id: uuid references projects.id
  visual_asset_id: text not null
  source_type: actual_photo | ai_editorial_visual | ai_process_visual | ai_concept_visual | internal_moodboard | placeholder_visual
  file_name: text nullable
  storage_path: text nullable
  source_image_id: uuid references source_images.id nullable
  prompt_id: text nullable
  source_ssot_refs: jsonb
  intended_usage: jsonb
  allowed_pages: jsonb
  prohibited_pages: jsonb
  disclosure_required: boolean
  disclosure_text: text nullable
  rights_status: text
  qa_status: text
  can_represent_actual_work: boolean default false
  created_at: timestamptz
```

## 8. Semantic Output Tables

### 8.1 semantic_strategy_outputs

Stores search intent maps, QIS growth registry, entity keyword maps, local intent maps, and AI answer opportunity maps.

```yaml
semantic_strategy_outputs:
  id: uuid primary key
  project_id: uuid references projects.id
  output_type: search_intent_map | qis_growth_registry | entity_keyword_map | local_geo_intent_map | ai_answer_opportunity_map
  payload: jsonb
  created_by_job_id: uuid references agent_jobs.id nullable
  created_at: timestamptz
```

### 8.2 knowledge_graph_nodes

```yaml
knowledge_graph_nodes:
  id: uuid primary key
  project_id: uuid references projects.id
  node_id: text not null
  node_type: text not null
  label: text not null
  payload: jsonb
  confidence: numeric
  source_basis: jsonb
  created_at: timestamptz
```

### 8.3 knowledge_graph_edges

```yaml
knowledge_graph_edges:
  id: uuid primary key
  project_id: uuid references projects.id
  from_node_id: text not null
  relation: text not null
  to_node_id: text not null
  confidence: numeric
  evidence_ids: jsonb
  payload: jsonb
  created_at: timestamptz
```

### 8.4 schema_readiness_records

```yaml
schema_readiness_records:
  id: uuid primary key
  project_id: uuid references projects.id
  asset_id: text not null
  ssot_type: text not null
  target_schema_type: text not null
  required_fields: jsonb
  available_fields: jsonb
  missing_fields: jsonb
  eligibility_status: eligible | partial | not_eligible
  recommended_patch: text nullable
  created_at: timestamptz
```

### 8.5 growth_experiments

```yaml
growth_experiments:
  id: uuid primary key
  project_id: uuid references projects.id
  experiment_id: text not null
  hypothesis: text
  target_page: text nullable
  target_asset_ids: jsonb
  change_type: text
  before_state: jsonb
  proposed_change: jsonb
  expected_metric: jsonb
  priority_score: integer
  risk_level: low | medium | high
  status: backlog | planned | running | completed | cancelled
  start_date: date nullable
  review_date: date nullable
  created_at: timestamptz
```

## 9. QA and Review Tables

### 9.1 qa_reports

```yaml
qa_reports:
  id: uuid primary key
  project_id: uuid references projects.id
  job_id: uuid references agent_jobs.id nullable
  report_type: validation | semantic_photo | commercial_copy | schema_readiness | search_readiness | ux_copy | render_readiness | release_candidate
  status: pass | warning | fail | blocked
  report: jsonb
  created_at: timestamptz
```

### 9.2 qa_gate_results

```yaml
qa_gate_results:
  id: uuid primary key
  project_id: uuid references projects.id
  job_id: uuid references agent_jobs.id nullable
  gate_id: text
  gate_name: text
  status: pass | warning | fail | blocked
  severity: info | low | medium | high | critical
  summary: text
  findings: jsonb
  created_at: timestamptz
```

### 9.3 human_review_items

```yaml
human_review_items:
  id: uuid primary key
  project_id: uuid references projects.id
  item_type: claim | policy | price | review | image_rights | ai_visual | final_publish | schema | other
  target_table: text nullable
  target_id: text not null
  severity: low | medium | high | critical
  reason: text
  suggested_action: text nullable
  status: open | approved | rejected | resolved | deferred
  resolution_note: text nullable
  created_by_job_id: uuid references agent_jobs.id nullable
  resolved_by: uuid references profiles.id nullable
  created_at: timestamptz
  resolved_at: timestamptz nullable
```

## 10. Export Tables

### 10.1 generated_json_files

```yaml
generated_json_files:
  id: uuid primary key
  project_id: uuid references projects.id
  file_name: text
  file_group: upload | semantic_strategy | knowledge_graph | schema | ux_copy | visual_experience | growth | manifest | qa
  storage_path: text
  json_summary: jsonb
  sha256: text
  created_by_job_id: uuid references agent_jobs.id nullable
  created_at: timestamptz
```

### 10.2 export_packages

```yaml
export_packages:
  id: uuid primary key
  project_id: uuid references projects.id
  package_name: text
  version_label: text
  storage_path: text
  sha256: text
  manifest: jsonb
  status: generated | failed | expired | revoked
  generated_by_job_id: uuid references agent_jobs.id nullable
  created_at: timestamptz
```

## 11. Indexing Requirements

Minimum indexes:

```yaml
indexes:
  projects:
    - organization_id
    - tenant_slug
    - status

  source_images:
    - project_id
    - photo_id
    - rights_status

  agent_jobs:
    - project_id
    - status
    - current_node

  agent_job_steps:
    - job_id
    - project_id
    - node_name
    - status

  generated_assets:
    - project_id
    - uca_id unique per project
    - type
    - category
    - review_status

  gallery_photos:
    - project_id
    - album_id
    - photo_id unique per project

  knowledge_graph_nodes:
    - project_id
    - node_id unique per project

  knowledge_graph_edges:
    - project_id
    - from_node_id
    - to_node_id

  qa_gate_results:
    - project_id
    - gate_id
    - status

  human_review_items:
    - project_id
    - status
    - item_type
```

## 12. Status Vocabulary

```yaml
project_status:
  - draft
  - intake_ready
  - running
  - review_required
  - export_ready
  - exported
  - blocked

job_status:
  - queued
  - running
  - paused
  - review_required
  - completed
  - failed
  - cancelled

review_status:
  - approved
  - review_required
  - rejected
  - internal_only

qa_status:
  - unchecked
  - pass
  - warning
  - fail
  - blocked
```

## 13. Schema Drift Rule

The database schema, Zod schemas, and output contracts must not drift.

When changing a payload shape, update all of the following:

1. SQL schema or JSONB field expectation
2. `packages/schemas`
3. `packages/validators`
4. relevant docs
5. fixtures and tests

## 14. Acceptance Criteria

This database spec is implemented when:

```yaml
accepted_when:
  - all required tables exist in migrations
  - RLS policies exist for user-facing tables
  - service-role-only operations are documented
  - generated_assets can represent all public UCA assets
  - gallery_photos are stored separately from UCA
  - agent_jobs and agent_job_steps can track long-running workflows
  - export_packages can record final ZIP output
  - indexes support project-scoped queries
```
