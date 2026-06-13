# Task 052: Add handoff import UI

## Goal
Implement handoff import and AI visual prompt export screens.

## Context Docs
Read these before coding:
- AGENTS.md
- docs/handoff/HANDOFF_IMPORT_OVERVIEW.md
- docs/frontend/HANDOFF_IMPORT_UI_SPEC.md
- docs/08_FRONTEND_UX_SPEC.md

## Files In Scope
You may edit:
- apps/web/app/(dashboard)/projects/[id]/handoff/**
- apps/web/features/handoff/**
- apps/web/features/projects/project-navigation.tsx
- tests/e2e/handoff-import.spec.ts

## Requirements
- Add image analysis handoff import screen.
- Add AI visual prompt export screen.
- Add AI visual result import screen.
- Add validation center.
- Show review-required and fatal issues clearly.

## Acceptance Criteria
- User can upload handoff package.
- Validation report is visible.
- AI visual prompt package export action exists.
- AI visuals are labeled as AI guide visuals, not portfolio photos.

## Verification Commands
```bash
pnpm typecheck
pnpm test
```

## Report Back
Summarize changed files, commands run, test results, and remaining risks.
