# Task 029: Repair Loop

## Goal
Implement repair routing for validation failures and capped retries.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/agents/RETRY_AND_REPAIR_POLICY.md
- docs/11_VALIDATION_AND_QA_GATES.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/repair-router.node.ts
apps/worker/src/nodes/repairs/*.ts
packages/prompts/src/qa-repair.prompt.ts
packages/schemas/src/repair.ts
tests/unit/repair-loop.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Route invalid_json, schema_fail, density_fail, unresolved_relation, unsupported_claim, ai_visual_confusion.
- Cap retries.
- Escalate to human review when required.

## Acceptance Criteria
- Retry count capped.
- Known failures route correctly.
- Human-required issues pause or mark review_required.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- repair-loop
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
