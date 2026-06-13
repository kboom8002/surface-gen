# Task 048: Create handoff import validators

## Goal
Implement deterministic validators for imported handoff packages.

## Context Docs
Read these before coding:
- AGENTS.md
- docs/handoff/HANDOFF_IMPORT_OVERVIEW.md
- docs/handoff/HANDOFF_IMPORT_VALIDATION_SPEC.md

## Files In Scope
You may edit:
- packages/validators/src/handoff-import.validator.ts
- packages/validators/src/index.ts
- tests/unit/handoff-import.validator.test.ts

## Requirements
- Validate file references.
- Validate duplicate photo_id and visual_asset_id.
- Validate AI visual safety rules.
- Produce HandoffImportReport-compatible results.

## Acceptance Criteria
- Fatal issues are reported as fatal.
- Review-required issues create review flags.
- Valid package passes.

## Verification Commands
```bash
pnpm typecheck
pnpm test
```

## Report Back
Summarize changed files, commands run, test results, and remaining risks.
