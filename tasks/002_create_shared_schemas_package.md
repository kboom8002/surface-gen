# Task 002: Create Shared Schemas Package

## Goal
Create the shared Zod schema package that becomes the source of truth for AI outputs and persisted JSON payloads.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/10_SSOT_OUTPUT_CONTRACT.md
- docs/agents/STRUCTURED_OUTPUT_SCHEMAS.md
- docs/domain/UCA_TYPE_MAPPING_WEDDING_SDM.md

## Files In Scope
You may edit:

```text
packages/schemas/src/index.ts
packages/schemas/src/brand-factsheet.ts
packages/schemas/src/ssot-uca.ts
packages/schemas/src/gnb-ia.ts
packages/schemas/src/photo-taxonomy.ts
packages/schemas/src/gallery.ts
packages/schemas/src/qa.ts
packages/schemas/package.json
```

## Do Not Edit

```text
apps/web/*
apps/worker/*
supabase/migrations/*
```

## Requirements
- Define base enums for wedding_sdm, allowed UCA types, forbidden UCA type guard.
- Define UniversalContentAssetSchema.
- Define core GNB/IA and photo taxonomy schemas.
- Export all schemas from index.ts.

## Acceptance Criteria
- pnpm typecheck passes.
- Schemas can parse a minimal valid fixture.
- Forbidden UCA types are represented as blocked constants.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- schemas || true
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
