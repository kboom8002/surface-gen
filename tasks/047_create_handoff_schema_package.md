# Task 047: Create handoff schema package

## Goal
Add Zod schemas for all handoff import manifests and reports.

## Context Docs
Read these before coding:
- AGENTS.md
- docs/handoff/HANDOFF_IMPORT_OVERVIEW.md
- docs/handoff/IMAGE_ANALYSIS_HANDOFF_IMPORT_SPEC.md
- docs/handoff/AI_VISUAL_GENERATION_HANDOFF_SPEC.md
- docs/handoff/HANDOFF_IMPORT_VALIDATION_SPEC.md

## Files In Scope
You may edit:
- packages/schemas/src/handoff.ts
- packages/schemas/src/index.ts
- tests/unit/handoff-schema.test.ts

## Requirements
- Define handoff_manifest schema.
- Define photo_semantic_manifest schema.
- Define ai_visual_generation_result_manifest schema.
- Define handoff_import_report schema.
- Export TypeScript types.

## Acceptance Criteria
- Valid fixtures parse.
- Invalid AI visual with can_represent_actual_work true fails.
- Invalid image analysis manifest with missing photo_id fails.

## Verification Commands
```bash
pnpm typecheck
pnpm test
```

## Report Back
Summarize changed files, commands run, test results, and remaining risks.
