# Task 012: Semantic Search Strategy Node

## Goal
Implement SEO/AEO/GEO semantic strategy output generation.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/SEO_AEO_GEO_OUTPUT_SPEC.md
- docs/agents/STRUCTURED_OUTPUT_SCHEMAS.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/semantic-search-strategy.node.ts
packages/schemas/src/semantic-strategy.ts
packages/prompts/src/semantic-search-strategy.prompt.ts
packages/validators/src/semantic-strategy.validator.ts
tests/unit/semantic-strategy.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate search_intent_map, qis_growth_registry, entity_keyword_map, local_geo_intent_map, ai_answer_opportunity_map.
- Use wedding_sdm intents.
- Validate all outputs.

## Acceptance Criteria
- At least 20 QIS items in standard fixture.
- Each QIS has target_asset_type and funnel_stage.
- Local intent fields exist if location exists.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- semantic-strategy
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
