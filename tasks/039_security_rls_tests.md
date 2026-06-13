# Task 039: Security and RLS Tests

## Goal
Implement security tests for project isolation, storage authorization, and service role exposure prevention.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/12_SECURITY_AND_RLS_SPEC.md
- docs/qa/SECURITY_TESTS.md

## Files In Scope
You may edit:

```text
tests/integration/security-rls.test.ts
tests/integration/storage-auth.test.ts
scripts/check-repo-health/check-secrets.ts
```

## Do Not Edit

```text
apps/worker/src/nodes/*
packages/prompts/*
```

## Requirements
- Test user cannot read another user project.
- Test unauthorized ZIP download is blocked.
- Add simple secret-pattern scan.
- Ensure service role env var is server-only.

## Acceptance Criteria
- Security tests fail on cross-project access.
- Secret scan script exists.
- No service role import in client files.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- security || true
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
