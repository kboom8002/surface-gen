# Task 022: Article Generation Node

## Goal
Implement longform article generation with editorial gate requirements.

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
apps/worker/src/nodes/article-generation.node.ts
packages/schemas/src/article.ts
packages/prompts/src/article-generation.prompt.ts
packages/validators/src/article.validator.ts
tests/unit/article-generation.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate article assets with toc, key_takeaways, h2/h3 sections, richmedia_blocks, final_cta.
- Meet 3000+ Korean character launch minimum.
- Relate to answers, photos, programs, policies.

## Acceptance Criteria
- Articles parse as UCA type article.
- No guide_article type.
- Longform density gate passes.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- article-generation
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
