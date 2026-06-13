# Task 000: Repository Bootstrap

## Goal
Create the monorepo skeleton and baseline configuration for the Wedding Surface Agent repository.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/16_REPO_STRUCTURE_AND_CODING_RULES.md

## Files In Scope
You may edit:

```text
package.json
pnpm-workspace.yaml
turbo.json
.gitignore
.env.example
apps/web/package.json
apps/worker/package.json
packages/schemas/package.json
packages/validators/package.json
packages/prompts/package.json
packages/ssot/package.json
packages/shared/package.json
packages/ui/package.json
```

## Do Not Edit

```text
supabase/migrations/*
apps/web/app/*
apps/worker/src/*
```

## Requirements
- Create pnpm workspace layout for apps and packages.
- Add root scripts for dev, build, lint, typecheck, test, format if tooling exists.
- Add .env.example with documented variables only, no secrets.
- Do not implement product features in this task.

## Acceptance Criteria
- Workspace directories exist.
- Package names are consistent.
- Root scripts are present.
- No secrets are committed.

## Verification Commands

```bash
pnpm install
pnpm typecheck || true
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
