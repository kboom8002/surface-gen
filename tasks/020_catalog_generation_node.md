# Task 020: Catalog Generation Node

## Goal
Implement program, compare, policy_card, and process_step generation.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/10_SSOT_OUTPUT_CONTRACT.md
- docs/domain/UCA_TYPE_MAPPING_WEDDING_SDM.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/catalog-generation.node.ts
packages/schemas/src/catalog.ts
packages/prompts/src/catalog-generation.prompt.ts
packages/validators/src/catalog.validator.ts
tests/unit/catalog-generation.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Use program, never package.
- Generate policy cards for pricing, reservation, cancellation/refund, schedule change, delivery, copyright/portrait, additional fees, external vendor if available.
- Mark unknown prices/policies review_required.

## Acceptance Criteria
- No package type exported.
- Policy cards meet density or draft if insufficient.
- Price claims have source_basis or review_required.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- catalog-generation
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
