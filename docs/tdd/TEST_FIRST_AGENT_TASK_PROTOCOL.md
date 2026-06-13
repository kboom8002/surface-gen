# Test-First Agent Task Protocol

## 1. Purpose

This document defines how new development tasks should be performed after the initial scaffold.

The agent must write or update tests before implementation whenever the behavior is testable.

## 2. Task Types

```yaml
task_types:
  contract_task:
    test_first: required
  validator_task:
    test_first: required
  agent_node_task:
    test_first: recommended
  ui_task:
    test_first: recommended for behavior, optional for cosmetic changes
  docs_task:
    test_first: not required
  refactor_task:
    test_first: existing tests must pass before and after
```

## 3. Standard Test-First Prompt

```text
Read AGENTS.md, the relevant spec docs, and the target task file.

Before implementation:
1. Identify the behavior to protect.
2. Add or update a failing test for that behavior.
3. Run the scoped test and confirm it fails for the expected reason.
4. Implement the smallest change.
5. Run the scoped test again.
6. Run pnpm typecheck and any task verification commands.

Do not weaken validators or remove existing tests.
Report changed files, tests run, and remaining risks.
```

## 4. Acceptance for Test-First Work

```yaml
accepted_when:
  - new or updated test exists
  - test failed before implementation or reason is explained
  - test passes after implementation
  - broader verification passes or failures are reported
  - implementation is minimal and scoped
```

## 5. When Not to Write a Test First

Allowed exceptions:

```yaml
exceptions:
  - pure documentation task
  - non-functional text cleanup
  - initial repo bootstrap before test framework exists
  - exploratory spike explicitly marked as spike
```

Even then, the agent must report why test-first was not used.
