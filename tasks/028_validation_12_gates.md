# Task 028: Validation 12 Gates

## Goal
Implement deterministic 12-Gate validation pipeline.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/11_VALIDATION_AND_QA_GATES.md
- docs/qa/12_GATE_VALIDATION_SPEC.md
- docs/qa/DETERMINISTIC_VALIDATOR_SPEC.md

## Files In Scope
You may edit:

```text
packages/validators/src/gates/index.ts
packages/validators/src/gates/*.ts
packages/schemas/src/qa.ts
apps/worker/src/services/qa-runner.ts
tests/unit/validation-gates.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
packages/prompts/*
```

## Requirements
- Implement gates 1-12.
- Return pass/warn/fail/block statuses.
- Do not use LLM calls in deterministic validators.
- Generate machine-readable QA report.

## Acceptance Criteria
- Fixture with valid bundle passes.
- Fixture with forbidden type fails.
- Fixture with missing body_richtext fails density gate.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- validation-gates
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
