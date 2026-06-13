# Task 007: Upload Images and Rights Metadata

## Goal
Implement image upload, batch upload metadata, and rights status editing.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/PHOTO_TAXONOMY_5D_VIBE_SPEC.md
- docs/frontend/UPLOAD_FLOW_SPEC.md
- docs/06_STORAGE_AND_FILE_SPEC.md

## Files In Scope
You may edit:

```text
apps/web/features/uploads/image-upload.tsx
apps/web/features/uploads/image-rights-editor.tsx
apps/web/app/api/projects/[projectId]/images/route.ts
apps/web/app/api/projects/[projectId]/images/[imageId]/route.ts
packages/schemas/src/source-image.ts
```

## Do Not Edit

```text
apps/worker/src/nodes/*
packages/prompts/*
```

## Requirements
- Support 20-100 image batch UX.
- Capture rights_status, contains_face, contains_logo, contains_customer_name, consent_status.
- Persist source_images records.
- Do not generate AI captions in this task.

## Acceptance Criteria
- Images upload and display.
- Rights metadata can be edited.
- Unknown rights remain review_required.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- images || true
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
