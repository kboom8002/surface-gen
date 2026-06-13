# TDD Guardrail Strategy

## 1. Purpose

This document defines the test-driven safety net that allows Claude Sonnet 4.6 and Antigravity to improve the repository without breaking core product contracts.

The project must protect business-critical invariants first. Do not attempt to test every visual nuance before the safety net exists.

## 2. Test Priority Pyramid

```yaml
priority_1_contract_tests:
  - required 8 JSON files exist
  - JSON files are valid
  - UCA schema passes
  - forbidden UCA types are blocked
  - body_richtext is required for public detailed assets
  - image paths resolve
  - ZIP structure is correct

priority_2_safety_tests:
  - fake reviews are blocked
  - unsupported claims are review_required
  - unknown image rights block public use
  - AI visual cannot represent actual work
  - price/policy facts require source or review_required

priority_3_agent_state_tests:
  - failed node records QA failure
  - repair loop retry count is capped
  - job state can resume from checkpoint
  - node output is schema-validated before persistence

priority_4_ui_tests:
  - project CRUD works
  - upload flow works
  - job console displays status
  - QA center displays failures
  - export center blocks invalid ZIP
```

## 3. Test Types

### 3.1 Schema Tests

Location:

```text
tests/unit/schemas/*.test.ts
```

Purpose:

```yaml
schema_tests:
  - validate Zod schemas
  - reject invalid objects
  - ensure type contracts match docs
```

Required targets:

```yaml
schema_targets:
  - UniversalContentAsset
  - GnbIaConfig
  - GalleryAlbum
  - GalleryPhoto
  - VisualAssetMapRecord
  - BrandKnowledgeGraph
  - ClaimProofBoundaryGraph
  - QaReport
  - ExportBundleManifest
```

### 3.2 Validator Tests

Location:

```text
tests/unit/validators/*.test.ts
```

Purpose:

```yaml
validator_tests:
  - test deterministic business rules
  - protect against LLM hallucination entering approved output
  - verify output contract integrity
```

Required targets:

```yaml
validator_targets:
  - validateForbiddenUcaTypes
  - validateBodyRichtextDensity
  - validateGnbIaSync
  - validateImagePathResolution
  - validateAiVisualPolicy
  - validateClaimProofBoundary
  - validateZipManifest
```

### 3.3 Golden Fixture Tests

Location:

```text
tests/golden/*.test.ts
tests/fixtures/golden-projects/*
```

Purpose:

```yaml
golden_tests:
  - lock expected behavior for known project inputs
  - prevent regression during autonomous evolution
  - provide sample projects for coding agents
```

Required fixtures:

```yaml
fixtures:
  valid_minimal_wedding:
    expected: passes MVP 6 gates
  valid_standard_wedding:
    expected: passes 12 gates or known warnings only
  invalid_fake_review:
    expected: blocked by truth/safety gate
  invalid_ai_visual_portfolio:
    expected: blocked by AI visual policy
  invalid_missing_image_path:
    expected: blocked by image path resolver
  invalid_forbidden_uca_type:
    expected: blocked by SSoT type gate
```

### 3.4 E2E Tests

Location:

```text
tests/e2e/*.spec.ts
```

Purpose:

```yaml
e2e_tests:
  - verify user-visible flows
  - verify thin E2E vertical slice
  - verify export cannot proceed with fatal errors
```

Required scenarios:

```yaml
e2e_scenarios:
  - create project
  - upload factsheet
  - upload images
  - run minimum agent job
  - review QA report
  - export ZIP
```

## 4. Red-Green-Refactor Workflow

For implementation tasks after MVP scaffold:

```text
1. Write failing test for desired behavior
2. Run test and confirm it fails for the right reason
3. Implement minimal code
4. Run test and confirm pass
5. Run broader verification command
6. Refactor only if tests remain green
```

## 5. Rules for Claude/Antigravity

```yaml
rules:
  - Do not weaken a test to make implementation pass.
  - Do not remove a validator without stronger replacement tests.
  - Do not change fixture expectations without explaining the product-level reason.
  - Add regression test for every safety bug fixed.
  - Add or update docs when a public contract changes.
```

## 6. Verification Commands

Minimum:

```bash
pnpm typecheck
pnpm test
```

Recommended scoped commands:

```bash
pnpm test -- schemas
pnpm test -- validators
pnpm test -- golden
pnpm test -- e2e
```

Project bootstrap may adjust exact script names, but task files must use the current script names after bootstrap.
