# Task 050: Implement handoff import API routes

## Goal
Implement API contract for upload, validation, accept, reject, and prompt package export.

## Context Docs
Read these before coding:
- AGENTS.md
- docs/handoff/HANDOFF_IMPORT_OVERVIEW.md
- docs/backend/HANDOFF_IMPORT_SERVICE_SPEC.md
- docs/07_API_CONTRACTS.md

## Files In Scope
You may edit:
- apps/web/app/api/projects/[projectId]/handoff/**
- apps/web/lib/server/handoff-service.ts
- tests/integration/handoff-api.test.ts

## Requirements
- Add route handlers.
- Validate auth and project access.
- Store raw imports.
- Return import reports.
- Do not run long extraction/model tasks inline.

## Acceptance Criteria
- Unauthorized access blocked.
- Valid request creates handoff_import.
- Invalid manifest returns validation error.

## Verification Commands
```bash
pnpm typecheck
pnpm test
```

## Report Back
Summarize changed files, commands run, test results, and remaining risks.
