# Task 025: AI Visual OS Node

## Goal
Implement AI visual planning, prompt brief, disclosure, and policy validation outputs.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/AI_VISUAL_OS_SPEC.md
- docs/domain/ZIP_ONBOARDING_OUTPUT_SPEC.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/ai-visual-os.node.ts
packages/schemas/src/ai-visual.ts
packages/prompts/src/ai-visual-os.prompt.ts
packages/validators/src/ai-visual.validator.ts
tests/unit/ai-visual-os.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate AI visual briefs only when useful.
- Set can_represent_actual_work=false.
- Require disclosure for public AI visuals.
- Prohibit AI visuals as actual portfolio replacement.

## Acceptance Criteria
- AI visual validator blocks portfolio replacement.
- Prompt brief includes positive/negative prompt and source_ssot_refs.
- Disclosure fields exist for public usage.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- ai-visual-os
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
