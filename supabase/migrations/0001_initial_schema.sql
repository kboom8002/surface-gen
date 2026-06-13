-- Wedding Surface Agent — Initial Schema Migration
-- Task 003: Create Supabase Schema
-- Source: docs/backend/SUPABASE_SCHEMA.sql
-- Review before production use.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Profiles and Organizations
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  default_organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deferred FK: profiles.default_organization_id → organizations.id
-- Added after organizations table exists.
alter table public.profiles
  add constraint profiles_default_organization_fk
  foreign key (default_organization_id) references public.organizations(id);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'operator', 'reviewer', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Projects and Intake
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_slug text not null,
  official_brand_name text not null,
  industry_type text not null default 'wedding_sdm',
  status text not null default 'draft' check (
    status in ('draft', 'intake_ready', 'running', 'review_required', 'export_ready', 'exported', 'blocked')
  ),
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, tenant_slug)
);

create table if not exists public.source_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_type text not null check (
    file_type in ('brand_factsheet', 'package_policy', 'evidence', 'reference', 'other')
  ),
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  parse_status text not null default 'pending' check (
    parse_status in ('pending', 'parsed', 'failed', 'skipped')
  ),
  extracted_text text,
  extracted_json jsonb not null default '{}'::jsonb,
  checksum_sha256 text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.source_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  original_file_name text not null,
  normalized_file_name text,
  storage_path text not null,
  thumbnail_path text,
  album_id text,
  photo_id text,
  sequence_index integer,
  rights_status text not null default 'unknown' check (
    rights_status in ('approved', 'review_required', 'restricted', 'rejected', 'unknown')
  ),
  contains_face boolean,
  contains_logo boolean,
  contains_customer_name boolean,
  consent_status text not null default 'unknown' check (
    consent_status in ('approved', 'review_required', 'restricted', 'unknown')
  ),
  public_use_allowed boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  checksum_sha256 text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Agent Runtime
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  job_type text not null check (
    job_type in ('full_factory', 'partial_regeneration', 'qa_only', 'export_only')
  ),
  status text not null default 'queued' check (
    status in ('queued', 'running', 'paused', 'review_required', 'completed', 'failed', 'cancelled')
  ),
  current_node text,
  state jsonb not null default '{}'::jsonb,
  retry_count jsonb not null default '{}'::jsonb,
  error jsonb,
  requested_by uuid references public.profiles(id),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_job_steps (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.agent_jobs(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  node_name text not null,
  step_index integer not null default 0,
  status text not null check (
    status in ('queued', 'running', 'completed', 'failed', 'skipped', 'waiting_for_human')
  ),
  input_ref jsonb not null default '{}'::jsonb,
  output_ref jsonb not null default '{}'::jsonb,
  token_usage jsonb not null default '{}'::jsonb,
  duration_ms integer,
  error jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  job_id uuid references public.agent_jobs(id) on delete set null,
  artifact_type text not null,
  artifact_name text not null,
  storage_path text,
  payload jsonb,
  sha256 text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Generated Content
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uca_id text not null,
  type text not null,
  category text not null,
  title text not null,
  slug text not null,
  summary text,
  status text not null default 'draft' check (
    status in ('active', 'draft', 'suspended', 'archived')
  ),
  review_status text not null default 'review_required' check (
    review_status in ('approved', 'review_required', 'rejected', 'internal_only')
  ),
  sort_order integer not null default 1000,
  pinned boolean not null default false,
  body text,
  body_richtext text,
  json_payload jsonb not null default '{}'::jsonb,
  relations jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  source_basis jsonb not null default '[]'::jsonb,
  qa_status text not null default 'unchecked' check (
    qa_status in ('unchecked', 'pass', 'warning', 'fail')
  ),
  created_by_job_id uuid references public.agent_jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, uca_id)
);

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  album_id text not null,
  title text not null,
  slug text not null,
  service_domain text,
  style_tags text[] not null default '{}',
  mood_tags text[] not null default '{}',
  vibe_vector_summary jsonb not null default '{}'::jsonb,
  representative_photo_id text,
  cover_image_path text,
  album_intro text,
  portfolio_docent text,
  related_asset_ids jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (
    status in ('active', 'draft', 'suspended')
  ),
  review_status text not null default 'review_required' check (
    review_status in ('approved', 'review_required', 'rejected')
  ),
  sort_order integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, album_id)
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  album_id text not null,
  photo_id text not null,
  source_image_id uuid references public.source_images(id) on delete set null,
  file_name text not null,
  image_path text not null,
  thumbnail_path text,
  identity jsonb not null default '{}'::jsonb,
  visual_facts jsonb not null default '{}'::jsonb,
  taxonomy jsonb not null default '{}'::jsonb,
  copy jsonb not null default '{}'::jsonb,
  qa jsonb not null default '{}'::jsonb,
  rights_status text not null default 'unknown',
  review_status text not null default 'review_required',
  usage_role text,
  experience_mode text,
  sort_order integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, photo_id)
);

create table if not exists public.album_taxonomy_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  node_id text not null,
  node_type text not null check (
    node_type in ('scene', 'subject', 'mood', 'style', 'composition', 'vibe_cluster', 'service_domain')
  ),
  label text not null,
  description text,
  related_photo_ids jsonb not null default '[]'::jsonb,
  related_album_ids jsonb not null default '[]'::jsonb,
  sort_order integer not null default 1000,
  created_at timestamptz not null default now(),
  unique (project_id, node_id)
);

create table if not exists public.visual_asset_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  visual_asset_id text not null,
  source_type text not null check (
    source_type in (
      'actual_photo',
      'ai_editorial_visual',
      'ai_process_visual',
      'ai_concept_visual',
      'internal_moodboard',
      'placeholder_visual'
    )
  ),
  file_name text,
  storage_path text,
  source_image_id uuid references public.source_images(id) on delete set null,
  prompt_id text,
  source_ssot_refs jsonb not null default '[]'::jsonb,
  intended_usage jsonb not null default '{}'::jsonb,
  allowed_pages jsonb not null default '[]'::jsonb,
  prohibited_pages jsonb not null default '[]'::jsonb,
  disclosure_required boolean not null default false,
  disclosure_text text,
  rights_status text not null default 'review_required',
  qa_status text not null default 'unchecked',
  can_represent_actual_work boolean not null default false,
  created_at timestamptz not null default now(),
  unique (project_id, visual_asset_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Semantic Strategy Outputs
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.semantic_strategy_outputs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  output_type text not null check (
    output_type in (
      'search_intent_map',
      'qis_growth_registry',
      'entity_keyword_map',
      'local_geo_intent_map',
      'ai_answer_opportunity_map'
    )
  ),
  payload jsonb not null default '{}'::jsonb,
  created_by_job_id uuid references public.agent_jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (project_id, output_type)
);

create table if not exists public.knowledge_graph_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  node_id text not null,
  node_type text not null,
  label text not null,
  payload jsonb not null default '{}'::jsonb,
  confidence numeric not null default 1.0,
  source_basis jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, node_id)
);

create table if not exists public.knowledge_graph_edges (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  from_node_id text not null,
  relation text not null,
  to_node_id text not null,
  confidence numeric not null default 1.0,
  evidence_ids jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.schema_readiness_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_id text not null,
  ssot_type text not null,
  target_schema_type text not null,
  required_fields jsonb not null default '[]'::jsonb,
  available_fields jsonb not null default '[]'::jsonb,
  missing_fields jsonb not null default '[]'::jsonb,
  eligibility_status text not null check (
    eligibility_status in ('eligible', 'partial', 'not_eligible')
  ),
  recommended_patch text,
  created_at timestamptz not null default now(),
  unique (project_id, asset_id, target_schema_type)
);

create table if not exists public.growth_experiments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  experiment_id text not null,
  hypothesis text not null,
  target_page text,
  target_asset_ids jsonb not null default '[]'::jsonb,
  change_type text,
  before_state jsonb not null default '{}'::jsonb,
  proposed_change jsonb not null default '{}'::jsonb,
  expected_metric jsonb not null default '[]'::jsonb,
  priority_score integer not null default 0,
  risk_level text not null default 'medium' check (
    risk_level in ('low', 'medium', 'high')
  ),
  status text not null default 'backlog' check (
    status in ('backlog', 'planned', 'running', 'completed', 'cancelled')
  ),
  start_date date,
  review_date date,
  created_at timestamptz not null default now(),
  unique (project_id, experiment_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. QA and Human Review
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.qa_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  job_id uuid references public.agent_jobs(id) on delete set null,
  report_type text not null,
  status text not null check (
    status in ('pass', 'warning', 'fail', 'blocked')
  ),
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.qa_gate_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  job_id uuid references public.agent_jobs(id) on delete set null,
  gate_id text not null,
  gate_name text not null,
  status text not null check (
    status in ('pass', 'warning', 'fail', 'blocked')
  ),
  severity text not null check (
    severity in ('info', 'low', 'medium', 'high', 'critical')
  ),
  summary text not null,
  findings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.human_review_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  item_type text not null check (
    item_type in (
      'claim', 'policy', 'price', 'review', 'image_rights',
      'ai_visual', 'final_publish', 'schema', 'other'
    )
  ),
  target_table text,
  target_id text not null,
  severity text not null default 'medium' check (
    severity in ('low', 'medium', 'high', 'critical')
  ),
  reason text not null,
  suggested_action text,
  status text not null default 'open' check (
    status in ('open', 'approved', 'rejected', 'resolved', 'deferred')
  ),
  resolution_note text,
  created_by_job_id uuid references public.agent_jobs(id) on delete set null,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Export and Generated Files
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.generated_json_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_name text not null,
  file_group text not null check (
    file_group in (
      'upload', 'semantic_strategy', 'knowledge_graph', 'schema',
      'ux_copy', 'visual_experience', 'growth', 'manifest', 'qa'
    )
  ),
  storage_path text not null,
  json_summary jsonb not null default '{}'::jsonb,
  sha256 text,
  created_by_job_id uuid references public.agent_jobs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.export_packages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  package_name text not null,
  version_label text,
  storage_path text not null,
  sha256 text,
  manifest jsonb not null default '{}'::jsonb,
  status text not null default 'generated' check (
    status in ('generated', 'failed', 'expired', 'revoked')
  ),
  generated_by_job_id uuid references public.agent_jobs(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Indexes
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists idx_projects_organization_id on public.projects(organization_id);
create index if not exists idx_projects_status on public.projects(status);

create index if not exists idx_source_files_project_id on public.source_files(project_id);

create index if not exists idx_source_images_project_id on public.source_images(project_id);
create index if not exists idx_source_images_photo_id on public.source_images(project_id, photo_id);
create index if not exists idx_source_images_rights_status on public.source_images(rights_status);

create index if not exists idx_agent_jobs_project_status on public.agent_jobs(project_id, status);

create index if not exists idx_agent_job_steps_job_id on public.agent_job_steps(job_id);
create index if not exists idx_agent_job_steps_project_node on public.agent_job_steps(project_id, node_name);

create index if not exists idx_generated_assets_project_type on public.generated_assets(project_id, type);
create index if not exists idx_generated_assets_project_category on public.generated_assets(project_id, category);
create index if not exists idx_generated_assets_review_status on public.generated_assets(review_status);

create index if not exists idx_gallery_photos_project_album on public.gallery_photos(project_id, album_id);

create index if not exists idx_kg_nodes_project_type on public.knowledge_graph_nodes(project_id, node_type);
create index if not exists idx_kg_edges_project_from on public.knowledge_graph_edges(project_id, from_node_id);
create index if not exists idx_kg_edges_project_to on public.knowledge_graph_edges(project_id, to_node_id);

create index if not exists idx_qa_gate_results_project_status on public.qa_gate_results(project_id, status);
create index if not exists idx_review_items_project_status on public.human_review_items(project_id, status);
create index if not exists idx_export_packages_project on public.export_packages(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. updated_at auto-update trigger
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to all tables that have the column
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger trg_source_images_updated_at
  before update on public.source_images
  for each row execute function public.handle_updated_at();

create trigger trg_agent_jobs_updated_at
  before update on public.agent_jobs
  for each row execute function public.handle_updated_at();

create trigger trg_generated_assets_updated_at
  before update on public.generated_assets
  for each row execute function public.handle_updated_at();

create trigger trg_gallery_albums_updated_at
  before update on public.gallery_albums
  for each row execute function public.handle_updated_at();

create trigger trg_gallery_photos_updated_at
  before update on public.gallery_photos
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Row Level Security — enablement
-- RLS policies are defined in migration 0002_rls_policies.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.source_files enable row level security;
alter table public.source_images enable row level security;
alter table public.agent_jobs enable row level security;
alter table public.agent_job_steps enable row level security;
alter table public.agent_artifacts enable row level security;
alter table public.generated_assets enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.album_taxonomy_nodes enable row level security;
alter table public.visual_asset_records enable row level security;
alter table public.semantic_strategy_outputs enable row level security;
alter table public.knowledge_graph_nodes enable row level security;
alter table public.knowledge_graph_edges enable row level security;
alter table public.schema_readiness_records enable row level security;
alter table public.growth_experiments enable row level security;
alter table public.qa_reports enable row level security;
alter table public.qa_gate_results enable row level security;
alter table public.human_review_items enable row level security;
alter table public.generated_json_files enable row level security;
alter table public.export_packages enable row level security;
