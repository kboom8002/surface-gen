-- Wedding Surface Agent — RLS Policies Migration
-- Task 004: Create RLS Policies
-- Source: docs/backend/SUPABASE_RLS_POLICIES.sql
-- Review and harden before production.
--
-- ASSUMPTIONS:
--   - organization_members table is fully implemented (see migration 0001).
--   - Service role operations (worker writes) bypass RLS automatically in server-only context.
--   - Normal browser users only access projects they are organization members of.
--   - Viewer role can read but not insert/update.
--   - Reviewer role can read and update human_review_items but not create agent jobs.
--   - Operator/Admin/Owner can insert and update project data.

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper Functions (security definer — execute as function owner, not caller)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.org_role(org_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select om.role
  from public.organization_members om
  where om.organization_id = org_id
    and om.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_operate_org(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.org_role(org_id) in ('owner', 'admin', 'operator'), false);
$$;

create or replace function public.can_review_org(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.org_role(org_id) in ('owner', 'admin', 'operator', 'reviewer'), false);
$$;

create or replace function public.can_access_project(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    join public.organization_members om on om.organization_id = p.organization_id
    where p.id = project_uuid
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.can_operate_project(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    join public.organization_members om on om.organization_id = p.organization_id
    where p.id = project_uuid
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin', 'operator')
  );
$$;

create or replace function public.can_review_project(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    join public.organization_members om on om.organization_id = p.organization_id
    where p.id = project_uuid
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin', 'operator', 'reviewer')
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles
-- Users can only see and update their own profile.
-- ─────────────────────────────────────────────────────────────────────────────

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- organizations
-- Members can read their org. Only owner/admin can update.
-- Authenticated users can create orgs (they become owner via application logic).
-- ─────────────────────────────────────────────────────────────────────────────

create policy "organizations_select_member" on public.organizations
  for select using (public.is_org_member(id));

create policy "organizations_insert_authenticated" on public.organizations
  for insert with check (created_by = auth.uid());

create policy "organizations_update_owner_admin" on public.organizations
  for update using (public.org_role(id) in ('owner', 'admin'))
  with check (public.org_role(id) in ('owner', 'admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- organization_members
-- Members can see who else is in their org.
-- Only owner/admin can add or update membership records.
-- ─────────────────────────────────────────────────────────────────────────────

create policy "organization_members_select_member" on public.organization_members
  for select using (public.is_org_member(organization_id));

create policy "organization_members_insert_owner_admin" on public.organization_members
  for insert with check (public.org_role(organization_id) in ('owner', 'admin'));

create policy "organization_members_update_owner_admin" on public.organization_members
  for update using (public.org_role(organization_id) in ('owner', 'admin'))
  with check (public.org_role(organization_id) in ('owner', 'admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- projects
-- Any org member can read projects in their org.
-- Only operator+ can create or update projects.
-- ─────────────────────────────────────────────────────────────────────────────

create policy "projects_select_member" on public.projects
  for select using (public.is_org_member(organization_id));

create policy "projects_insert_operator" on public.projects
  for insert with check (public.can_operate_org(organization_id));

create policy "projects_update_operator" on public.projects
  for update using (public.can_operate_org(organization_id))
  with check (public.can_operate_org(organization_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- source_files
-- ─────────────────────────────────────────────────────────────────────────────

create policy "source_files_select_project" on public.source_files
  for select using (public.can_access_project(project_id));

create policy "source_files_insert_operator" on public.source_files
  for insert with check (public.can_operate_project(project_id));

create policy "source_files_update_operator" on public.source_files
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- source_images
-- ─────────────────────────────────────────────────────────────────────────────

create policy "source_images_select_project" on public.source_images
  for select using (public.can_access_project(project_id));

create policy "source_images_insert_operator" on public.source_images
  for insert with check (public.can_operate_project(project_id));

create policy "source_images_update_operator" on public.source_images
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- agent_jobs
-- Members can read job status. Only operators can create/update jobs.
-- Workers use service role and bypass RLS — this is intentional.
-- ─────────────────────────────────────────────────────────────────────────────

create policy "agent_jobs_select_project" on public.agent_jobs
  for select using (public.can_access_project(project_id));

create policy "agent_jobs_insert_operator" on public.agent_jobs
  for insert with check (public.can_operate_project(project_id));

create policy "agent_jobs_update_operator" on public.agent_jobs
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- agent_job_steps
-- Read-only for project members. Workers write via service role (bypasses RLS).
-- ─────────────────────────────────────────────────────────────────────────────

create policy "agent_job_steps_select_project" on public.agent_job_steps
  for select using (public.can_access_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- agent_artifacts
-- Read-only for project members.
-- ─────────────────────────────────────────────────────────────────────────────

create policy "agent_artifacts_select_project" on public.agent_artifacts
  for select using (public.can_access_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- generated_assets
-- ─────────────────────────────────────────────────────────────────────────────

create policy "generated_assets_select_project" on public.generated_assets
  for select using (public.can_access_project(project_id));

create policy "generated_assets_insert_operator" on public.generated_assets
  for insert with check (public.can_operate_project(project_id));

create policy "generated_assets_update_operator" on public.generated_assets
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- gallery_albums
-- ─────────────────────────────────────────────────────────────────────────────

create policy "gallery_albums_select_project" on public.gallery_albums
  for select using (public.can_access_project(project_id));

create policy "gallery_albums_insert_operator" on public.gallery_albums
  for insert with check (public.can_operate_project(project_id));

create policy "gallery_albums_update_operator" on public.gallery_albums
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- gallery_photos
-- ─────────────────────────────────────────────────────────────────────────────

create policy "gallery_photos_select_project" on public.gallery_photos
  for select using (public.can_access_project(project_id));

create policy "gallery_photos_insert_operator" on public.gallery_photos
  for insert with check (public.can_operate_project(project_id));

create policy "gallery_photos_update_operator" on public.gallery_photos
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- album_taxonomy_nodes
-- ─────────────────────────────────────────────────────────────────────────────

create policy "album_taxonomy_nodes_select_project" on public.album_taxonomy_nodes
  for select using (public.can_access_project(project_id));

create policy "album_taxonomy_nodes_insert_operator" on public.album_taxonomy_nodes
  for insert with check (public.can_operate_project(project_id));

create policy "album_taxonomy_nodes_update_operator" on public.album_taxonomy_nodes
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- visual_asset_records
-- ─────────────────────────────────────────────────────────────────────────────

create policy "visual_asset_records_select_project" on public.visual_asset_records
  for select using (public.can_access_project(project_id));

create policy "visual_asset_records_insert_operator" on public.visual_asset_records
  for insert with check (public.can_operate_project(project_id));

create policy "visual_asset_records_update_operator" on public.visual_asset_records
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- semantic_strategy_outputs
-- ─────────────────────────────────────────────────────────────────────────────

create policy "semantic_strategy_outputs_select_project" on public.semantic_strategy_outputs
  for select using (public.can_access_project(project_id));

create policy "semantic_strategy_outputs_insert_operator" on public.semantic_strategy_outputs
  for insert with check (public.can_operate_project(project_id));

create policy "semantic_strategy_outputs_update_operator" on public.semantic_strategy_outputs
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- knowledge_graph_nodes and edges
-- ─────────────────────────────────────────────────────────────────────────────

create policy "kg_nodes_select_project" on public.knowledge_graph_nodes
  for select using (public.can_access_project(project_id));

create policy "kg_nodes_insert_operator" on public.knowledge_graph_nodes
  for insert with check (public.can_operate_project(project_id));

create policy "kg_nodes_update_operator" on public.knowledge_graph_nodes
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

create policy "kg_edges_select_project" on public.knowledge_graph_edges
  for select using (public.can_access_project(project_id));

create policy "kg_edges_insert_operator" on public.knowledge_graph_edges
  for insert with check (public.can_operate_project(project_id));

create policy "kg_edges_update_operator" on public.knowledge_graph_edges
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- schema_readiness_records and growth_experiments
-- ─────────────────────────────────────────────────────────────────────────────

create policy "schema_readiness_select_project" on public.schema_readiness_records
  for select using (public.can_access_project(project_id));

create policy "schema_readiness_insert_operator" on public.schema_readiness_records
  for insert with check (public.can_operate_project(project_id));

create policy "schema_readiness_update_operator" on public.schema_readiness_records
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

create policy "growth_experiments_select_project" on public.growth_experiments
  for select using (public.can_access_project(project_id));

create policy "growth_experiments_insert_operator" on public.growth_experiments
  for insert with check (public.can_operate_project(project_id));

create policy "growth_experiments_update_operator" on public.growth_experiments
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- QA and human review
-- Reviewers can update human_review_items (mark as approved/rejected/resolved).
-- ─────────────────────────────────────────────────────────────────────────────

create policy "qa_reports_select_project" on public.qa_reports
  for select using (public.can_access_project(project_id));

create policy "qa_reports_insert_operator" on public.qa_reports
  for insert with check (public.can_operate_project(project_id));

create policy "qa_gate_results_select_project" on public.qa_gate_results
  for select using (public.can_access_project(project_id));

create policy "qa_gate_results_insert_operator" on public.qa_gate_results
  for insert with check (public.can_operate_project(project_id));

create policy "human_review_items_select_project" on public.human_review_items
  for select using (public.can_access_project(project_id));

create policy "human_review_items_insert_operator" on public.human_review_items
  for insert with check (public.can_operate_project(project_id));

-- Reviewers (including operators) can update review items — resolving, approving, deferring.
create policy "human_review_items_update_reviewer" on public.human_review_items
  for update using (public.can_review_project(project_id))
  with check (public.can_review_project(project_id));

-- ─────────────────────────────────────────────────────────────────────────────
-- Export and generated JSON files
-- ─────────────────────────────────────────────────────────────────────────────

create policy "generated_json_files_select_project" on public.generated_json_files
  for select using (public.can_access_project(project_id));

create policy "generated_json_files_insert_operator" on public.generated_json_files
  for insert with check (public.can_operate_project(project_id));

create policy "export_packages_select_project" on public.export_packages
  for select using (public.can_access_project(project_id));

create policy "export_packages_insert_operator" on public.export_packages
  for insert with check (public.can_operate_project(project_id));

create policy "export_packages_update_operator" on public.export_packages
  for update using (public.can_operate_project(project_id))
  with check (public.can_operate_project(project_id));
