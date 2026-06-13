# Golden Fixture Design

## 1. Purpose

Golden fixtures provide stable reference projects that make autonomous evolution safe.

Every fixture must include:

```yaml
fixture:
  input:
    - brand_factsheet.json or md
    - image_manifest.json
    - policy_source.json
  expected:
    - expected_status
    - expected_gate_results
    - expected_required_files
    - expected_blockers
```

## 2. Fixture Directory Structure

```text
tests/fixtures/golden-projects/
├── valid_minimal_wedding/
│   ├── input/
│   │   ├── brand_factsheet.md
│   │   ├── image_manifest.json
│   │   └── policy_source.json
│   └── expected/
│       ├── expected_gate_results.json
│       ├── expected_required_files.json
│       └── notes.md
├── invalid_fake_review/
├── invalid_ai_visual_portfolio/
├── invalid_missing_image_path/
└── invalid_forbidden_uca_type/
```

## 3. Required Fixtures

### valid_minimal_wedding

Purpose:

```yaml
expected:
  - minimal MVP output can be produced
  - required 8 JSON files exist
  - first 6 gates pass
```

### valid_standard_wedding

Purpose:

```yaml
expected:
  - standard project can pass 12 gates or only warning-level issues
  - portfolio, catalog, answers, about, contact assets exist
```

### invalid_fake_review

Purpose:

```yaml
expected:
  - unsupported review is blocked
  - public approved review is not exported
  - human_review_item is created
```

### invalid_ai_visual_portfolio

Purpose:

```yaml
expected:
  - AI visual with can_represent_actual_work true is blocked
  - AI visual on actual portfolio surface is blocked
```

### invalid_missing_image_path

Purpose:

```yaml
expected:
  - image path resolution gate fails
  - ZIP export is blocked
```

### invalid_forbidden_uca_type

Purpose:

```yaml
expected:
  - gallery_photos as UCA is blocked
  - package as UCA is blocked
  - answer_faq as UCA is blocked
```

## 4. Fixture Policy

```yaml
fixture_rules:
  - fixture inputs must not contain real customer personal data
  - image files may be placeholders unless visual model behavior is tested
  - expected output should test structural contracts, not exact prose
  - exact prose assertions should be avoided except forbidden phrase checks
```

## 5. Golden Test Stability

Golden tests should be stable across copy improvements.

Good assertions:

```yaml
good:
  - type exists
  - field exists
  - status equals blocked
  - relation resolves
  - gate fails with expected code
```

Bad assertions:

```yaml
bad:
  - exact generated paragraph text
  - exact SEO title wording
  - exact order of non-critical arrays
```
