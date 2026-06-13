# Task 014: GNB/IA Node

## Goal
Implement CMS-ready standard wedding GNB/IA config generation.

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
apps/worker/src/nodes/gnb-ia.node.ts
packages/schemas/src/gnb-ia.ts
packages/prompts/src/gnb-ia.prompt.ts
packages/validators/src/gnb-ia.validator.ts
tests/unit/gnb-ia.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate six standard nodes: portfolio, catalog, gallery, answers, about, contact.
- Map packages/pricing to catalog and faq/guide to answers.
- Validate ssot_types per node.

## Acceptance Criteria
- Standard GNB exists.
- Each node has label, href, template, ssot_types.
- No more than 7 top-level GNB nodes.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- gnb-ia
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
