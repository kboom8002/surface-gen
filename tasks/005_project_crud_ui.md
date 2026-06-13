# Task 005: Project CRUD UI

## Goal
Implement project dashboard, create project flow, and project detail shell.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/frontend/NEXT_APP_ROUTING_SPEC.md
- docs/frontend/PAGE_LEVEL_UX_SPEC.md
- docs/07_API_CONTRACTS.md

## Files In Scope
You may edit:

```text
apps/web/app/(dashboard)/projects/page.tsx
apps/web/app/(dashboard)/projects/new/page.tsx
apps/web/app/(dashboard)/projects/[projectId]/page.tsx
apps/web/features/projects/*
apps/web/app/api/projects/route.ts
apps/web/app/api/projects/[projectId]/route.ts
```

## Do Not Edit

```text
apps/worker/*
supabase/migrations/*
packages/prompts/*
```

## Requirements
- Create project list, create form, and project detail shell.
- Validate tenant_slug and official_brand_name.
- Set industry_type to wedding_sdm by default.
- Use typed API responses.

## Acceptance Criteria
- User can create and view a project.
- Invalid tenant_slug is rejected.
- No agent job starts from this task.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- projects || true
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
