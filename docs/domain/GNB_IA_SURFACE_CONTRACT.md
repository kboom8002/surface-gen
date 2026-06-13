# GNB / IA Surface Contract for Wedding SDM

## 1. Purpose

This document defines the canonical GNB/IA contract for `wedding_sdm` onboarding packages.

The system must generate a CMS-ready navigation structure and map each page surface to the correct SSoT asset types.

GNB/IA is not only a menu. It is the surface-level contract that determines:

- what the website promises to the visitor
- which content types are rendered on each page
- which assets must exist before export
- how internal links and CTAs guide the customer journey
- how SEO/AEO/GEO surfaces are organized

---

## 2. Standard Wedding GNB

The standard top-level GNB has six nodes.

```yaml
standard_gnb:
  portfolio:
    label: 포트폴리오
    href: /portfolio
    role: 실제 결과와 스타일 판단

  catalog:
    label: 패키지·가격
    href: /catalog
    role: 상품, 패키지, 가격 구조, 정책 이해

  gallery:
    label: 갤러리
    href: /gallery
    role: 스타일 탐색과 이미지 감상

  answers:
    label: 가이드·FAQ
    href: /answers
    role: 질문, 불안, 비교, 준비 정보 해결

  about:
    label: 브랜드
    href: /about
    role: 브랜드 신뢰와 정체성 확인

  contact:
    label: 상담·예약
    href: /contact
    role: 문의, 견적, 상담 전환
```

Top-level GNB count must not exceed 7.

---

## 3. Alias Mapping

```yaml
alias_mapping:
  packages: catalog
  pricing: catalog
  price: catalog
  faq: answers
  guide: answers
  articles: answers
  reviews: proof_or_evidence
  cases: portfolio_or_about
  booking: contact
  inquiry: contact
```

Aliases should not create new top-level GNB nodes unless explicitly approved.

---

## 4. Canonical GNB Config

`gnb_ia_config.json` should follow this structure.

```json
{
  "industry_type": "wedding_sdm",
  "ia_version": "wedding_sota_surface_asset_v3_1",
  "desktop_gnb": [
    { "key": "portfolio", "label": "포트폴리오", "href": "/portfolio", "template": "portfolio_masonry_docent" },
    { "key": "catalog", "label": "패키지·가격", "href": "/catalog", "template": "catalog_program_policy" },
    { "key": "gallery", "label": "갤러리", "href": "/gallery", "template": "gallery_filterable" },
    { "key": "answers", "label": "가이드·FAQ", "href": "/answers", "template": "answer_article_hub" },
    { "key": "about", "label": "브랜드", "href": "/about", "template": "about_authority" },
    { "key": "contact", "label": "상담·예약", "href": "/contact", "template": "contact_match_brief" }
  ],
  "mobile_bottom_nav": [
    { "key": "portfolio", "label": "포트폴리오", "href": "/portfolio" },
    { "key": "catalog", "label": "패키지", "href": "/catalog" },
    { "key": "answers", "label": "FAQ", "href": "/answers" },
    { "key": "contact", "label": "상담", "href": "/contact", "emphasis": true }
  ],
  "nodes": {}
}
```

---

## 5. Node Contract

Each page node must include:

```yaml
node_required_fields:
  - key
  - label
  - href
  - template
  - ssot_types
  - page_intent
  - customer_question
  - primary_cta
```

Optional fields:

```yaml
node_optional_fields:
  - album_scope
  - hero_strategy
  - visual_role
  - schema_targets
  - seo_focus
  - required_asset_counts
  - recommended_asset_counts
```

---

## 6. Page Surface Contracts

### 6.1 Portfolio

```yaml
portfolio:
  label: 포트폴리오
  href: /portfolio
  template: portfolio_masonry_docent
  customer_question: "실제 결과와 스타일은 어떤가?"
  page_intent:
    - style_validation
    - proof_exploration
    - consultation_preparation
  ssot_types:
    - portfolio
    - portfolio_docent
    - style_collection
    - case_study
  required_assets:
    portfolio: 1
    portfolio_docent: 3-5
    style_collection: 3-6
  optional_assets:
    case_study: 1-3
    review: 1-5
  visual_role:
    primary: actual_photo
    forbidden: ai_portfolio_replacement
  primary_cta:
    text: 이 무드로 상담하기
    href: /contact
```

Portfolio must not be a simple photo dump. It must include docent interpretation and decision-support copy.

---

### 6.2 Catalog

```yaml
catalog:
  label: 패키지·가격
  href: /catalog
  template: catalog_program_policy
  customer_question: "어떤 상품·패키지·가격 구조인가?"
  page_intent:
    - package_comparison
    - price_understanding
    - policy_risk_reduction
  ssot_types:
    - program
    - product
    - compare
    - policy_card
    - process_step
  required_assets:
    program: 3-5
    compare: 1-2
    policy_card: 6-8
    process_step: 5-9
  optional_assets:
    product: 0-8
    vendor_partner: 0-5
  primary_cta:
    text: 이 구성으로 견적 문의하기
    href: /contact
```

Catalog must clearly separate included items, excluded items, optional add-ons, price mode, and policy boundaries.

---

### 6.3 Gallery

```yaml
gallery:
  label: 갤러리
  href: /gallery
  template: gallery_filterable
  customer_question: "사진을 더 탐색하고 취향을 찾을 수 있는가?"
  page_intent:
    - mood_exploration
    - style_discovery
    - reference_saving
  ssot_types:
    - gallery
    - style_collection
  required_files:
    - gallery_albums.json
    - gallery_photos.json
    - album_taxonomy_nodes.json
  required_assets:
    gallery: 1-5
    gallery_albums: 1-5
    gallery_photos: 20-100
    album_taxonomy_nodes: 10-40
  visual_role:
    primary: actual_photo
  primary_cta:
    text: 마음에 드는 컷 저장하기
    href: /contact
```

`gallery_photos` must be stored in `gallery_photos.json`, not as public UCA records.

---

### 6.4 Answers

```yaml
answers:
  label: 가이드·FAQ
  href: /answers
  template: answer_article_hub
  customer_question: "내 질문과 불안을 해결할 수 있는가?"
  page_intent:
    - risk_resolution
    - comparison_support
    - preparation_guidance
    - ai_answer_visibility
  ssot_types:
    - answer
    - article
    - checklist
    - comparison
    - style_guide
  required_assets:
    answer: 25-50
    article: 4-8
    checklist: 2-5
    comparison: 1-3
    style_guide: 2-5
  primary_cta:
    text: 상담 전 체크리스트 보기
    href: /contact
```

Answers must be decision cards, not short FAQs.

---

### 6.5 About

```yaml
about:
  label: 브랜드
  href: /about
  template: about_authority
  customer_question: "믿을 만한 브랜드인가?"
  page_intent:
    - trust_building
    - brand_identity
    - proof_explanation
  ssot_types:
    - about_brand
    - brand_truth
    - evidence
    - person
    - brand_story
    - web_presence
    - vendor_partner
  required_assets:
    about_brand: 1
    brand_truth: 1
    evidence: 3-8
  optional_assets:
    person: 1-5
    brand_story: 1
    web_presence: 2-6
  primary_cta:
    text: 포트폴리오로 확인하기
    href: /portfolio
```

About must communicate both what the brand does and what it does not claim.

---

### 6.6 Contact

```yaml
contact:
  label: 상담·예약
  href: /contact
  template: contact_match_brief
  customer_question: "지금 어떻게 문의하면 되는가?"
  page_intent:
    - lead_capture
    - consultation_preparation
    - quote_request
  ssot_types:
    - contact_info
    - match_brief
    - cta_block
  required_assets:
    contact_info: 1
    match_brief: 1
    cta_block: 3-5
  optional_assets:
    process_step: 1-3
  primary_cta:
    text: 상담 브리프 작성하기
    href: /contact
```

Contact must reduce form friction and support image-based preference capture.

---

## 7. Mobile Navigation Rules

Mobile bottom nav should prioritize conversion and high-frequency exploration.

```yaml
mobile_bottom_nav_recommended:
  - portfolio
  - catalog
  - answers
  - contact
```

Contact should be visually emphasized.

---

## 8. Page Experience Strategy

Each page must define:

```yaml
page_experience_fields:
  - customer_state
  - page_promise
  - copy_role
  - primary_visual_role
  - primary_cta
  - secondary_cta
  - risk_reduction_message
```

Example:

```yaml
portfolio:
  customer_state: "취향과 실제 결과를 확인하는 상태"
  page_promise: "사진을 감상하는 데서 끝나지 않고, 어떤 스타일이 자신에게 맞는지 판단하도록 돕는다."
  copy_role: "사진을 읽는 기준 제공"
  primary_visual_role: actual_portfolio_photo
  primary_cta: "이 무드로 상담하기"
```

---

## 9. GNB Coverage Gate

The GNB/IA gate passes only if:

```yaml
pass_if:
  - top-level GNB node count <= 7
  - all six standard nodes exist unless explicitly waived
  - each node has ssot_types
  - each node has page_intent
  - each node has primary_cta
  - required asset counts are met or marked planned/draft
  - mobile bottom nav exists
```

The gate fails if:

```yaml
fail_if:
  - portfolio node missing
  - catalog node missing
  - contact node missing
  - GNB node maps to forbidden UCA type
  - top-level GNB count exceeds 7
  - ssot_types do not match category mapping
```

---

## 10. SEO/AEO/GEO Surface Role

Each page should support a search role.

```yaml
search_surface_roles:
  portfolio:
    role: visual proof and image search context
  catalog:
    role: commercial intent and package comparison
  gallery:
    role: image discovery and style cluster exploration
  answers:
    role: AEO direct answer and AI citation surface
  about:
    role: brand entity and trust definition
  contact:
    role: local action and conversion surface
```

---

## 11. Non-Goals

This contract does not define:

- pixel-level UI design
- final storefront code implementation
- billing and tenant management
- non-wedding industries
- external SEO performance guarantees

