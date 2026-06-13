# Task 001: Install Next.js and Supabase Stack

## Goal
Initialize the Next.js web app and Supabase client foundation without implementing feature pages.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/03_SYSTEM_ARCHITECTURE.md
- docs/15_DEPLOYMENT_AND_ENV_SPEC.md

## Files In Scope
You may edit:

```text
apps/web/package.json
apps/web/app/layout.tsx
apps/web/app/page.tsx
apps/web/lib/supabase/client.ts
apps/web/lib/supabase/server.ts
apps/web/middleware.ts
.env.example
```

## Do Not Edit

```text
apps/worker/*
supabase/migrations/*
packages/schemas/*
```

## Requirements
- Set up App Router structure.
- Create server and browser Supabase clients.
- Add middleware placeholder for auth-aware routing.
- Keep UI minimal.

## Acceptance Criteria
- Next app starts.
- Supabase env vars documented.
- No service role key exposed to browser.

## Verification Commands

```bash
pnpm typecheck
pnpm lint || true
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
