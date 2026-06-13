# Visual Semantic Editor Spec

## Purpose

The Visual Semantic Editor manages uploaded wedding photos as semantic assets. It supports album grouping, rights review, taxonomy editing, docent copy editing, usage role assignment, and visual experience planning.

## Layout

```yaml
layout:
  left_panel:
    component: AlbumSidebar
  center_panel:
    component: PhotoGrid
  right_panel:
    component: PhotoDetailEditor
```

## Album Sidebar

```yaml
album_sidebar:
  shows:
    - album_id
    - album_title
    - photo_count
    - representative_photo_id
    - status
  actions:
    - create album
    - rename album
    - set cover photo
    - sort albums
```

## Photo Grid

```yaml
photo_grid:
  card_badges:
    - rights_status
    - review_status
    - usage_role
    - confidence
    - selected
  filters:
    - album
    - scene_type
    - mood_tags
    - style_tags
    - usage_role
    - rights_status
    - review_status
  actions:
    - multi_select
    - bulk_edit
    - open_detail
```

## Photo Detail Editor

```yaml
photo_detail_tabs:
  identity:
    fields:
      - original_file_name
      - file_name
      - image_path
      - thumbnail_path
      - album_id
      - photo_id
  visual_facts:
    fields:
      - visible_subject
      - visible_space
      - indoor_outdoor
      - lighting_condition
      - main_pose_or_action
      - visible_objects
  taxonomy:
    fields:
      - service_domain
      - scene_type
      - subject_tags
      - mood_tags
      - style_tags
      - composition_tags
      - usage_role
      - vibe_vector
  copy:
    fields:
      - alt
      - caption
      - scene_note
      - style_note
      - recommended_for
  rights:
    fields:
      - public_use_status
      - contains_face
      - contains_logo
      - contains_customer_name
      - consent_status
      - rights_note
  qa:
    fields:
      - confidence
      - uncertainty_note
      - human_review_required
      - forbidden_claims_checked
```

## Vibe Vector Control

```yaml
vibe_vector:
  axes:
    - bright_to_moody
    - natural_to_editorial
    - relaxed_to_formal
    - minimal_to_luxury
    - intimate_to_grand
    - documentary_to_directed
  range: 1-5
```

## Visual Truth Rules

```yaml
rules:
  - Do not claim exact location unless provided.
  - Do not claim season unless provided or obvious and safe.
  - Do not claim dress brand or fabric unless provided.
  - Do not expose internal taxonomy tags directly in public caption.
  - Public-use unknown images cannot be assigned to hero or portfolio proof roles.
```

## Acceptance Criteria

```yaml
accepted_when:
  - user can inspect every uploaded image
  - user can edit taxonomy fields
  - user can edit docent copy
  - user can bulk update rights
  - unresolved rights are visible
  - generated gallery_photos can be previewed
```
