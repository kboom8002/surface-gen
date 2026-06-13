# Task 015: Photo Inventory Node

## Goal
Implement image inventory normalization and stable album/photo ID assignment.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/PHOTO_TAXONOMY_5D_VIBE_SPEC.md
- docs/domain/ZIP_ONBOARDING_OUTPUT_SPEC.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/photo-inventory.node.ts
packages/schemas/src/photo-inventory.ts
packages/validators/src/photo-inventory.validator.ts
tests/unit/photo-inventory.test.ts
```

## Do Not Edit

```text
apps/web/*
packages/prompts/*
```

## Requirements
- Assign album_id and photo_id.
- Normalize file names.
- Preserve original_file_name.
- Create image_path and thumbnail_path.
- Keep rights metadata.

## Acceptance Criteria
- IDs are stable for fixture.
- No duplicate photo_id.
- Image paths match naming rules.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- photo-inventory
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
