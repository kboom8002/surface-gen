# Task 003: Create Supabase Schema

## Goal
Create initial Supabase SQL migrations for projects, files, images, jobs, generated assets, QA reports, and knowledge graph tables.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/05_DATABASE_SCHEMA_SPEC.md
- docs/backend/SUPABASE_SCHEMA.sql

## Files In Scope
You may edit:

```text
supabase/migrations/0001_initial_schema.sql
docs/backend/SUPABASE_SCHEMA.sql
```

## Do Not Edit

```text
apps/web/*
apps/worker/*
packages/*
```

## Requirements
- Implement core tables described in backend schema spec.
- Use uuid primary keys and created_at/updated_at timestamps.
- Add indexes for project_id, job status, UCA id, and knowledge graph ids.
- Do not add RLS policies in this task unless in scope.

## Acceptance Criteria
- Migration is valid SQL.
- All MVP tables exist.
- Generated asset table can store json_payload and body_richtext.

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
