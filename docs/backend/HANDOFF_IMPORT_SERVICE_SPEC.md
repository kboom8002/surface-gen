# Handoff Import Service Spec

## 1. Purpose

The handoff import service validates and persists external artifact packages.

It supports:

- external image analysis packages
- external AI visual generation result packages

---

## 2. API Routes

```yaml
routes:
  create_handoff_upload:
    method: POST
    path: /api/projects/:projectId/handoff/uploads
    body:
      handoff_type: image_analysis | ai_visual_generation_result
      file_count: number
    result:
      upload_id: string
      signed_upload_urls: string[]

  validate_handoff_upload:
    method: POST
    path: /api/projects/:projectId/handoff/:uploadId/validate
    result:
      handoff_import_report: object

  accept_handoff_upload:
    method: POST
    path: /api/projects/:projectId/handoff/:uploadId/accept
    result:
      imported_record_count: number
      review_item_count: number

  reject_handoff_upload:
    method: POST
    path: /api/projects/:projectId/handoff/:uploadId/reject
    result:
      status: rejected

  export_ai_visual_prompt_package:
    method: POST
    path: /api/projects/:projectId/handoff/ai-visual-prompts/export
    result:
      file_id: string
      download_url: string
```

---

## 3. Database Tables

```sql
create table handoff_imports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  handoff_type text not null,
  status text not null default 'uploaded',
  storage_prefix text not null,
  report jsonb default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  validated_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz
);

create table photo_semantic_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source_image_id uuid references source_images(id) on delete set null,
  handoff_import_id uuid references handoff_imports(id) on delete set null,
  photo_id text not null,
  album_id text not null,
  analysis_source text not null,
  analysis_version text not null,
  visible_facts jsonb not null default '{}'::jsonb,
  taxonomy jsonb not null default '{}'::jsonb,
  copy jsonb not null default '{}'::jsonb,
  qa jsonb not null default '{}'::jsonb,
  confidence numeric,
  review_status text not null default 'review_required',
  created_at timestamptz default now(),
  unique(project_id, photo_id, analysis_version)
);

create table ai_visual_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  handoff_import_id uuid references handoff_imports(id) on delete set null,
  visual_asset_id text not null,
  prompt_id text not null,
  source_type text not null,
  file_path text,
  prompt_payload jsonb not null default '{}'::jsonb,
  generation_result jsonb default '{}'::jsonb,
  disclosure_required boolean not null default true,
  disclosure_text text,
  can_represent_actual_work boolean not null default false,
  review_status text not null default 'review_required',
  created_at timestamptz default now(),
  unique(project_id, visual_asset_id)
);
```

---

## 4. Storage Prefixes

```yaml
storage_prefixes:
  handoff_raw:
    path: projects/{project_id}/handoffs/{handoff_import_id}/raw/

  handoff_extracted:
    path: projects/{project_id}/handoffs/{handoff_import_id}/extracted/

  accepted_images:
    path: projects/{project_id}/images/albums/

  accepted_ai_visuals:
    path: projects/{project_id}/images/ai_visuals/
```

---

## 5. Service Responsibilities

```yaml
handoff_import_service:
  - create upload record
  - store raw package
  - safely extract zip if needed
  - reject path traversal
  - parse manifest JSON
  - validate schema
  - verify file references
  - create import report
  - persist accepted records
  - create human review items
  - update project handoff settings
```
