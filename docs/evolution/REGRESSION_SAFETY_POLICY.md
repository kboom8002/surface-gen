# Regression Safety Policy

## 1. Purpose

This policy prevents autonomous development from breaking existing behavior.

## 2. Regression Definition

A regression is any change that causes:

```yaml
regression:
  - previously valid fixture fails without approved spec change
  - previously invalid unsafe fixture passes
  - required output file disappears
  - validator is weakened
  - public contract changes without doc and test update
  - security boundary is relaxed
```

## 3. Required Regression Checks

Before merging an autonomous change:

```yaml
required_checks:
  - typecheck
  - unit tests for changed area
  - validator tests if validators changed
  - golden tests if output contract changed
  - e2e happy path if routing/export/job flow changed
```

## 4. Handling Failing Tests

```yaml
failure_policy:
  in_scope_failure:
    action: fix_once
  out_of_scope_failure:
    action: report_and_stop
  flaky_failure:
    action: rerun_once_then_report
  spec_changed_failure:
    action: require_spec_update_and_human_approval
```

## 5. Never Fix By

```yaml
never_fix_by:
  - deleting tests
  - weakening validators
  - ignoring TypeScript errors
  - converting typed data to any
  - suppressing errors without root cause
  - approving review_required content automatically
```
