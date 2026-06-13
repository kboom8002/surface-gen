# Task 004: Create RLS Policies

## Goal
Create Supabase RLS policies for tenant/project scoped access.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/12_SECURITY_AND_RLS_SPEC.md
- docs/backend/SUPABASE_RLS_POLICIES.sql

## Files In Scope
You may edit:

```text
supabase/migrations/0002_rls_policies.sql
docs/backend/SUPABASE_RLS_POLICIES.sql
```

## Do Not Edit

```text
apps/web/*
apps/worker/*
packages/*
```

## Requirements
- Enable RLS on user-facing tables.
- Allow users to access only their own projects or organization-scoped projects.
- Keep service-role-only operations out of browser policies.
- Document assumptions clearly if org membership table is not implemented yet.

## Acceptance Criteria
- RLS enabled for project data tables.
- Policies do not allow public unrestricted access.
- Service role is not required for normal user reads of owned projects.

## Verification Commands

```bash
supabase db lint || true
```

## Report Back
After finishing, report:

- changed files
- commands run
- test results
- any known limitations
- remaining risks

## AI Pair-Coding Notes
- Follow `AGENTS.md` strictly.
- Do not introduce product requirements that are not in the referenced docs.
- Keep changes small and scoped.
- If a required file does not exist yet, create only the files listed in scope.
- If implementation requires changing a file outside scope, stop and report the reason.
