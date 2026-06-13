# Task 030: JSON Export Service

## Goal
Implement export of required 8 JSON files and advanced JSON files.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/ZIP_ONBOARDING_OUTPUT_SPEC.md
- docs/backend/JSON_EXPORT_SERVICE_SPEC.md

## Files In Scope
You may edit:

```text
apps/worker/src/exporters/json-export.service.ts
packages/schemas/src/export-bundle.ts
packages/validators/src/export-json.validator.ts
tests/unit/json-export.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate required 8 JSON files.
- Generate advanced folders JSON when available.
- Ensure valid UTF-8 and valid JSON.
- Calculate SHA256 per file.

## Acceptance Criteria
- Required 8 files generated.
- Invalid UCA not exported as approved.
- SHA256 manifest entries available.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- json-export
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
