# Task 037: Golden Fixture Tests

## Goal
Create golden sample projects and regression tests for stable outputs.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/qa/GOLDEN_SAMPLE_PROJECTS.md
- docs/qa/AGENT_REGRESSION_TESTS.md

## Files In Scope
You may edit:

```text
tests/fixtures/golden/minimal-brand-factsheet.json
tests/fixtures/golden/sample-photo-metadata.json
tests/fixtures/golden/expected-gnb-ia.json
tests/integration/golden-factory.test.ts
scripts/seed-golden/README.md
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Create minimal fixture.
- Create expected structural outputs, not brittle exact prose.
- Test schema and gate pass behavior.

## Acceptance Criteria
- Golden test runs.
- Fixture covers MVP minimum.
- Test avoids snapshotting long generated prose exactly.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- golden
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
