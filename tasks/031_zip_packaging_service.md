# Task 031: ZIP Packaging Service

## Goal
Implement onboarding ZIP packaging with manifests and image references.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/ZIP_ONBOARDING_OUTPUT_SPEC.md
- docs/backend/ZIP_PACKAGING_SERVICE_SPEC.md

## Files In Scope
You may edit:

```text
apps/worker/src/exporters/zip-packaging.service.ts
scripts/package-zip/README.md
packages/validators/src/zip-manifest.validator.ts
tests/unit/zip-packaging.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Create canonical folder structure.
- Place required 8 JSON under 01_upload.
- Add final_package_manifest.json and sha256_manifest.json.
- Avoid competing UCA filenames outside 01_upload.

## Acceptance Criteria
- ZIP contains canonical folders.
- Manifest matches file contents.
- UCA dedup safety passes.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- zip-packaging
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
