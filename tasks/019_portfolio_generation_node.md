# Task 019: Portfolio Generation Node

## Goal
Implement portfolio, portfolio_docent, and style_collection asset generation.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/GNB_IA_SURFACE_CONTRACT.md
- docs/10_SSOT_OUTPUT_CONTRACT.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/portfolio-generation.node.ts
packages/schemas/src/portfolio.ts
packages/prompts/src/portfolio-generation.prompt.ts
packages/validators/src/portfolio.validator.ts
tests/unit/portfolio-generation.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate portfolio hub, portfolio_docent, style_collection assets.
- Include related_photo_ids, related_program_ids, related_answer_ids.
- Meet body density requirements.

## Acceptance Criteria
- Generated assets parse as UCA.
- portfolio_docent body_richtext >= 1000 Korean chars.
- Relations resolve to known ids or are review_required.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- portfolio-generation
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
