# Supabase Storage Buckets

## 1. Purpose

This document defines the Supabase Storage buckets, access modes, and path conventions for Wedding Surface Agent.

## 2. Buckets

```yaml
buckets:
  source-uploads:
    access: private
    purpose: "Brand Factsheet, policy docs, evidence docs, reference docs"

  source-images:
    access: private
    purpose: "Original uploaded images"

  normalized-images:
    access: private by default
    purpose: "Normalized and renamed images used by gallery JSON and ZIP export"

  generated-json:
    access: private
    purpose: "Generated JSON package files"

  generated-zips:
    access: private
    purpose: "Final onboarding ZIP packages"

  ai-visuals:
    access: private by default
    purpose: "AI-generated guide visuals, process visuals, concept visuals"

  qa-reports:
    access: private
    purpose: "QA reports and validation artifacts"
```

## 3. Bucket Creation

Recommended Supabase CLI or dashboard bucket names:

```text
source-uploads
source-images
normalized-images
generated-json
generated-zips
ai-visuals
qa-reports
```

All buckets should start private.

## 4. Path Convention

Use:

```text
{organization_id}/{project_id}/...
```

as the first two path segments for every stored object.

Examples:

```text
source-uploads/{organization_id}/{project_id}/factsheets/{file_id}-{safe_file_name}
source-images/{organization_id}/{project_id}/original/{source_image_id}-{safe_file_name}
normalized-images/{organization_id}/{project_id}/albums/{album_id}/{file_name}
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/{file_name}
generated-zips/{organization_id}/{project_id}/{job_id}/{package_name}.zip
ai-visuals/{organization_id}/{project_id}/{visual_asset_id}/{file_name}
qa-reports/{organization_id}/{project_id}/{job_id}/{report_name}.json
```

## 5. Storage Access Rules

```yaml
access_rules:
  source-uploads:
    read: signed_url_after_project_access_check
    write: owner_admin_operator

  source-images:
    read: signed_url_after_project_access_check
    write: owner_admin_operator

  normalized-images:
    read: signed_url_after_project_access_check
    write: worker_or_operator

  generated-json:
    read: signed_url_after_project_access_check
    write: worker_or_export_service

  generated-zips:
    read: signed_url_after_project_access_check
    write: worker_or_export_service

  ai-visuals:
    read: signed_url_after_project_access_check
    write: worker_or_operator

  qa-reports:
    read: signed_url_after_project_access_check
    write: worker_or_qa_service
```

## 6. Export Path Mapping

Storage paths and ZIP internal paths are different.

Storage path:

```text
normalized-images/{organization_id}/{project_id}/albums/{album_id}/{file_name}
```

ZIP internal path:

```text
brand_onboarding_bundle/images/albums/{album_id}/{file_name}
```

JSON `image_path` value:

```text
images/albums/{album_id}/{file_name}
```

The exporter must resolve JSON internal paths to storage objects through the image reference map.

## 7. Signed URL Policy

```yaml
signed_url_policy:
  expiration_seconds: 300-3600
  generated_by: server_only
  requires:
    - authenticated user
    - project access check
    - object path project scope check
```

## 8. Public Access Policy

MVP should not rely on public buckets.

Public access may be considered only for normalized images after:

```yaml
public_access_conditions:
  - rights_status is approved
  - consent_status is approved or not_applicable
  - public_use_allowed is true
  - project owner approved publication
  - storage path does not expose source private path
```

AI visuals may be public only when:

```yaml
ai_visual_public_conditions:
  - disclosure_required is satisfied
  - disclosure_text exists
  - can_represent_actual_work is false
  - qa_status is pass or warning_accepted
  - human review approved public use
```

## 9. Acceptance Criteria

```yaml
accepted_when:
  - all buckets are private by default
  - all paths include organization_id and project_id
  - signed URLs require project access checks
  - export service can map JSON image_path to storage path
  - ZIP output includes images at expected internal paths
  - source and normalized assets are separated
```
