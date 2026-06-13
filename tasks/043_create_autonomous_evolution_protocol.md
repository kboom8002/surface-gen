# Task 043: Create Autonomous Evolution Protocol

## Goal

Install the controlled autonomous evolution workflow into the repo and make it usable by Claude/Antigravity.

## Context Docs

Read before coding:

- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/tdd/TDD_GUARDRAIL_STRATEGY.md
- docs/evolution/AUTONOMOUS_EVOLUTION_PROTOCOL.md

## Files In Scope

```text
docs/evolution/**
AGENTS.md
README.md
```


## Requirements

- Ensure docs/evolution files exist.
- Update AGENTS.md to reference autonomous evolution only after tests exist.
- Update README with the SDD -> TDD -> Controlled Autonomous Evolution workflow.
- Do not change product scope.


## Acceptance Criteria

- Implementation follows the context docs.
- Tests are added or updated when behavior is changed.
- No product contract is weakened.
- No out-of-scope files are modified without reporting first.

## Verification Commands

```bash
pnpm typecheck || true
```

## Report Back

Report:

- changed files
- tests added or changed
- commands run
- test results
- known limitations
- remaining risks
