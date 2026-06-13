# Task 040: Release Candidate Validation

## Goal
Create release candidate checklist automation and final repo health validation.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/qa/RELEASE_CHECKLIST.md
- docs/19_ACCEPTANCE_CRITERIA.md

## Files In Scope
You may edit:

```text
scripts/check-repo-health/README.md
scripts/check-repo-health/index.ts
docs/18_BACKLOG_AND_ROADMAP.md
docs/17_MVP_DELIVERY_PLAN.md
```

## Do Not Edit

```text
apps/worker/src/nodes/*
apps/web/features/*
```

## Requirements
- Create repo health script that checks required docs and task files exist.
- Document release candidate procedure.
- Add MVP delivery plan and backlog if missing.

## Acceptance Criteria
- Health script reports missing docs/tasks.
- Release checklist references MVP/v1 criteria.
- No production code changes required.

## Verification Commands

```bash
pnpm typecheck || true
pnpm node scripts/check-repo-health/index.ts || true
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
