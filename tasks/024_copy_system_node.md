# Task 024: Copy System Node

## Goal
Implement UX copy system, microcopy library, CTA strategy, and form UX intent capture outputs.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/UX_COPY_SYSTEM_SPEC.md
- docs/frontend/PAGE_LEVEL_UX_SPEC.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/copy-system.node.ts
packages/schemas/src/copy-system.ts
packages/prompts/src/copy-system.prompt.ts
packages/validators/src/copy-system.validator.ts
tests/unit/copy-system.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate page-specific tone rules.
- Generate CTA strategy map by intent level.
- Generate form helper/error/empty/disclosure microcopy.
- Control repetitive Korean terms.

## Acceptance Criteria
- copy_system validates.
- CTA map includes low/mid/high/risk/visual preference.
- No exaggerated claims.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- copy-system
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
