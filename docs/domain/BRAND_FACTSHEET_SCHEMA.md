# Brand Factsheet Schema

## 1. Purpose
The Brand Factsheet is the primary truth source for a wedding_sdm project. It provides brand identity, services, packages, policies, proof, contact information, visual preferences, and forbidden claims.

The system must separate verified facts from assumptions. Missing or ambiguous information must be marked `review_required`.

## 2. Top-Level Schema

```yaml
brand_factsheet:
  identity:
  positioning:
  service_catalog:
  pricing_policy:
  process_delivery:
  proof_evidence:
  people_partners:
  contact_presence:
  visual_style:
  copy_safety:
  review_required:
```

## 3. Identity

```yaml
identity:
  official_brand_name: required
  brand_name_short: optional
  tenant_slug: required
  industry_type: wedding_sdm
  business_type:
    - rehearsal_studio
    - dress_shop
    - makeup_studio
    - wedding_snap
    - wedding_venue
    - sdm_package
    - mixed
  location:
    address: optional
    service_area: optional
    neighborhood: optional
  web_presence:
    website_url: optional
    instagram_url: optional
    naver_place_url: optional
    naver_blog_url: optional
    kakao_channel_url: optional
```

## 4. Positioning

```yaml
positioning:
  one_sentence_positioning: required
  short_pitch: required
  brand_values: optional array
  signature_style: optional
  core_audience: required array
  not_for: optional array
  do_not_misread: required array
  competitor_difference: optional
  tone_keywords: optional array
```

## 5. Service Catalog

```yaml
service_catalog:
  service_domains:
    - studio
    - dress
    - makeup
    - snap
    - venue
    - sdm_package
  programs:
    - program_name:
      summary:
      included_items:
      excluded_items:
      optional_addons:
      recommended_for:
      not_recommended_for:
      price_label:
      price_mode:
        - public_starting_price
        - estimated_range
        - consultation_based
      lead_time:
      related_visual_style:
```

## 6. Pricing and Policy

```yaml
pricing_policy:
  price_publication_policy:
  reservation_deposit:
  cancellation_refund:
  schedule_change:
  additional_fee:
  delivery_timeline:
  copyright_portrait_rights:
  external_vendor_policy:
  final_estimate_basis:
```

If any policy is missing, create a review item. Do not invent policy content.

## 7. Process and Delivery

```yaml
process_delivery:
  consultation_process:
  booking_process:
  shooting_process:
  fitting_or_makeup_process:
  retouching_process:
  delivery_process:
  expected_timeline:
```

## 8. Proof and Evidence

```yaml
proof_evidence:
  reviews:
    - review_text:
      customer_name_or_alias:
      source:
      consent_status:
  awards:
    - title:
      issuer:
      year:
      proof_url:
  certifications:
    - title:
      issuer:
      year:
      proof_url:
  partnerships:
    - partner_name:
      relationship:
      proof_basis:
  media_mentions:
    - title:
      publisher:
      url:
      date:
```

Unsupported evidence must not be converted into public claims.

## 9. People and Partners

```yaml
people_partners:
  persons:
    - name:
      role_title:
      role_type:
      credentials:
      bio:
      public_profile_allowed:
  vendor_partners:
    - vendor_name:
      vendor_type:
      partnership_status:
      proof_basis:
```

## 10. Contact and Presence

```yaml
contact_presence:
  phone:
  mobile:
  email:
  kakao_id:
  kakao_url:
  address:
  address_detail:
  business_hours:
  closed_days:
  parking_info:
  naver_map_url:
  google_map_url:
  inquiry_form_url:
```

## 11. Visual Style

```yaml
visual_style:
  preferred_mood_keywords:
  preferred_colors:
  typography_mood:
  benchmark_urls:
  hero_image_preference:
  forbidden_visual_directions:
  ai_visual_allowed:
  ai_visual_notes:
```

## 12. Copy and Safety

```yaml
copy_safety:
  preferred_tone:
  prohibited_tone:
  forbidden_claims:
  required_disclaimers:
  sensitive_topics:
  words_to_avoid:
```

## 13. Review Required List

```yaml
review_required:
  - item_id:
    field_path:
    reason:
    severity:
      - low
      - medium
      - high
      - critical
    suggested_action:
```

## 14. Normalization Output
The agent must normalize the factsheet into:

```yaml
normalized_outputs:
  - brand_truth_sheet.json
  - claim_proof_boundary_graph.json
  - review_required_items
  - source_basis_map
```
