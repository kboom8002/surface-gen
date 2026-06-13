# Task 017: Photo Docent Node

## Goal
Implement Korean photo docent text generation for alt, caption, scene_note, style_note, recommended_for.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/PHOTO_TAXONOMY_5D_VIBE_SPEC.md
- docs/agents/PROMPT_LIBRARY.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/photo-docent.node.ts
packages/schemas/src/photo-docent.ts
packages/prompts/src/photo-docent.prompt.ts
packages/validators/src/photo-docent.validator.ts
tests/unit/photo-docent.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate Korean copy within length guidelines.
- Avoid internal tag exposure.
- Use visible facts only.
- Validate unique-enough captions.

## Acceptance Criteria
- Length validation passes.
- No forbidden overclaims.
- Missing taxonomy produces safe failure.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- photo-docent
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
