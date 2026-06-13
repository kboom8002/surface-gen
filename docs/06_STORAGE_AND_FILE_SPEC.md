# 06. Storage and File Specification

## 1. Purpose

This document defines how files, images, generated JSON, QA reports, AI visuals, and ZIP packages are stored and referenced.

The storage system must support:

- original Brand Factsheet and policy document uploads
- original image uploads
- normalized image paths for exported JSON
- thumbnail generation references
- generated output JSON files
- final onboarding ZIP packages
- AI visual files and disclosure metadata
- QA report artifacts

## 2. Storage Design Principles

```yaml
storage_principles:
  project_scoped:
    meaning: "Every object path must include project_id or tenant_slug scope."

  export_stable:
    meaning: "Paths referenced by JSON exports must remain stable within an export package."

  rights_aware:
    meaning: "Images must carry rights metadata before being placed on public surfaces."

  no_secret_exposure:
    meaning: "Storage signed URLs must be generated server-side only."

  reproducible_export:
    meaning: "Generated JSON and ZIP exports must have SHA256 checksums and manifest records."
```

## 3. Supabase Buckets

```yaml
buckets:
  source-uploads:
    purpose: "Brand Factsheet, package policy docs, evidence files"
    access: private

  source-images:
    purpose: "Original uploaded images"
    access: private

  normalized-images:
    purpose: "Renamed and processed images ready for export mapping"
    access: private_or_public_by_project_policy

  generated-json:
    purpose: "Generated JSON output files"
    access: private

  generated-zips:
    purpose: "Final onboarding ZIP packages"
    access: private

  ai-visuals:
    purpose: "AI-generated visual files and supporting visuals"
    access: private_or_public_after_review

  qa-reports:
    purpose: "Validation reports and QA artifacts"
    access: private
```

## 4. Path Conventions

### 4.1 Source files

```text
source-uploads/{organization_id}/{project_id}/factsheets/{file_id}-{safe_file_name}
source-uploads/{organization_id}/{project_id}/policies/{file_id}-{safe_file_name}
source-uploads/{organization_id}/{project_id}/evidence/{file_id}-{safe_file_name}
source-uploads/{organization_id}/{project_id}/references/{file_id}-{safe_file_name}
```

### 4.2 Source images

```text
source-images/{organization_id}/{project_id}/original/{source_image_id}-{safe_file_name}
```

### 4.3 Normalized images

```text
normalized-images/{organization_id}/{project_id}/albums/{album_id}/{file_name}
normalized-images/{organization_id}/{project_id}/albums/{album_id}/thumb_{file_name}
```

### 4.4 Generated JSON

```text
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/universal_content_assets_final.json
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/brand_profiles.json
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/design_config.json
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/gnb_ia_config.json
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/gallery_albums.json
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/gallery_photos.json
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/album_taxonomy_nodes.json
generated-json/{organization_id}/{project_id}/{job_id}/01_upload/visual_asset_url_map_master.json
```

### 4.5 Advanced output folders

```text
generated-json/{organization_id}/{project_id}/{job_id}/02_semantic_strategy/{file_name}
generated-json/{organization_id}/{project_id}/{job_id}/03_knowledge_graph/{file_name}
generated-json/{organization_id}/{project_id}/{job_id}/04_schema/{file_name}
generated-json/{organization_id}/{project_id}/{job_id}/05_ux_copy/{file_name}
generated-json/{organization_id}/{project_id}/{job_id}/06_visual_experience/{file_name}
generated-json/{organization_id}/{project_id}/{job_id}/07_growth/{file_name}
generated-json/{organization_id}/{project_id}/{job_id}/08_manifests/{file_name}
generated-json/{organization_id}/{project_id}/{job_id}/09_qa/{file_name}
```

### 4.6 Generated ZIP

```text
generated-zips/{organization_id}/{project_id}/{job_id}/wedding_surface_bundle_{tenant_slug}_{timestamp}.zip
```

### 4.7 AI visuals

```text
ai-visuals/{organization_id}/{project_id}/{visual_asset_id}/{file_name}
```

## 5. Export-internal Paths

Generated JSON should use export-internal paths, not signed Supabase URLs.

Example:

```yaml
image_path: "images/albums/{album_id}/{file_name}"
thumbnail_path: "images/albums/{album_id}/thumb_{file_name}"
```

During ZIP packaging, the exporter resolves internal paths to actual storage objects and copies them into:

```text
brand_onboarding_bundle/images/albums/{album_id}/{file_name}
brand_onboarding_bundle/images/albums/{album_id}/thumb_{file_name}
```

## 6. Image Naming Rules

```yaml
image_naming:
  album_id: "{tenant_slug}_album_{000}"
  photo_id: "{album_id}_photo_{000}"
  visual_asset_id: "vis_{tenant_slug}_{usage_or_album}_{000}"
  file_name: "{sequence_3digit}_{album_short}_{scene_or_usage}.webp"
  thumbnail_file_name: "thumb_{file_name}"
```

Rules:

- Use lowercase safe file names.
- Avoid spaces.
- Avoid Korean characters in final file names for maximum system compatibility.
- Preserve original file name in metadata.
- Do not overwrite existing normalized images unless a new export version is created.

## 7. File Metadata Requirements

### 7.1 Source file metadata

```yaml
source_file_metadata:
  file_id:
  project_id:
  file_type:
  original_file_name:
  safe_file_name:
  storage_path:
  mime_type:
  size_bytes:
  checksum_sha256:
  parse_status:
```

### 7.2 Source image metadata

```yaml
source_image_metadata:
  source_image_id:
  project_id:
  original_file_name:
  normalized_file_name:
  storage_path:
  thumbnail_path:
  album_id:
  photo_id:
  rights_status:
  contains_face:
  contains_logo:
  contains_customer_name:
  consent_status:
  public_use_allowed:
  checksum_sha256:
```

### 7.3 Exported JSON metadata

```yaml
generated_json_metadata:
  project_id:
  job_id:
  file_name:
  file_group:
  storage_path:
  sha256:
  record_count:
  created_at:
```

## 8. Upload Limits

MVP recommended limits:

```yaml
upload_limits:
  brand_factsheet:
    max_files: 5
    max_size_each_mb: 20

  package_policy_docs:
    max_files: 20
    max_size_each_mb: 20

  evidence_docs:
    max_files: 30
    max_size_each_mb: 20

  images:
    min_count: 20
    recommended_count: 50
    max_count_mvp: 100
    max_size_each_mb: 25
```

## 9. Accepted File Types

```yaml
accepted_file_types:
  documents:
    - application/pdf
    - application/vnd.openxmlformats-officedocument.wordprocessingml.document
    - text/markdown
    - text/plain
    - application/json

  images:
    - image/jpeg
    - image/png
    - image/webp
```

Do not accept executable files.

## 10. File Security Rules

```yaml
file_security:
  - never expose private bucket paths directly to unauthenticated users
  - generate signed URLs server-side only
  - check project access before generating signed URLs
  - validate MIME type and extension
  - compute SHA256 for exported files
  - sanitize file names
  - block path traversal strings
  - do not store secrets in uploaded files intentionally
```

## 11. JSON Export Rules

The final package must include the 8 canonical upload JSON files:

```text
01_upload/universal_content_assets_final.json
01_upload/brand_profiles.json
01_upload/design_config.json
01_upload/gnb_ia_config.json
01_upload/gallery_albums.json
01_upload/gallery_photos.json
01_upload/album_taxonomy_nodes.json
01_upload/visual_asset_url_map_master.json
```

Do not create competing files such as:

```text
universal_content_assets.json
universal_content_assets_draft.json
reference_universal_content_assets.json
```

unless they are outside the final ZIP or named in a way that cannot be mistaken for final onboarding input.

## 12. ZIP Packaging Rules

ZIP internal root:

```text
brand_onboarding_bundle/
```

Required folder structure:

```text
brand_onboarding_bundle/
├── 01_upload/
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

Every ZIP must include:

```text
08_manifests/final_package_manifest.json
08_manifests/sha256_manifest.json
09_qa/validation_report.json
```

## 13. Acceptance Criteria

This storage spec is implemented when:

```yaml
accepted_when:
  - all required buckets are documented and created
  - upload paths are project-scoped
  - normalized image paths can map to export-internal paths
  - generated JSON files are stored with SHA256 metadata
  - ZIP export can resolve all image_path values
  - private files are not publicly accessible by default
  - signed URL generation checks project access
```

---

# Handoff Storage Extension

Add storage paths for handoff packages.

```yaml
handoff_storage:
  raw_imports:
    path: projects/{project_id}/handoffs/{handoff_import_id}/raw/

  extracted_imports:
    path: projects/{project_id}/handoffs/{handoff_import_id}/extracted/

  accepted_imported_photos:
    path: projects/{project_id}/images/albums/{album_id}/

  accepted_ai_visuals:
    path: projects/{project_id}/images/ai_visuals/
```

All imported paths must be normalized and checked for path traversal before extraction or persistence.
