# Refactoring Boundary Policy

## 1. Purpose

This document defines what autonomous agents may refactor without creating product or architecture drift.

## 2. Safe Refactors

```yaml
safe_refactors:
  - extract pure helper function
  - remove duplicate local logic
  - improve naming within a module
  - split large validator into smaller pure functions
  - move shared type to packages/schemas when no contract changes
  - improve error messages while preserving error codes
```

## 3. Approval Required Refactors

```yaml
requires_approval:
  - moving package boundaries
  - changing public API routes
  - changing DB schema
  - changing RLS policies
  - changing output ZIP contract
  - changing domain pack architecture
  - replacing LangGraph state shape
  - replacing model routing architecture
```

## 4. Refactor Requirements

```yaml
requirements:
  - tests pass before refactor if possible
  - tests pass after refactor
  - public behavior unchanged
  - no new dependency unless approved
  - no unrelated cleanup in same change
```

## 5. Refactor Report Format

```yaml
refactor_report:
  goal:
  behavior_changed: false
  files_changed:
  tests_before:
  tests_after:
  risk:
```
