# Task 044: Create Regression Dashboard Spec and Tests

## Goal

Create or specify a regression dashboard/report that summarizes schema, validator, golden, and e2e test status.

## Context Docs

Read before coding:

- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/tdd/TDD_GUARDRAIL_STRATEGY.md
- docs/evolution/AUTONOMOUS_EVOLUTION_PROTOCOL.md

## Files In Scope

```text
docs/evolution/REGRESSION_SAFETY_POLICY.md
docs/testing/**
scripts/check-repo-health/**
tests/unit/**
```


## Requirements

- Define a repo health report format.
- Add a script or script spec for collecting test status if the repo scaffold supports it.
- Do not introduce dashboard UI unless a frontend task is opened.


## Acceptance Criteria

- Implementation follows the context docs.
- Tests are added or updated when behavior is changed.
- No product contract is weakened.
- No out-of-scope files are modified without reporting first.

## Verification Commands

```bash
pnpm typecheck
pnpm test
```

## Report Back

Report:

- changed files
- tests added or changed
- commands run
- test results
- known limitations
- remaining risks
