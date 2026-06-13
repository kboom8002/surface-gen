# Task 036: Export Center UI

## Goal
Implement export center for JSON and ZIP package generation/download.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/frontend/EXPORT_CENTER_SPEC.md
- docs/domain/ZIP_ONBOARDING_OUTPUT_SPEC.md

## Files In Scope
You may edit:

```text
apps/web/app/(dashboard)/projects/[projectId]/export/page.tsx
apps/web/features/export/export-checklist.tsx
apps/web/features/export/export-actions.tsx
apps/web/app/api/projects/[projectId]/export/json/route.ts
apps/web/app/api/projects/[projectId]/export/zip/route.ts
```

## Do Not Edit

```text
apps/worker/src/exporters/*
supabase/migrations/*
```

## Requirements
- Show required 8 JSON checklist.
- Show advanced output checklist.
- Trigger export job/API.
- Provide authorized download link.

## Acceptance Criteria
- Export checklist reflects current data.
- ZIP generation can be triggered.
- Downloads require authorization.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- export-center || true
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
