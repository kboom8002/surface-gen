-- ============================================================
-- Migration 0003: claim_next_agent_job RPC + export_bundles table
-- Fixes BUG 1 (missing RPC) and BUG 2 (missing export_bundles table)
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. claim_next_agent_job RPC (BUG 1 FIX)
--    Called by the worker polling loop to atomically claim
--    the next queued job using FOR UPDATE SKIP LOCKED.
-- ──────────────────────────────────────────────────────────
create or replace function public.claim_next_agent_job()
returns uuid
language plpgsql
security definer
as $$
declare
  v_job_id uuid;
begin
  select id into v_job_id
  from public.agent_jobs
  where status = 'queued'
  order by created_at asc
  for update skip locked
  limit 1;

  if v_job_id is not null then
    update public.agent_jobs
    set
      status = 'running',
      started_at = now(),
      updated_at = now()
    where id = v_job_id;
  end if;

  return v_job_id;
end;
$$;

-- Grant execute to service role (worker uses service role)
grant execute on function public.claim_next_agent_job() to service_role;
-- Also grant to authenticated for any future admin UI needs
grant execute on function public.claim_next_agent_job() to authenticated;

-- ──────────────────────────────────────────────────────────
-- 2. export_bundles table (BUG 2 FIX)
--    The json-export node inserts the full assembled bundle
--    JSON structure here. Different from export_packages
--    (which stores the final ZIP file path).
-- ──────────────────────────────────────────────────────────
create table if not exists public.export_bundles (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references public.projects(id) on delete cascade,
  job_id             uuid references public.agent_jobs(id) on delete set null,
  tenant_slug        text not null,

  -- Bundle sections (canonical output structure)
  upload_bundle      jsonb,   -- 01_upload: UCAs, brand_profiles, gnb_ia_config, gallery, etc.
  semantic_strategy  jsonb,   -- 02_semantic_strategy: search intent, QIS registry
  knowledge_graph    jsonb,   -- 03_knowledge_graph: brand KG nodes+edges
  schema_map         jsonb,   -- 04_schema: schema readiness map + crosslink matrix
  ux_copy            jsonb,   -- 05_ux_copy: copy system
  visual_experience  jsonb,   -- 06_visual_experience: visual experience map + AI visual briefs
  qa_report          jsonb,   -- 09_qa: gate results, rejected assets

  -- Manifest metadata
  bundle_manifest    jsonb,   -- export metadata: asset_count, timestamp, sections

  -- Status
  status             text not null default 'pending'
                       check (status in ('pending', 'ready_for_zip', 'blocked_by_qa', 'packaging', 'delivered', 'failed')),

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Indexes
create index if not exists idx_export_bundles_project_id
  on public.export_bundles(project_id);

create index if not exists idx_export_bundles_job_id
  on public.export_bundles(job_id);

create index if not exists idx_export_bundles_status
  on public.export_bundles(status);

-- updated_at trigger
create trigger set_export_bundles_updated_at
  before update on public.export_bundles
  for each row execute function public.handle_updated_at();

-- ──────────────────────────────────────────────────────────
-- 3. RLS for export_bundles
-- ──────────────────────────────────────────────────────────
alter table public.export_bundles enable row level security;

-- Users can view export bundles for their own projects
create policy "Users can view their project export bundles"
  on public.export_bundles for select
  using (
    project_id in (
      select id from public.projects
      where created_by = auth.uid()
    )
  );

-- Service role bypasses RLS (worker writes here)
create policy "Service role full access to export_bundles"
  on public.export_bundles for all
  using (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────
-- 4. Add missing columns to agent_jobs if not present
--    (started_at may have been missing in initial schema)
-- ──────────────────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'agent_jobs'
      and column_name = 'started_at'
  ) then
    alter table public.agent_jobs add column started_at timestamptz;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'agent_jobs'
      and column_name = 'export_bundle_path'
  ) then
    alter table public.agent_jobs add column export_bundle_path text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'agent_jobs'
      and column_name = 'current_node'
  ) then
    alter table public.agent_jobs add column current_node text;
  end if;
end $$;

-- ──────────────────────────────────────────────────────────
-- 5. Fix agent_job_steps table name alias
--    The worker uses 'job_steps' shorthand — add a view
-- ──────────────────────────────────────────────────────────
-- (The worker correctly uses agent_job_steps — no alias needed)
-- Ensure message column exists for job step logging
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'agent_job_steps'
      and column_name = 'message'
  ) then
    alter table public.agent_job_steps add column message text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'agent_job_steps'
      and column_name = 'error_message'
  ) then
    alter table public.agent_job_steps add column error_message text;
  end if;
end $$;

-- ──────────────────────────────────────────────────────────
-- 6. generated_assets — ensure all columns exist
-- ──────────────────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'uca_id'
  ) then
    alter table public.generated_assets add column uca_id text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'asset_type'
  ) then
    alter table public.generated_assets add column asset_type text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'category'
  ) then
    alter table public.generated_assets add column category text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'slug'
  ) then
    alter table public.generated_assets add column slug text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'summary'
  ) then
    alter table public.generated_assets add column summary text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'body'
  ) then
    alter table public.generated_assets add column body text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'body_richtext'
  ) then
    alter table public.generated_assets add column body_richtext text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'review_status'
  ) then
    alter table public.generated_assets add column review_status text default 'pending_review';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'sort_order'
  ) then
    alter table public.generated_assets add column sort_order integer default 0;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_assets'
      and column_name = 'json_payload'
  ) then
    alter table public.generated_assets add column json_payload jsonb default '{}'::jsonb;
  end if;
end $$;
