# Task 008: Agent Job Schema and API

## Goal
Implement agent job creation, status retrieval, and step persistence API contracts.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/04_AGENT_WORKFLOW_SPEC.md
- docs/backend/JOB_QUEUE_SPEC.md
- docs/07_API_CONTRACTS.md

## Files In Scope
You may edit:

```text
apps/web/app/api/projects/[projectId]/jobs/run/route.ts
apps/web/app/api/jobs/[jobId]/route.ts
apps/web/features/jobs/types.ts
packages/schemas/src/agent-job.ts
```

## Do Not Edit

```text
apps/worker/src/graphs/*
packages/prompts/*
```

## Requirements
- Create job record with queued status.
- Return job_id.
- Expose job status and current_node.
- Do not run the full LangGraph inside the route handler.

## Acceptance Criteria
- Job can be created.
- Job status can be fetched.
- Route handler does not call long-running model logic.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- jobs || true
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
