# Task 038: E2E Happy Path

## Goal
Implement Playwright happy path from project creation to ZIP export using fixture data.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/qa/E2E_TEST_SCENARIOS.md
- docs/frontend/PAGE_LEVEL_UX_SPEC.md

## Files In Scope
You may edit:

```text
tests/e2e/happy-path.spec.ts
tests/e2e/fixtures/*
playwright.config.ts
```

## Do Not Edit

```text
apps/worker/src/nodes/*
supabase/migrations/*
```

## Requirements
- Automate create project, upload factsheet, upload images metadata, start job, view QA, export ZIP.
- Mock model calls if needed for deterministic test.

## Acceptance Criteria
- E2E can run locally.
- Does not require real paid model calls by default.
- Asserts required 8 JSON exist.

## Verification Commands

```bash
pnpm test:e2e -- happy-path || true
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
