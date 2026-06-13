# Spec Evolution Protocol

## 1. Purpose

This protocol defines how requirements evolve after initial SDD.

No public contract should change through code alone. Specs and tests must evolve first.

## 2. Spec Change Flow

```text
1. Identify need for change
2. Classify change type
3. Update relevant docs
4. Add or update tests
5. Implement code
6. Run regression suite
7. Update manifest/changelog if needed
```

## 3. Change Types

```yaml
change_types:
  additive:
    example: new optional field
    approval: low
  contract_change:
    example: required output file changes
    approval: high
  safety_change:
    example: claim policy changes
    approval: high
  domain_expansion:
    example: consulting_firm domain pack
    approval: high
  internal_refactor:
    example: helper extraction
    approval: low
```

## 4. Required Documentation Updates

```yaml
if_output_contract_changes:
  update:
    - docs/10_SSOT_OUTPUT_CONTRACT.md
    - docs/domain/ZIP_ONBOARDING_OUTPUT_SPEC.md
    - docs/qa/12_GATE_VALIDATION_SPEC.md
    - tests/golden expectations

if_domain_pack_changes:
  update:
    - docs/domain-packs/* if present
    - docs/domain/UCA_TYPE_MAPPING_WEDDING_SDM.md or new domain spec
    - domain fixtures

if_api_changes:
  update:
    - docs/07_API_CONTRACTS.md
    - frontend API usage tests
```

## 5. Spec Evolution Acceptance

```yaml
accepted_when:
  - doc updated
  - test updated
  - code implemented
  - regression passes
  - migration plan exists if DB affected
```
