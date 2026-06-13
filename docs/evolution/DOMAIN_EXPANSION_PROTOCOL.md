# Domain Expansion Protocol

## 1. Purpose

This protocol defines how to expand the factory beyond `wedding_sdm` while preserving the core engine.

## 2. Principle

```yaml
principle:
  core_engine: stable
  domain_pack: replaceable
```

The core engine should not be rewritten for each industry.

## 3. Domain Pack Requirements

Every new domain pack must define:

```yaml
required_domain_pack_fields:
  - industry_type
  - display_name
  - surfaces
  - allowed_asset_types
  - forbidden_asset_types
  - intake_schema
  - customer_journey
  - claim_policy
  - evidence_policy
  - visual_policy
  - schema_org_map
  - qa_profile
  - prompt_pack
  - fixtures
```

## 4. Expansion Order

Recommended order:

```yaml
recommended_order:
  1: refactor wedding_sdm into a domain pack
  2: consulting_firm
  3: skincare_brand
  4: skincare_clinic
  5: korean_medicine_clinic
```

## 5. High-Risk Domains

Healthcare, medical, cosmetic procedure, finance, legal, and regulated domains require additional safety gates.

```yaml
high_risk_domain_rules:
  - human review required
  - stricter claim policy
  - disclaimer policy
  - no result guarantee
  - no fake case study
  - evidence required for expertise claims
```

## 6. Domain Expansion Acceptance

```yaml
accepted_when:
  - domain pack spec exists
  - domain pack fixtures exist
  - allowed/forbidden types defined
  - QA profile defined
  - at least one valid fixture passes
  - at least one invalid safety fixture is blocked
```
