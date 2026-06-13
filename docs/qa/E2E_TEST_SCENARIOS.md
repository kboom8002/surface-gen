# E2E Test Scenarios

## 1. Purpose

E2E tests verify that the user can complete the product workflow from project creation to ZIP export.

Use Playwright for browser-level testing and fixture projects for predictable data.

---

## 2. Scenario 1. MVP Happy Path

```yaml
scenario: mvp_happy_path
steps:
  - sign in
  - create project
  - upload Brand Factsheet
  - upload 20 images or image metadata fixtures
  - confirm image rights
  - start agent job
  - wait for job completion
  - open QA Center
  - verify 6-Gate pass
  - open Export Center
  - generate ZIP
  - download ZIP
expected:
  - job completes
  - required 8 JSON files exist
  - ZIP manifest exists
```

---

## 3. Scenario 2. Human Review Required

```yaml
scenario: human_review_required
steps:
  - create project with unsupported review claim
  - start job
  - open Review Queue
  - verify item is marked review_required
  - attempt export
expected:
  - export is blocked or conditional
  - issue reason is visible
```

---

## 4. Scenario 3. QA Failure and Repair

```yaml
scenario: qa_failure_and_repair
steps:
  - inject asset with short body_richtext
  - run QA
  - verify Content Density Gate fails
  - run repair
  - rerun QA
expected:
  - failure is detected
  - repair updates asset
  - gate passes or clear remaining risk is shown
```

---

## 5. Scenario 4. Visual Rights Block

```yaml
scenario: visual_rights_block
steps:
  - upload images with unknown public rights
  - run pipeline
  - inspect Visual Semantic Editor
  - attempt to use image as public portfolio
expected:
  - public usage is blocked
  - review_required item exists
```

---

## 6. Scenario 5. Export Preflight

```yaml
scenario: export_preflight
steps:
  - complete standard project
  - generate all outputs
  - run export preflight
  - generate ZIP
  - inspect ZIP listing
expected:
  - canonical 01_upload folder exists
  - no duplicate UCA file exists outside 01_upload
  - sha256 manifest matches
```

---

## 7. Acceptance Criteria

```yaml
accepted_when:
  - MVP happy path passes in CI
  - human review blocking scenario passes
  - QA repair scenario passes by v1
  - export preflight scenario passes
```
