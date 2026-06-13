# Golden Sample Projects

## 1. Purpose

Golden sample projects provide stable fixtures for regression tests.

They make sure that changes to prompts, schemas, validators, and export services do not silently break the onboarding package.

---

## 2. Golden Fixture Directory

```text
tests/fixtures/golden/
├── minimal_wedding_sdm/
│   ├── inputs/
│   ├── expected_outputs/
│   └── README.md
├── standard_wedding_sdm/
│   ├── inputs/
│   ├── expected_outputs/
│   └── README.md
└── rights_risk_wedding_sdm/
    ├── inputs/
    ├── expected_outputs/
    └── README.md
```

---

## 3. Fixture 1. Minimal Wedding SDM

```yaml
minimal_wedding_sdm:
  purpose: MVP happy path
  inputs:
    - simple brand factsheet
    - 20 synthetic or placeholder image metadata records
    - basic program/policy facts
  expected:
    - required 8 JSON files
    - minimal UCA types
    - 6-Gate QA pass
    - ZIP manifest pass
```

---

## 4. Fixture 2. Standard Wedding SDM

```yaml
standard_wedding_sdm:
  purpose: v1 happy path
  inputs:
    - full brand factsheet
    - 50 image metadata records
    - service/package/policy details
    - verified proof/evidence examples
  expected:
    - full semantic strategy
    - brand knowledge graph
    - schema readiness map
    - visual experience map
    - 12-Gate QA pass
```

---

## 5. Fixture 3. Rights Risk Wedding SDM

```yaml
rights_risk_wedding_sdm:
  purpose: safety and human review path
  inputs:
    - brand factsheet
    - images with unknown rights
    - claimed reviews without proof
    - incomplete refund policy
  expected:
    - public image usage blocked
    - review_required items created
    - unsupported claims blocked
    - export blocked or conditional
```

---

## 6. Golden Test Rules

```yaml
rules:
  - golden fixtures must not include real customer private data
  - image files may be synthetic placeholders
  - expected outputs should be deterministic where possible
  - LLM-dependent snapshots should compare structure and safety fields, not exact prose
```

---

## 7. Acceptance Criteria

```yaml
accepted_when:
  - minimal fixture can run MVP pipeline
  - standard fixture can run v1 pipeline
  - rights risk fixture triggers human review and blocks unsafe export
```
