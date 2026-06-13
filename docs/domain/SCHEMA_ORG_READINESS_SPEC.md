# Schema.org Readiness Specification

## 1. Purpose

This document defines how generated SSoT assets are prepared for Schema.org JSON-LD generation and rich result eligibility analysis.

The app does not need to guarantee rich results. It must produce a readiness map that shows which assets are eligible, partial, or blocked.

## 2. Canonical Files

Files are written under `04_schema/`:

```text
schema_readiness_map.json
jsonld_generation_plan.json
rich_result_eligibility_report.json
```

## 3. Schema Target by SSoT Type

```yaml
schema_targets:
  about_brand:
    - Organization
    - LocalBusiness

  brand_truth:
    - Article

  program:
    - Product

  product:
    - Product

  portfolio:
    - VisualArtwork

  portfolio_docent:
    - Article
    - VisualArtwork

  gallery:
    - ImageGallery

  answer:
    - Article

  article:
    - Article

  policy_card:
    - Article

  review:
    - Review

  person:
    - Person

  contact_info:
    - LocalBusiness

  match_brief:
    - WebPage
```

## 4. Readiness Status

```ts
export type SchemaReadinessStatus = 'eligible' | 'partial' | 'not_eligible' | 'blocked';
```

## 5. Schema Readiness Map Schema

```ts
export type SchemaReadinessMap = {
  version: string;
  project_id: string;
  tenant_slug: string;
  assets: SchemaReadinessRecord[];
  summary: {
    eligible_count: number;
    partial_count: number;
    not_eligible_count: number;
    blocked_count: number;
  };
};

export type SchemaReadinessRecord = {
  uca_id: string;
  ssot_type: string;
  target_schema_type: string;
  required_schema_fields: string[];
  available_fields: string[];
  missing_fields: string[];
  rich_result_eligibility: {
    status: SchemaReadinessStatus;
    reason: string;
  };
  recommended_patch: string[];
};
```

## 6. JSON-LD Generation Plan

```ts
export type JsonLdGenerationPlan = {
  version: string;
  project_id: string;
  tenant_slug: string;
  records: JsonLdPlanRecord[];
};

export type JsonLdPlanRecord = {
  uca_id: string;
  schema_type: string;
  jsonld_id: string;
  source_fields: Record<string, string>;
  required_patches: string[];
  can_generate: boolean;
  blocked_reason?: string;
};
```

## 7. Required Fields by Schema

```yaml
required_fields:
  Organization:
    - name
    - url

  LocalBusiness:
    - name
    - address
    - telephone
    - url

  Product:
    - name
    - description
    - image
    - offers_or_price_note

  VisualArtwork:
    - name
    - image
    - description
    - creator_or_brand

  ImageGallery:
    - name
    - description
    - image

  Article:
    - headline
    - description
    - dateModified
    - mainEntityOfPage

  Review:
    - reviewBody
    - author
    - itemReviewed

  Person:
    - name
    - description
```

## 8. Rich Result Eligibility Report

```ts
export type RichResultEligibilityReport = {
  version: string;
  project_id: string;
  tenant_slug: string;
  generated_at: string;
  records: RichResultEligibilityRecord[];
};

export type RichResultEligibilityRecord = {
  uca_id: string;
  target_schema_type: string;
  status: SchemaReadinessStatus;
  blockers: string[];
  warnings: string[];
  recommended_patch: string[];
};
```

## 9. Rules

- Schema readiness is an internal analysis output, not a guarantee of search appearance.
- Do not generate review schema for invented reviews.
- Do not generate Product offers with exact prices unless price data is verified.
- If price is consultation-based, use a safe `price_note` and mark Product readiness as partial unless the rendering layer supports safe offer modeling.
- Do not generate LocalBusiness address unless address is verified.
- AI visuals must not be used as actual work images in VisualArtwork schema.

## 10. Validation Gate

The Schema.org Readiness Gate passes when:

- All public UCA assets have a target schema or explicit no-schema reason.
- Major assets have required fields or patch recommendations.
- Review/Product/LocalBusiness records do not contain unsupported facts.
- JSON-LD generation plan contains no blocked critical public asset without explanation.
