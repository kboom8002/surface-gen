# Task 009: LangGraph Worker Skeleton

## Goal
Create the worker entrypoint and LangGraph skeleton with checkpoint-friendly state flow.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/agents/AGENT_STATE_SCHEMA.md
- docs/agents/LANGGRAPH_NODE_SPEC.md
- docs/backend/BACKGROUND_WORKER_SPEC.md

## Files In Scope
You may edit:

```text
apps/worker/src/index.ts
apps/worker/src/graphs/wedding-surface-factory.graph.ts
apps/worker/src/state/factory-job-state.ts
apps/worker/src/services/job-state-store.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Create worker bootstrap.
- Define graph skeleton nodes as placeholders.
- Implement state load/save abstraction.
- Do not implement content generation nodes yet.

## Acceptance Criteria
- Worker can load a job id.
- Graph skeleton compiles.
- State type matches docs.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- worker || true
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
