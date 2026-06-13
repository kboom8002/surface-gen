# Task 006: Upload Brand Factsheet

## Goal
Implement Brand Factsheet upload and source file persistence.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/BRAND_FACTSHEET_SCHEMA.md
- docs/frontend/UPLOAD_FLOW_SPEC.md
- docs/06_STORAGE_AND_FILE_SPEC.md

## Files In Scope
You may edit:

```text
apps/web/features/uploads/brand-factsheet-upload.tsx
apps/web/app/api/projects/[projectId]/files/route.ts
apps/web/lib/storage/upload.ts
packages/schemas/src/source-file.ts
```

## Do Not Edit

```text
apps/worker/src/nodes/*
supabase/migrations/*
```

## Requirements
- Support markdown, docx, txt, json, pdf metadata upload where feasible.
- Persist file record to source_files.
- Store file in source_uploads bucket or configured equivalent.
- Do not parse full content in this task unless already supported.

## Acceptance Criteria
- Upload succeeds for supported file.
- File record is created.
- User sees uploaded factsheet status.
- Unauthorized project access is blocked.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- uploads || true
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
