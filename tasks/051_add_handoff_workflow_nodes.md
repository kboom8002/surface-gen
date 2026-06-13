# Task 051: Add handoff workflow nodes

## Goal
Add LangGraph nodes for handoff routing and import integration.

## Context Docs
Read these before coding:
- AGENTS.md
- docs/handoff/HANDOFF_IMPORT_OVERVIEW.md
- docs/handoff/HANDOFF_WORKFLOW_INTEGRATION_SPEC.md
- docs/04_AGENT_WORKFLOW_SPEC.md

## Files In Scope
You may edit:
- apps/worker/src/nodes/handoff-import-router.node.ts
- apps/worker/src/nodes/image-analysis-handoff-import.node.ts
- apps/worker/src/nodes/ai-visual-prompt-export.node.ts
- apps/worker/src/nodes/ai-visual-result-import.node.ts
- apps/worker/src/graphs/wedding-surface-factory.graph.ts
- tests/unit/handoff-workflow.test.ts

## Requirements
- Route graph by project handoff settings.
- Skip internal image analysis when approved import exists.
- Pause graph when waiting for AI visual generation.
- Resume after result import.

## Acceptance Criteria
- Graph routes correctly for full_internal, external_image_analysis, and prompt_only_ai_visual modes.
- Existing internal workflow still works.

## Verification Commands
```bash
pnpm typecheck
pnpm test
```

## Report Back
Summarize changed files, commands run, test results, and remaining risks.
