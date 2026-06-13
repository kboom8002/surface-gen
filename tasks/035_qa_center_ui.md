# Task 035: QA Center UI

## Goal
Implement QA report viewer, gate breakdown, and repair action UI.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/frontend/QA_CENTER_SPEC.md
- docs/qa/12_GATE_VALIDATION_SPEC.md

## Files In Scope
You may edit:

```text
apps/web/app/(dashboard)/projects/[projectId]/qa/page.tsx
apps/web/features/qa/qa-summary.tsx
apps/web/features/qa/gate-result-card.tsx
apps/web/features/qa/repair-actions.tsx
```

## Do Not Edit

```text
apps/worker/*
supabase/migrations/*
```

## Requirements
- Display 12 gates with pass/warn/fail/block.
- Show affected assets.
- Trigger repair API when available.
- Show human review items.

## Acceptance Criteria
- QA page loads reports.
- Blocked gates are visually clear.
- Repair button uses correct API.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- qa-center || true
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
