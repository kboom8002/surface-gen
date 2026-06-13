# Task 010: Input Audit Node

## Goal
Implement the input audit node that scores readiness and identifies missing critical fields.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/BRAND_FACTSHEET_SCHEMA.md
- docs/agents/LANGGRAPH_NODE_SPEC.md
- docs/agents/STRUCTURED_OUTPUT_SCHEMAS.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/input-audit.node.ts
packages/schemas/src/input-readiness.ts
packages/prompts/src/input-audit.prompt.ts
packages/validators/src/input-readiness.validator.ts
tests/unit/input-audit.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate input_readiness_report.
- Score brand truth, service package, pricing policy, images, evidence, contact conversion.
- Mark blocked if critical inputs missing.
- Validate output with Zod.

## Acceptance Criteria
- Valid fixture produces readiness report.
- Missing brand name fails or blocks.
- Images fewer than 20 are flagged.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- input-audit
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
