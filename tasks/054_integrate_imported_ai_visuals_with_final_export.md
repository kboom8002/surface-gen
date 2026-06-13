# Task 054: Integrate imported AI visuals with final export

## Goal
Add externally generated AI visuals to visual_asset_url_map_master and richmedia blocks safely.

## Context Docs
Read these before coding:
- AGENTS.md
- docs/handoff/HANDOFF_IMPORT_OVERVIEW.md
- docs/handoff/AI_VISUAL_GENERATION_HANDOFF_SPEC.md
- docs/handoff/HANDOFF_IMPORT_VALIDATION_SPEC.md

## Files In Scope
You may edit:
- apps/worker/src/exporters/visual-asset-map.exporter.ts
- apps/worker/src/nodes/richmedia-assembly.node.ts
- packages/validators/src/ai-visual-policy.validator.ts
- tests/integration/imported-ai-visual-export.test.ts

## Requirements
- Only accepted AI visual results are exported.
- Preserve disclosure metadata.
- Enforce prohibited_pages.
- Ensure can_represent_actual_work false.

## Acceptance Criteria
- visual_asset_url_map_master contains accepted imported AI visuals.
- AI visual without disclosure fails when required.
- AI visual cannot appear in actual portfolio proof slots.

## Verification Commands
```bash
pnpm typecheck
pnpm test
```

## Report Back
Summarize changed files, commands run, test results, and remaining risks.
