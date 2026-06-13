# Task 041: Create TDD Guardrail Suite

## Goal

Create the first test suite that protects SSoT output contracts, forbidden types, body_richtext density, image path resolution, and AI visual policy.

## Context Docs

Read before coding:

- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/tdd/TDD_GUARDRAIL_STRATEGY.md
- docs/evolution/AUTONOMOUS_EVOLUTION_PROTOCOL.md

## Files In Scope

```text
packages/schemas/src/**
packages/validators/src/**
tests/unit/schemas/**
tests/unit/validators/**
docs/tdd/**
```


## Requirements

- Add or verify schema tests for UCA, GNB/IA, gallery albums, gallery photos, visual asset map, and QA report.
- Add or verify validator tests for forbidden UCA types, body_richtext density, AI visual policy, and image path resolution.
- Do not weaken existing validators.
- Prefer exact error codes for validator failures.


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
