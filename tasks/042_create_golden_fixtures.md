# Task 042: Create Golden Fixtures

## Goal

Create stable golden project fixtures for valid and invalid wedding projects.

## Context Docs

Read before coding:

- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/tdd/TDD_GUARDRAIL_STRATEGY.md
- docs/evolution/AUTONOMOUS_EVOLUTION_PROTOCOL.md

## Files In Scope

```text
tests/fixtures/golden-projects/**
tests/golden/**
docs/tdd/GOLDEN_FIXTURE_DESIGN.md
```


## Requirements

- Add valid_minimal_wedding fixture.
- Add invalid_fake_review fixture.
- Add invalid_ai_visual_portfolio fixture.
- Add invalid_missing_image_path fixture.
- Add invalid_forbidden_uca_type fixture.
- Tests should assert structural contracts and expected gate results, not exact prose.


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
