# UCA Type Mapping for wedding_sdm

## 1. Purpose
This document defines the SSoT UCA type rules for `wedding_sdm`. It is the canonical reference for generated public assets and export validation.

## 2. Allowed Types by Layer

### Authority
```yaml
authority_types:
  - about_brand
  - brand_truth
  - evidence
  - person
  - contact_info
  - match_brief
  - policy_card
  - web_presence
  - vendor_partner
  - answer
```

### Catalog
```yaml
catalog_types:
  - program
  - product
  - compare
  - process_step
  - routine
```

### Editorial
```yaml
editorial_types:
  - article
  - checklist
  - comparison
  - style_guide
  - brand_story
```

### Visual
```yaml
visual_types:
  - portfolio
  - gallery
  - portfolio_docent
  - style_collection
  - designer_profile
```

### Community
```yaml
community_types:
  - review
  - case_study
  - creator
```

## 3. Forbidden Public UCA Types

```yaml
forbidden_public_uca_types:
  - gallery_photos
  - answer_faq
  - package
  - guide_article
  - image_asset
  - page_config
```

## 4. Replacement Rules

```yaml
replacement_rules:
  gallery_photos:
    replacement: gallery_photos.json
    note: "Photo-level data is exported separately, not as public UCA."
  answer_faq:
    replacement: answer
    note: "Deep decision-card answers use answer type."
  package:
    replacement: program
    note: "Wedding package is represented as program."
  guide_article:
    replacement: article
    note: "Longform guide uses article type."
  image_asset:
    replacement: visual_asset_url_map_master.json
    note: "Visual metadata is exported separately."
  page_config:
    replacement: gnb_ia_config.json
    note: "Page config is handled by GNB/IA config."
```

## 5. Category Mapping

```yaml
category_mapping:
  portfolio: portfolio
  portfolio_docent: portfolio
  style_collection: portfolio
  gallery: gallery
  program: catalog
  product: catalog
  compare: catalog
  policy_card: catalog
  process_step: catalog
  answer: answers
  article: answers
  checklist: answers
  comparison: answers
  style_guide: answers
  about_brand: about
  brand_truth: about
  evidence: about
  person: about
  brand_story: about
  web_presence: about
  vendor_partner: about
  review: about
  case_study: portfolio
  contact_info: contact
  match_brief: contact
  cta_block: contact
```

## 6. Required Common Fields

```yaml
required_public_uca_fields:
  - id
  - tenant_id
  - type
  - category
  - title
  - slug
  - summary
  - status
  - review_status
  - sort_order
  - pinned
  - json_payload
```

Detailed public assets must include:

```yaml
required_detail_fields:
  - body
  - body_richtext
  - seo_title
  - meta_description
```

## 7. Density Rules

```yaml
minimum_body_richtext_density:
  about_brand: 900
  brand_truth: 500
  portfolio_docent: 1000
  style_collection: 800
  program: 1000
  policy_card: 600
  answer: 650
  article: 3000
  contact_info: 500
  match_brief: 500
```

## 8. ID Rules

```yaml
id_rules:
  uca_id: "{type}_{tenant_slug}_{semantic_slug}"
  album_id: "{tenant_slug}_album_{000}"
  photo_id: "{album_id}_photo_{000}"
  visual_asset_id: "vis_{tenant_slug}_{album_or_usage}_{000}"
```

## 9. GNB Minimum Asset Expectations

```yaml
gnb_asset_expectations:
  portfolio:
    required:
      - portfolio
      - portfolio_docent
      - style_collection
  catalog:
    required:
      - program
      - policy_card
      - compare
  gallery:
    required:
      - gallery
      - gallery_albums.json
      - gallery_photos.json
  answers:
    required:
      - answer
      - article
  about:
    required:
      - about_brand
      - brand_truth
      - evidence
  contact:
    required:
      - contact_info
      - match_brief
```

## 10. Validation Rules
An export fails if:
- any forbidden public UCA type appears
- public detailed asset lacks `body_richtext`
- body_richtext is below minimum density unless asset is draft/internal-only
- category does not match allowed mapping
- generated `gallery_photos` appears in `universal_content_assets_final.json`
- any public claim lacks proof, boundary, or review status
