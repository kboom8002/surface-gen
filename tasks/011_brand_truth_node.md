# Task 011: Brand Truth Node

## Goal
Implement brand truth normalization node with fact/assumption/review separation.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/BRAND_FACTSHEET_SCHEMA.md
- docs/domain/CLAIM_PROOF_BOUNDARY_GRAPH_SPEC.md
- docs/agents/PROMPT_LIBRARY.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/brand-truth.node.ts
packages/schemas/src/brand-truth.ts
packages/prompts/src/brand-truth.prompt.ts
packages/validators/src/brand-truth.validator.ts
tests/unit/brand-truth.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Extract strategic truth and operational truth.
- Separate facts, assumptions, review_required fields, forbidden claims.
- Do not invent reviews or awards.
- Validate output with Zod.

## Acceptance Criteria
- Factsheet fixture generates brand_truth_sheet.
- Unsupported claim is review_required or prohibited.
- Output contains forbidden_claims list.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- brand-truth
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
