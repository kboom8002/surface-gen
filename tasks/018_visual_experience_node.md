# Task 018: Visual Experience Node

## Goal
Implement visual experience map generation for page-level image roles and placement.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/AI_VISUAL_OS_SPEC.md
- docs/domain/GNB_IA_SURFACE_CONTRACT.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/visual-experience.node.ts
packages/schemas/src/visual-experience.ts
packages/prompts/src/visual-experience.prompt.ts
packages/validators/src/visual-experience.validator.ts
tests/unit/visual-experience.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate visual_experience_map and page_visual_sequence_map.
- Separate actual_photo, AI visual, diagram, graphic roles.
- Never assign AI visual as portfolio proof.

## Acceptance Criteria
- Home hero does not require AI visual.
- Portfolio uses actual photos.
- AI visual slots include disclosure requirements.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- visual-experience
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
