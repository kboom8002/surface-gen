# Task 021: Answer Generation Node

## Goal
Implement answer asset generation from QIS Growth Registry and answer blueprint families.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/SEO_AEO_GEO_OUTPUT_SPEC.md
- docs/10_SSOT_OUTPUT_CONTRACT.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/answer-generation.node.ts
packages/schemas/src/answer.ts
packages/prompts/src/answer-generation.prompt.ts
packages/validators/src/answer.validator.ts
tests/unit/answer-generation.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate answer assets with direct answer_first_sentence.
- Include decision_criteria, recommended_action, caution, source_basis.
- Meet minimum density.

## Acceptance Criteria
- Answers parse as UCA type answer.
- No answer_faq type.
- AI answer extractability validator passes for fixture.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- answer-generation
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
