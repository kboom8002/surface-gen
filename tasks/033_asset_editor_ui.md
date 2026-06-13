# Task 033: Asset Editor UI

## Goal
Implement UCA asset list and detail editor.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/frontend/ASSET_EDITOR_SPEC.md
- docs/10_SSOT_OUTPUT_CONTRACT.md

## Files In Scope
You may edit:

```text
apps/web/app/(dashboard)/projects/[projectId]/assets/page.tsx
apps/web/features/assets/asset-table.tsx
apps/web/features/assets/asset-editor.tsx
apps/web/app/api/projects/[projectId]/assets/route.ts
apps/web/app/api/projects/[projectId]/assets/[assetId]/route.ts
```

## Do Not Edit

```text
apps/worker/*
supabase/migrations/*
```

## Requirements
- List generated assets.
- Filter by type, category, review_status.
- Edit safe fields.
- Show body_richtext and JSON payload.

## Acceptance Criteria
- Asset list loads.
- Edited asset validates before save.
- Forbidden type cannot be set.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- asset-editor || true
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
