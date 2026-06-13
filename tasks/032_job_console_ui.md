# Task 032: Job Console UI

## Goal
Implement job progress console with timeline, logs, retry, pause, and resume controls.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/frontend/JOB_CONSOLE_SPEC.md
- docs/07_API_CONTRACTS.md

## Files In Scope
You may edit:

```text
apps/web/app/(dashboard)/projects/[projectId]/factory/page.tsx
apps/web/features/jobs/job-console.tsx
apps/web/features/jobs/job-timeline.tsx
apps/web/features/jobs/job-actions.tsx
```

## Do Not Edit

```text
apps/worker/*
supabase/migrations/*
```

## Requirements
- Display current job status and steps.
- Show current_node and gate failures.
- Support retry/pause/resume API calls if implemented.
- Use polling or realtime abstraction.

## Acceptance Criteria
- User can see job progress.
- Failures are visible.
- Controls are disabled when not applicable.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- job-console || true
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
