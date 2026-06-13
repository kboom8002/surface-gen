# Task 026: Crosslink and Schema Node

## Goal
Implement crosslink matrix, internal linking strategy, schema readiness map, and AI answer extractability map.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/SCHEMA_ORG_READINESS_SPEC.md
- docs/domain/SEO_AEO_GEO_OUTPUT_SPEC.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/crosslink-schema.node.ts
packages/schemas/src/crosslink-schema.ts
packages/prompts/src/crosslink-schema.prompt.ts
packages/validators/src/crosslink-schema.validator.ts
tests/unit/crosslink-schema.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate crosslink matrix.
- Generate schema_readiness_map.
- Generate jsonld_generation_plan.
- Generate AI answer extractability map.
- Validate unresolved relations.

## Acceptance Criteria
- Every major GNB node has crosslinks.
- Schema map assigns target schema types.
- Risk/commercial answers have caution and related policies.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- crosslink-schema
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
