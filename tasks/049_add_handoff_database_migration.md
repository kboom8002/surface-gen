# Task 049: Add handoff database migration

## Goal
Add database tables for handoff imports, photo semantic analyses, and AI visual assets.

## Context Docs
Read these before coding:
- AGENTS.md
- docs/handoff/HANDOFF_IMPORT_OVERVIEW.md
- docs/backend/HANDOFF_IMPORT_SERVICE_SPEC.md
- docs/05_DATABASE_SCHEMA_SPEC.md

## Files In Scope
You may edit:
- supabase/migrations/*_handoff_imports.sql
- docs/backend/SUPABASE_SCHEMA.sql

## Requirements
- Create handoff_imports table.
- Create photo_semantic_analyses table.
- Create ai_visual_assets table.
- Add indexes and unique constraints.
- Do not weaken existing RLS assumptions.

## Acceptance Criteria
- Migration applies cleanly.
- Tables include project_id scoping.
- No service role exposure.

## Verification Commands
```bash
pnpm typecheck
pnpm test
```

## Report Back
Summarize changed files, commands run, test results, and remaining risks.
