# Task 023: About and Contact Generation Node

## Goal
Implement about_brand, brand_truth, evidence placeholders, contact_info, match_brief, and cta_block generation.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/BRAND_FACTSHEET_SCHEMA.md
- docs/10_SSOT_OUTPUT_CONTRACT.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/about-contact-generation.node.ts
packages/schemas/src/about-contact.ts
packages/prompts/src/about-contact-generation.prompt.ts
packages/validators/src/about-contact.validator.ts
tests/unit/about-contact-generation.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate about and contact assets.
- Do not invent evidence; mark missing evidence review_required.
- Create match_brief intake fields.
- Meet body density requirements.

## Acceptance Criteria
- about_brand and contact_info parse as UCA.
- Evidence without source is draft/review_required.
- Match brief has intake fields.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- about-contact-generation
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
