# Export Center Spec

## Purpose

The Export Center generates the final AIHompy onboarding package and prevents unsafe or incomplete exports.

## Required Core Files

```text
01_upload/
├── universal_content_assets_final.json
├── brand_profiles.json
├── design_config.json
├── gnb_ia_config.json
├── gallery_albums.json
├── gallery_photos.json
├── album_taxonomy_nodes.json
└── visual_asset_url_map_master.json
```

## Advanced Folders

```text
02_semantic_strategy/
03_knowledge_graph/
04_schema/
05_ux_copy/
06_visual_experience/
07_growth/
08_manifests/
09_qa/
images/
```

## Readiness Checklist

```yaml
readiness_checklist:
  required_json:
    - all 8 required JSON files exist
    - all are valid JSON
    - all are UTF-8
  uca:
    - no forbidden UCA types
    - public detailed assets have body_richtext
    - tenant_id consistent
  images:
    - image paths resolve
    - thumbnails resolve or fallback exists
    - rights blockers resolved for public usage
  qa:
    - no critical issues
    - required gates pass
  manifest:
    - final_package_manifest exists
    - sha256_manifest exists
```

## Actions

```yaml
actions:
  generate_json:
    description: "Write current DB outputs to canonical JSON files."
  validate_export:
    description: "Run export preflight validation."
  generate_zip:
    description: "Create ZIP package with manifests."
  download_zip:
    description: "Download authorized ZIP."
```

## Manifest Table

```yaml
manifest_table:
  columns:
    - path
    - file_type
    - size_bytes
    - sha256
    - generated_at
```

## Export Status

```yaml
export_status:
  not_ready:
    description: "Required generation has not completed."
  blocked:
    description: "Critical validation issue exists."
  ready:
    description: "Can generate ZIP."
  generated:
    description: "ZIP exists and can be downloaded."
```

## Safety Rules

```yaml
safety_rules:
  - Do not export if forbidden UCA types are present.
  - Do not export if public AI visual can represent actual work.
  - Do not export if required JSON files are missing.
  - Do not export if final UCA file could conflict with reference files.
  - Do not export if critical human review items are unresolved.
```

## Acceptance Criteria

```yaml
accepted_when:
  - required file checklist is visible
  - blocked reason is clear
  - ZIP can be generated only when preflight passes
  - generated ZIP path is saved
  - manifest and sha256 are shown
  - user can download ZIP with authorization
```
