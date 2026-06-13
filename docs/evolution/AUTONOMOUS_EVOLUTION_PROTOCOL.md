# Autonomous Evolution Protocol

## 1. Purpose

This protocol defines how Claude Sonnet 4.6 and Google Antigravity may improve this repository after the initial SDD scaffold is implemented.

The goal is not uncontrolled autonomy. The goal is controlled, test-protected, spec-preserving evolution.

## 2. Operating Principle

```yaml
method: SDD -> TDD -> Controlled Autonomous Evolution
meaning:
  SDD: product and architecture contracts are fixed first
  TDD: critical invariants are protected by tests
  controlled_evolution: agents may improve only within documented boundaries
```

## 3. Read Order

Before any autonomous improvement, the agent must read:

1. `AGENTS.md`
2. `README.md`
3. `docs/19_ACCEPTANCE_CRITERIA.md`
4. `docs/11_VALIDATION_AND_QA_GATES.md`
5. `docs/tdd/TDD_GUARDRAIL_STRATEGY.md`
6. this file
7. currently relevant tests

## 4. Evolution Loop

```text
1. Inspect repo state
2. Run or review test suite
3. Identify up to 5 improvement candidates
4. Rank by impact, risk, and test coverage
5. Ask for approval before editing
6. Write or update tests first
7. Implement smallest useful change
8. Run verification commands
9. Report changed files, test results, and risks
```

## 5. Allowed Autonomous Improvements

The agent may propose and, after approval, implement:

```yaml
safe_improvements:
  - add missing tests
  - strengthen validators
  - improve type coverage
  - reduce duplicated schema logic
  - improve error messages
  - add golden fixtures
  - improve loading/empty/error UI states
  - improve job progress display
  - improve scoped documentation
  - refactor small functions without changing contracts
```

## 6. Approval Required

The agent must not implement without explicit approval:

```yaml
requires_approval:
  - database schema change
  - RLS policy change
  - output ZIP contract change
  - allowed or forbidden SSoT type change
  - domain pack architecture change
  - model provider change
  - authentication or billing change
  - medical or health domain expansion
  - validator removal
  - test deletion
  - dependency addition
```

## 7. Never Allowed

```yaml
never_allowed:
  - weaken validators to pass tests
  - mark review_required facts as approved automatically
  - invent reviews, awards, certifications, prices, policies, or credentials
  - expose service role keys to client code
  - persist raw LLM output as approved data
  - treat AI visuals as actual portfolio work
  - delete safety checks without replacement tests
```

## 8. Standard Autonomous Session Prompt

```text
You are working as a controlled autonomous development agent.

Read first:
1. AGENTS.md
2. README.md
3. docs/19_ACCEPTANCE_CRITERIA.md
4. docs/11_VALIDATION_AND_QA_GATES.md
5. docs/tdd/TDD_GUARDRAIL_STRATEGY.md
6. docs/evolution/AUTONOMOUS_EVOLUTION_PROTOCOL.md
7. the current test suite related to the area you inspect

Your job is not to invent a new product.
Your job is to improve this repository while preserving all existing contracts.

Process:
1. Inspect the repo.
2. Run or review available tests.
3. Identify up to 5 improvement candidates.
4. Rank them by impact, risk, and test coverage.
5. Do not modify files yet.
6. Present candidates and ask which one to implement.
7. After approval, write or update tests first.
8. Implement the smallest change that makes the tests pass.
9. Run verification commands.
10. Report changed files, test results, and remaining risks.

Hard rules:
- Do not change architecture unless explicitly approved.
- Do not modify DB schema without a migration plan.
- Do not weaken validators to make tests pass.
- Do not delete tests unless explicitly approved.
- Do not bypass RLS.
- Do not persist raw LLM output as approved data.
- Do not invent reviews, awards, policies, prices, or medical/health claims.
- Do not change output ZIP contract unless a new spec and test are added first.
```

## 9. Output Format for Improvement Proposal

```yaml
proposal:
  candidates:
    - title:
      impact: low | medium | high
      risk: low | medium | high
      test_coverage: none | partial | strong
      files_likely_touched:
      acceptance:
  recommended_candidate:
  reason:
  wait_for_approval: true
```

## 10. Output Format After Implementation

```yaml
implementation_report:
  selected_candidate:
  tests_added_or_changed:
  files_changed:
  commands_run:
  results:
  remaining_risks:
  follow_up_candidates:
```
