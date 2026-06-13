# Agent Self-Review Checklist

Before reporting a task as complete, the AI coding agent must check:

## 1. Scope

```yaml
scope_check:
  - Did I edit only files in scope?
  - Did I avoid unrelated cleanup?
  - Did I avoid architecture changes not requested?
```

## 2. Tests

```yaml
test_check:
  - Did I add or update tests for behavior changes?
  - Did I run the required commands?
  - Did I report failures honestly?
```

## 3. Product Safety

```yaml
safety_check:
  - Did I preserve forbidden UCA type rules?
  - Did I preserve body_richtext requirements?
  - Did I avoid fake reviews and unsupported claims?
  - Did I preserve AI visual actual-work prohibition?
  - Did I preserve human review requirements?
```

## 4. Security

```yaml
security_check:
  - Did I avoid exposing service role keys?
  - Did I avoid bypassing RLS?
  - Did I preserve project/tenant scoping?
```

## 5. Output Contract

```yaml
output_contract_check:
  - Required 8 JSON contract still intact?
  - ZIP structure unchanged unless approved?
  - Manifest logic preserved?
```

## 6. Report

```yaml
report_required:
  - changed files
  - commands run
  - test results
  - known limitations
  - remaining risks
```
