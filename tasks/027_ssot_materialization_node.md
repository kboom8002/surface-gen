# Task 027: SSoT Materialization Node

## Goal
Implement materialization of generated intermediate assets into universal_content_assets_final shape.

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
apps/worker/src/nodes/ssot-materialization.node.ts
packages/ssot/src/type-map.ts
packages/ssot/src/category-map.ts
packages/schemas/src/ssot-uca.ts
packages/validators/src/ssot-materialization.validator.ts
tests/unit/ssot-materialization.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Convert generated content to UCA records.
- Enforce allowed and forbidden type rules.
- Map categories consistently.
- Ensure detailed public assets have body and body_richtext.

## Acceptance Criteria
- No forbidden public UCA types.
- All public assets have required fields.
- Category mapping matches contract.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- ssot-materialization
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
