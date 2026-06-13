# Asset Editor Spec

## Purpose

The Asset Editor lets operators inspect, edit, approve, regenerate, and validate generated SSoT UCA assets.

## Asset List

```yaml
asset_list:
  filters:
    - type
    - category
    - status
    - review_status
    - qa_status
    - text_density_status
  columns:
    - title
    - type
    - category
    - status
    - review_status
    - density
    - relation_count
    - updated_at
```

## Asset Detail Tabs

```yaml
tabs:
  content:
    fields:
      - title
      - slug
      - summary
      - body
      - body_richtext
  json_payload:
    fields:
      - typed JSON editor or readonly viewer in MVP
  relations:
    fields:
      - related_program_ids
      - related_policy_ids
      - related_photo_ids
      - related_answer_ids
      - related_article_ids
  seo:
    fields:
      - seo_title
      - meta_description
      - canonical_question_or_intent
  qa:
    fields:
      - gate failures
      - warnings
      - repair suggestions
  history:
    optional_mvp: true
```

## Editing Rules

```yaml
editing_rules:
  - Public asset cannot be approved if required fields are missing.
  - Forbidden UCA type cannot be saved.
  - body_richtext changes should trigger density validation.
  - relation fields should be checked for unresolved IDs.
  - review_status changes should be recorded.
```

## Regeneration

```yaml
regeneration:
  supported_scope:
    - single asset
    - selected field group
    - failed QA patch
  requires:
    - selected reason
    - preserve manually approved fields unless user allows overwrite
```

## Status Controls

```yaml
status_controls:
  status:
    options:
      - draft
      - active
      - suspended
  review_status:
    options:
      - review_required
      - approved
      - rejected
      - internal_only
```

## Acceptance Criteria

```yaml
accepted_when:
  - user can filter generated assets
  - user can inspect body_richtext
  - user can inspect json_payload
  - user can edit basic fields
  - user can see QA failures for selected asset
  - invalid save is blocked with clear reason
```
