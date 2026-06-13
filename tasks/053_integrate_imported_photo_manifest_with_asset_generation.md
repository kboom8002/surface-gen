# Task 053: Integrate imported photo manifest with asset generation

## Goal
Modify photo/gallery/portfolio nodes to consume imported photo semantic manifests.

## Context Docs
Read these before coding:
- AGENTS.md
- docs/handoff/HANDOFF_IMPORT_OVERVIEW.md
- docs/handoff/IMAGE_ANALYSIS_HANDOFF_IMPORT_SPEC.md
- docs/handoff/HANDOFF_WORKFLOW_INTEGRATION_SPEC.md

## Files In Scope
You may edit:
- apps/worker/src/nodes/photo-taxonomy.node.ts
- apps/worker/src/nodes/photo-docent.node.ts
- apps/worker/src/nodes/portfolio-generation.node.ts
- apps/worker/src/nodes/visual-experience.node.ts
- tests/integration/imported-photo-manifest-generation.test.ts

## Requirements
- Prefer approved imported manifest over internal analysis.
- Use imported copy seeds where valid.
- Trigger selective reanalysis only when configured.
- Preserve review_required status.

## Acceptance Criteria
- Gallery generation works from imported manifest.
- Review-required photos are excluded from public hero selection.
- Internal mode remains unchanged.

## Verification Commands
```bash
pnpm typecheck
pnpm test
```

## Report Back
Summarize changed files, commands run, test results, and remaining risks.
