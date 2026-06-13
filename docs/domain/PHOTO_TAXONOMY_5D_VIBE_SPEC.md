# Photo Taxonomy 5D + Vibe Vector Specification

## 1. Purpose

This document defines the photo-level semantic metadata contract for the Wedding Surface Agent.

Wedding images are not treated as simple uploads. Each image must become a structured semantic asset that supports:

- gallery rendering
- portfolio docent content
- style collection generation
- SEO image context
- customer preference capture
- answer/article richmedia
- visual experience mapping
- brand knowledge graph grounding

---

## 2. Scope

This specification applies to all representative wedding images uploaded to a project.

Typical image count:

```yaml
image_count:
  minimum: 20
  recommended: 50
  premium: 100
```

All public photos must have complete metadata before export.

---

## 3. Core Principle

Only describe what is visible or provided by the client.

Do not infer:

```yaml
forbidden_inferences:
  - exact venue name unless provided
  - exact location unless provided
  - exact season unless provided
  - dress brand unless provided
  - fabric unless clearly provided
  - customer emotion as fact
  - customer identity
  - photographer identity unless provided
  - award-winning status
  - result guarantee
```

If uncertain, use:

```yaml
human_review_required: true
uncertainty_note: "..."
```

---

## 4. Photo Identity Fields

Each photo must include:

```ts
export type PhotoIdentity = {
  tenant_id: string;
  album_id: string;
  photo_id: string;
  original_file_name: string;
  file_name: string;
  image_path: string;
  thumbnail_path: string;
};
```

ID rules:

```yaml
id_rules:
  album_id: "{tenant_slug}_album_{000}"
  photo_id: "{album_id}_photo_{000}"
  file_name: "{sequence_3digit}_{album_short}_{scene_or_usage}.webp"
```

---

## 5. Visual Facts Fields

```ts
export type PhotoVisualFacts = {
  visible_subject: string[];
  visible_space: string;
  indoor_outdoor: 'indoor' | 'outdoor' | 'mixed' | 'unclear';
  lighting_condition: string;
  main_pose_or_action: string;
  visible_objects: string[];
};
```

Examples:

```yaml
visible_subject:
  - bride
  - groom
  - couple
  - dress
  - bouquet
  - ceremony_space
  - floral_arrangement

visible_space:
  - studio_background
  - indoor_hall
  - outdoor_garden
  - bridal_room
  - aisle
  - banquet_space
  - makeup_room

lighting_condition:
  - natural_side_light
  - soft_window_light
  - indoor_warm_light
  - stage_spotlight
  - backlight
  - mixed_light
  - low_light
```

---

## 6. 5D Taxonomy

### 6.1 Scene Dimension

```yaml
scene_type_values:
  - studio_set
  - indoor_set
  - outdoor
  - garden
  - bridal_room
  - ceremony
  - aisle
  - banquet
  - dress_fitting
  - makeup_closeup
  - hall_space
  - detail_cut
  - couple_pose
  - family_group
  - candid_moment
  - product_detail
  - unknown
```

### 6.2 Subject Dimension

```yaml
subject_tags:
  - bride
  - groom
  - couple
  - family
  - guests
  - dress
  - bouquet
  - makeup
  - hair
  - hall_space
  - aisle
  - floral_directing
  - table_setting
  - album_product
  - accessory
```

### 6.3 Mood Dimension

```yaml
mood_tags:
  - natural
  - elegant
  - calm
  - bright
  - classic
  - minimal
  - luxurious
  - documentary
  - editorial
  - intimate
  - formal
  - airy
  - warm
```

### 6.4 Style Dimension

```yaml
style_tags:
  - natural_light
  - studio_lighting
  - soft_retouch
  - clean_background
  - full_dress
  - silhouette
  - candid
  - formal_pose
  - magazine_editorial
  - hotel_wedding
  - garden_wedding
  - modern_minimal
  - classic_portrait
```

### 6.5 Composition Dimension

```yaml
composition_tags:
  - close_up
  - half_shot
  - full_shot
  - wide
  - centered
  - asymmetrical
  - walking
  - seated
  - posed
  - candid
  - over_the_shoulder
  - low_angle
  - high_angle
  - negative_space
```

---

## 7. Vibe Vector

The vibe vector is a numeric summary used for filtering, clustering, consultation preference matching, and style collection generation.

```ts
export type VibeVector = {
  bright_to_moody: 1 | 2 | 3 | 4 | 5;
  natural_to_editorial: 1 | 2 | 3 | 4 | 5;
  relaxed_to_formal: 1 | 2 | 3 | 4 | 5;
  minimal_to_luxury: 1 | 2 | 3 | 4 | 5;
  intimate_to_grand: 1 | 2 | 3 | 4 | 5;
  documentary_to_directed: 1 | 2 | 3 | 4 | 5;
};
```

Scale interpretation:

```yaml
bright_to_moody:
  1: very bright
  3: balanced
  5: very moody

natural_to_editorial:
  1: natural documentary
  3: balanced
  5: editorial magazine-like

relaxed_to_formal:
  1: relaxed candid
  3: semi-directed
  5: formal posed

minimal_to_luxury:
  1: minimal clean
  3: refined
  5: luxury ornate

intimate_to_grand:
  1: intimate close
  3: medium scale
  5: grand spatial

documentary_to_directed:
  1: documentary moment
  3: guided natural
  5: highly directed
```

---

## 8. Usage Role

```yaml
usage_role_values:
  - hero
  - album_cover
  - gallery
  - portfolio_cover
  - portfolio_inline
  - package_card
  - answer_inline
  - article_richmedia
  - review_support
  - guide_inline
  - sns_thumbnail
  - lightbox
  - internal_reference
  - draft_only
```

A photo can have multiple recommended roles, but one primary `usage_role` must be set.

---

## 9. Copy Fields

Every public photo must include these fields.

```ts
export type PhotoCopy = {
  alt: string;
  caption: string;
  scene_note: string;
  style_note: string;
  recommended_for: string;
};
```

Length rules:

```yaml
copy_length_rules:
  alt: 40-90 Korean characters
  caption: 50-100 Korean characters
  scene_note: 90-170 Korean characters
  style_note: 90-170 Korean characters
  recommended_for: 70-150 Korean characters
```

Copy role:

```yaml
copy_role:
  alt: accessibility and factual image description
  caption: short public docent copy
  scene_note: visible scene, space, light, and composition explanation
  style_note: mood, outfit, distance, color tone, and style explanation
  recommended_for: customer decision-support guidance
```

---

## 10. Copy Rules

### 10.1 Do

```yaml
do:
  - describe visible facts
  - explain what customers should notice
  - mention light, space, composition, distance, pose, and visible styling
  - use natural Korean public copy
  - keep captions unique across images
  - support consultation and style selection
```

### 10.2 Do Not

```yaml
do_not:
  - expose internal tags directly
  - repeat the same caption template
  - infer exact location or season
  - infer dress brand or fabric
  - overclaim emotion
  - imply guaranteed result
  - write fake review-like statements
  - identify customers without permission
```

Bad example:

```text
로맨틱하고 따뜻한 분위기의 웨딩 사진입니다.
```

Better example:

```text
넓은 배경 여백과 부드러운 측면광을 활용해 두 사람의 거리감과 드레스 실루엣이 함께 보이는 리허설 촬영 장면입니다.
```

---

## 11. QA Fields

```ts
export type PhotoQa = {
  confidence: number;
  uncertainty_note?: string;
  human_review_required: boolean;
  forbidden_claims_checked: boolean;
  rights_status: 'approved_public' | 'approved_limited' | 'review_required' | 'internal_only' | 'rejected';
  review_status: 'approved' | 'review_required' | 'rejected' | 'internal_only';
};
```

Confidence range:

```yaml
confidence:
  min: 0
  max: 1
  publish_recommended_if: ">= 0.75 and rights_status == approved_public"
```

---

## 12. Gallery Photo Record

`gallery_photos.json` must use this contract.

```ts
export type GalleryPhotoRecord = {
  tenant_id: string;
  album_id: string;
  photo_id: string;
  visual_asset_id?: string;
  original_file_name: string;
  file_name: string;
  image_path: string;
  thumbnail_path: string;
  visible_subject: string[];
  visible_space: string;
  indoor_outdoor: 'indoor' | 'outdoor' | 'mixed' | 'unclear';
  lighting_condition: string;
  main_pose_or_action: string;
  visible_objects: string[];
  service_domain: string;
  scene_type: string;
  subject_tags: string[];
  mood_tags: string[];
  style_tags: string[];
  composition_tags: string[];
  usage_role: string;
  vibe_vector: VibeVector;
  alt: string;
  caption: string;
  scene_note: string;
  style_note: string;
  recommended_for: string;
  confidence: number;
  uncertainty_note?: string;
  human_review_required: boolean;
  forbidden_claims_checked: boolean;
  rights_status: string;
  review_status: string;
  sort_order: number;
};
```

---

## 13. Album Taxonomy Nodes

`album_taxonomy_nodes.json` powers filters and clustering.

```ts
export type AlbumTaxonomyNode = {
  node_id: string;
  tenant_id: string;
  node_type: 'scene' | 'subject' | 'mood' | 'style' | 'composition' | 'vibe_cluster' | 'usage_role';
  label: string;
  slug: string;
  description?: string;
  related_photo_ids: string[];
  related_album_ids: string[];
  sort_order: number;
  is_public_filter: boolean;
};
```

---

## 14. Visual Experience Fields

Photo records may include visual experience metadata.

```yaml
visual_experience_fields:
  experience_mode:
    values:
      - emotional_flow
      - decision_flow
      - trust_flow

  best_surface:
    values:
      - home_hero
      - portfolio_cover
      - gallery_grid
      - answer_inline
      - program_card
      - article_richmedia
      - contact_support

  crop_safety:
    desktop:
    mobile:
    square:

  visual_weight:
    values:
      - hero
      - primary
      - secondary
      - supporting
```

---

## 15. Photo Semantic QA Gate

Pass if:

```yaml
pass_if:
  - every public photo has all required identity fields
  - every public photo has visual facts
  - every public photo has 5D taxonomy
  - every public photo has vibe_vector
  - every public photo has alt and caption
  - every public photo has rights_status
  - every public photo has review_status
  - copy matches visible facts
  - no forbidden inference appears
```

Fail if:

```yaml
fail_if:
  - public photo has unknown rights_status
  - image_path does not resolve
  - caption claims unverified location, season, fabric, brand, or emotion
  - internal tags are exposed directly
  - repeated caption template detected
  - AI visual is mixed with actual photo without disclosure
```

---

## 16. Non-Goals

This spec does not define:

- pixel-level image cropping implementation
- machine vision model selection
- CDN implementation
- legal consent workflow beyond metadata flags

