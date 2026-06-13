# Task 016: Photo Taxonomy Node

## Goal
Implement 5D+1 photo taxonomy node using visible image facts only.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/PHOTO_TAXONOMY_5D_VIBE_SPEC.md
- docs/agents/MODEL_ROUTING_POLICY.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/photo-taxonomy.node.ts
packages/schemas/src/photo-taxonomy.ts
packages/prompts/src/photo-taxonomy.prompt.ts
packages/validators/src/photo-taxonomy.validator.ts
tests/unit/photo-taxonomy.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Extract scene, subject, mood, style, composition, vibe_vector.
- Include confidence and uncertainty_note.
- Do not infer unverified venue, season, brand, fabric, or story.

## Acceptance Criteria
- Fixture photos produce valid taxonomy.
- vibe_vector values are 1-5.
- Low confidence items are review_required.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- photo-taxonomy
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
