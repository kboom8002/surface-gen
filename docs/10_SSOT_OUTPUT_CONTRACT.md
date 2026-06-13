# 10. SSoT Output Contract

## 1. Purpose

This document defines the canonical output contract for the Wedding Surface Agent.

The system must transform a Brand Factsheet and representative image set into a CMS-ready SSoT package for the `wedding_sdm` industry type.

The output contract has two layers:

1. **Core onboarding files** used directly by the AIHompy turnkey onboarding engine.
2. **Advanced strategy and QA files** used for SEO/AEO/GEO, brand knowledge graph, UX copy, visual experience, growth operation, and validation.

The core onboarding files must be deterministic, valid JSON, UTF-8 encoded, and safe for import.

---

## 2. Canonical Output Folder

The final package must use this folder structure.

```text
brand_onboarding_bundle/
├── 01_upload/
│   ├── universal_content_assets_final.json
│   ├── brand_profiles.json
│   ├── design_config.json
│   ├── gnb_ia_config.json
│   ├── gallery_albums.json
│   ├── gallery_photos.json
│   ├── album_taxonomy_nodes.json
│   └── visual_asset_url_map_master.json
├── 02_semantic_strategy/
├── 03_knowledge_graph/
├── 04_schema/
├── 05_ux_copy/
├── 06_visual_experience/
├── 07_growth/
├── 08_manifests/
├── 09_qa/
└── images/
```

The `01_upload` directory is the canonical import source.

Do not place another `universal_content_assets*.json` file outside `01_upload` unless the file name cannot be confused with the canonical UCA final file.

---

## 3. Required Core Files

```yaml
required_core_files:
  - path: 01_upload/universal_content_assets_final.json
    format: JSON array
    purpose: Canonical SSoT content asset table

  - path: 01_upload/brand_profiles.json
    format: JSON object or JSON array with one tenant record
    purpose: Brand metadata and SEO profile

  - path: 01_upload/design_config.json
    format: JSON object
    purpose: Theme and UI design overrides

  - path: 01_upload/gnb_ia_config.json
    format: JSON object
    purpose: GNB/IA structure and page-node contract

  - path: 01_upload/gallery_albums.json
    format: JSON array
    purpose: Gallery album-level metadata

  - path: 01_upload/gallery_photos.json
    format: JSON array
    purpose: Photo-level metadata, taxonomy, copy, and rights status

  - path: 01_upload/album_taxonomy_nodes.json
    format: JSON array
    purpose: Album, mood, style, scene, and vibe filter nodes

  - path: 01_upload/visual_asset_url_map_master.json
    format: JSON array
    purpose: Visual asset mapping including actual photos, AI visuals, and disclosure metadata
```

---

## 4. Universal Content Assets Contract

### 4.1 File

```text
01_upload/universal_content_assets_final.json
```

### 4.2 Format

```yaml
format: JSON array
```

### 4.3 Record Contract

Every record must follow this contract.

```ts
export type UniversalContentAsset = {
  id: string;
  tenant_id: string;
  type: WeddingSsotType;
  category: string;
  title: string;
  slug: string;
  summary: string;
  status: 'active' | 'draft' | 'suspended' | 'archived';
  review_status: 'approved' | 'review_required' | 'rejected' | 'internal_only';
  sort_order: number;
  pinned?: boolean;
  body?: string;
  body_richtext?: string;
  json_payload: Record<string, unknown>;
  relations?: Record<string, unknown>;
  translations?: Record<string, unknown>;
  created_source?: 'ai_generated' | 'client_provided' | 'human_edited' | 'system_generated';
};
```

### 4.4 Required Common Fields

```yaml
required_common_fields:
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
  - json_payload
```

### 4.5 Required Detail Fields

Public detailed assets must include:

```yaml
required_detail_fields:
  - body
  - body_richtext
  - json_payload.seo_title
  - json_payload.meta_description
```

Public detailed assets must not be summary-only.

---

## 5. Wedding SSoT Type Rules

### 5.1 Allowed Public UCA Types

```yaml
allowed_wedding_sdm_types:
  authority:
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

  catalog:
    - program
    - product
    - compare
    - process_step
    - routine

  editorial:
    - article
    - checklist
    - comparison
    - style_guide
    - brand_story

  visual:
    - portfolio
    - gallery
    - portfolio_docent
    - style_collection
    - designer_profile

  community:
    - review
    - case_study
    - creator

  system:
    - design_config
    - ia_config
    - landing_page
```

### 5.2 Forbidden Public UCA Types

```yaml
forbidden_public_uca_types:
  - gallery_photos
  - answer_faq
  - package
  - guide_article
  - image_asset
  - page_config
```

### 5.3 Replacement Rules

```yaml
replacement_rules:
  gallery_photos: gallery_photos.json
  answer_faq: answer
  package: program
  guide_article: article
  image_asset: visual_asset_url_map_master.json
  page_config: gnb_ia_config.json or design_config.json
```

---

## 6. Category Mapping

```yaml
category_mapping:
  portfolio:
    - portfolio
    - portfolio_docent
    - style_collection
    - case_study

  gallery:
    - gallery

  catalog:
    - program
    - product
    - compare
    - policy_card
    - process_step
    - routine

  answers:
    - answer
    - article
    - checklist
    - comparison
    - style_guide

  about:
    - about_brand
    - brand_truth
    - evidence
    - person
    - brand_story
    - web_presence
    - vendor_partner
    - creator

  contact:
    - contact_info
    - match_brief
    - cta_block
```

A UCA record fails the type/category alignment gate if its `category` conflicts with its `type` and no explicit override is documented.

---

## 7. ID Rules

```yaml
id_rules:
  tenant_slug:
    format: lowercase ascii slug
    example: studio_blanc

  uca_id:
    format: "{type}_{tenant_slug}_{semantic_slug}"
    example: answer_studio_blanc_dark_hall_snap

  album_id:
    format: "{tenant_slug}_album_{000}"
    example: studio_blanc_album_001

  photo_id:
    format: "{album_id}_photo_{000}"
    example: studio_blanc_album_001_photo_001

  visual_asset_id:
    format: "vis_{tenant_slug}_{usage_or_album}_{000}"
    example: vis_studio_blanc_article_dark_hall_001
```

---

## 8. Body Richtext Density Contract

Minimum public body density:

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

Recommended SOTA density:

```yaml
recommended_body_richtext_density:
  about_brand: 1200-1800
  brand_truth: 800-1200
  portfolio_docent: 1200-2000
  style_collection: 1000-1500
  program: 1200-1800
  policy_card: 700-1200
  answer: 800-1200
  article: 4000-7000
  contact_info: 700-1000
  match_brief: 700-1200
```

---

## 9. SEO/AEO Fields

Every public detailed asset should include:

```yaml
seo_aeo_fields:
  - json_payload.seo_title
  - json_payload.meta_description
  - json_payload.concept_tags
  - json_payload.canonical_question if answer or article
  - json_payload.answer_first_sentence if answer
  - json_payload.key_takeaways if article
  - json_payload.source_basis if answer, article, evidence, policy_card
```

SEO/AEO readiness fails when fewer than 50% of public content assets have both `seo_title` and `meta_description`.

SEO/AEO readiness warns when coverage is between 50% and 80%.

---

## 10. Required Type Payloads

### 10.1 `answer`

```yaml
answer_payload_required:
  - title
  - question
  - canonical_question
  - answer_first_sentence
  - answer_short
  - body
  - body_richtext
  - universal_blueprint_type
  - blueprint_reason
  - why_it_matters
  - how_to_apply
  - decision_criteria
  - recommended_action
  - caution
  - safety_level
  - related_cta
  - source_basis
  - related_program_ids
  - related_policy_ids
  - related_photo_ids
  - related_article_ids
  - seo_title
  - meta_description
  - concept_tags
  - _structured
```

### 10.2 `article`

```yaml
article_payload_required:
  - title
  - summary
  - body
  - body_richtext
  - key_takeaways
  - toc
  - author
  - author_role
  - reading_time_min
  - canonical_question_or_search_intent
  - related_answer_ids
  - related_gallery_photo_ids
  - related_program_ids
  - related_policy_ids
  - richmedia_blocks
  - final_cta
  - seo_title
  - meta_description
  - concept_tags
  - _structured
```

### 10.3 `program`

```yaml
program_payload_required:
  - title
  - summary
  - description
  - body
  - body_richtext
  - price
  - price_note
  - price_mode
  - duration
  - package_includes
  - included_items
  - excluded_items
  - optional_addons
  - booking_lead_time
  - recommended_for
  - not_recommended_for
  - related_portfolio_ids
  - related_gallery_album_ids
  - related_answer_ids
  - related_policy_ids
  - cta
  - seo_title
  - meta_description
```

### 10.4 `policy_card`

```yaml
policy_card_payload_required:
  - title
  - policy_type
  - summary
  - body
  - body_richtext
  - effective_date
  - last_updated
  - sections
  - boundary_note
  - contact_for_inquiry
  - source_basis
  - seo_title
  - meta_description
```

### 10.5 `portfolio_docent`

```yaml
portfolio_docent_payload_required:
  - title
  - summary
  - body
  - body_richtext
  - album_id
  - related_photo_ids
  - album_mood
  - what_to_notice
  - visual_reading_guide
  - who_this_style_is_for
  - not_recommended_for
  - related_program_ids
  - related_policy_ids
  - related_answer_ids
  - related_article_ids
  - consultation_cta
  - richmedia_blocks
  - seo_title
  - meta_description
```

---

## 11. Relation Resolution Contract

All relation IDs must resolve within the same package unless explicitly external.

```yaml
relation_fields_to_check:
  - related_program_ids
  - related_policy_ids
  - related_answer_ids
  - related_article_ids
  - related_photo_ids
  - related_gallery_album_ids
  - related_portfolio_ids
  - evidence_ids
  - person_ids
  - visual_asset_ids
```

Unresolved public relations fail the relation integrity gate.

---

## 12. Status and Review Status

```yaml
status_values:
  - active
  - draft
  - suspended
  - archived

review_status_values:
  - approved
  - review_required
  - rejected
  - internal_only
```

Status controls lifecycle.

Review status controls publication trust.

A public `active` asset with `review_required` is allowed only when the specific unresolved item does not create legal, rights, pricing, review, or claim risk.

---

## 13. Export Validation

A package is exportable when:

```yaml
exportable_if:
  - all required 8 core JSON files exist
  - universal_content_assets_final.json is valid JSON array
  - all public UCA records use allowed types
  - no forbidden public UCA type exists
  - all detailed public assets have body_richtext
  - gallery_photos are stored in gallery_photos.json, not as public UCA
  - image paths resolve
  - AI visual disclosure is present when needed
  - manifest exists
```

---

## 14. Non-Goals

This output contract does not define:

- the visual design implementation of the final website
- billing
- multi-industry expansion
- production crawling or ranking guarantees
- automatic publication without human approval

