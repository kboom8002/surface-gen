# Task 034: Visual Semantic Editor UI

## Goal
Implement photo grid and semantic metadata editor.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/frontend/VISUAL_SEMANTIC_EDITOR_SPEC.md
- docs/domain/PHOTO_TAXONOMY_5D_VIBE_SPEC.md

## Files In Scope
You may edit:

```text
apps/web/app/(dashboard)/projects/[projectId]/visuals/page.tsx
apps/web/features/visuals/photo-grid.tsx
apps/web/features/visuals/photo-metadata-editor.tsx
apps/web/features/visuals/vibe-vector-editor.tsx
```

## Do Not Edit

```text
apps/worker/*
supabase/migrations/*
```

## Requirements
- Display uploaded/generated photos.
- Edit taxonomy, alt, caption, usage_role, rights_status.
- Flag missing rights.
- Do not allow public_use if rights unknown.

## Acceptance Criteria
- Photo grid loads.
- Metadata edits validate.
- Rights warnings visible.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- visual-editor || true
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
