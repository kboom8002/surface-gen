# Upload Flow Spec

## Purpose

Defines how Brand Factsheet, policy/evidence files, and images are uploaded, validated, and prepared for agent jobs.

## Upload Types

```yaml
upload_types:
  brand_factsheet:
    required: true
    accepted:
      - md
      - txt
      - json
      - docx
      - pdf
  package_policy:
    required: false
    accepted:
      - md
      - txt
      - json
      - docx
      - pdf
  evidence:
    required: false
    accepted:
      - md
      - txt
      - json
      - docx
      - pdf
      - jpg
      - png
      - webp
  source_images:
    required: true
    minimum_count: 20
    recommended_count: 50
    maximum_count_mvp: 100
    accepted:
      - jpg
      - jpeg
      - png
      - webp
```

## Upload Steps

```yaml
steps:
  1_select_files:
    description: "User selects or drags files."
  2_client_precheck:
    description: "Validate file count, extension, and size before upload."
  3_storage_upload:
    description: "Upload to project-scoped Supabase Storage path."
  4_db_record_create:
    description: "Create source_files or source_images records."
  5_metadata_capture:
    description: "Capture rights and grouping metadata."
  6_readiness_update:
    description: "Update project intake readiness summary."
```

## Storage Path Pattern

```yaml
storage_paths:
  brand_factsheet: "projects/{project_id}/source/factsheet/{filename}"
  policy: "projects/{project_id}/source/policy/{filename}"
  evidence: "projects/{project_id}/source/evidence/{filename}"
  source_images: "projects/{project_id}/source/images/{filename}"
```

## Image Rights Metadata

Each image must support:

```yaml
image_rights_fields:
  public_use_status:
    enum:
      - allowed
      - restricted
      - unknown
      - prohibited
  contains_face:
    type: boolean_or_unknown
  contains_logo:
    type: boolean_or_unknown
  contains_customer_name:
    type: boolean_or_unknown
  consent_status:
    enum:
      - confirmed
      - not_required
      - unknown
      - denied
  rights_note:
    type: text
```

## Bulk Rights Editing

Operators must be able to:

```yaml
bulk_actions:
  - select multiple images
  - set public_use_status
  - set consent_status
  - add rights_note
  - mark all as review_required
```

## Upload Validation

```yaml
validation:
  factsheet_missing:
    severity: error
  image_count_below_20:
    severity: error
  image_rights_unknown:
    severity: warning_or_blocker_for_public_export
  unsupported_file_type:
    severity: error
  duplicate_file_name:
    severity: warning
    action: normalize or keep original with unique storage path
```

## Acceptance Criteria

```yaml
accepted_when:
  - files upload to project-scoped storage paths
  - DB records are created
  - user can see upload progress
  - user can retry failed upload
  - user can update rights metadata
  - readiness panel reflects uploaded inputs
```
