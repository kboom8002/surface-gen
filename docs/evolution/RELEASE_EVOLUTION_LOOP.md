# Release Evolution Loop

## 1. Purpose

This document defines how improvements become release candidates.

## 2. Loop

```text
1. Select improvement candidate
2. Write/update tests
3. Implement change
4. Run scoped tests
5. Run regression tests
6. Update docs if contract changed
7. Produce release note
8. Run release checklist
```

## 3. Release Candidate Gates

```yaml
release_candidate_gates:
  - typecheck passes
  - unit tests pass
  - validator tests pass
  - golden fixture tests pass
  - e2e happy path passes
  - no critical QA failure
  - no unresolved critical human review item
  - ZIP contract valid
```

## 4. Release Note Format

```yaml
release_note:
  version:
  date:
  changes:
  tests:
  migrations:
  risks:
  rollback_plan:
```

## 5. Rollback Policy

Any change that affects output contract, DB schema, RLS, or validators must include a rollback note.
