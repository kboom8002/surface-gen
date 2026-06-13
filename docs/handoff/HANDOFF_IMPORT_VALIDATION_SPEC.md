# Handoff Import Validation Spec

## 1. Purpose

This document defines deterministic validation for all external handoff imports.

Handoff imports are useful only if they are safer than rerunning model calls. Therefore every imported artifact must be validated before it can influence public CMS output.

---

## 2. Supported Handoff Types

```yaml
supported_handoff_types:
  image_analysis:
    required_files:
      - metadata/handoff_manifest.json
      - metadata/photo_semantic_manifest.json
      - images/**

  ai_visual_generation_result:
    required_files:
      - metadata/handoff_manifest.json
      - metadata/ai_visual_generation_result_manifest.json
      - ai_visuals/**
```

---

## 3. Validation Stages

```yaml
validation_stages:
  stage_1_package_integrity:
    checks:
      - required files exist
      - file extensions allowed
      - package size within configured limit
      - no executable files
      - no path traversal

  stage_2_manifest_schema:
    checks:
      - handoff_manifest schema passes
      - type-specific manifest schema passes
      - supported version

  stage_3_project_binding:
    checks:
      - tenant_slug matches or mapping provided
      - industry_type matches
      - photo_id or visual_asset_id uniqueness

  stage_4_file_resolution:
    checks:
      - every JSON file_path resolves
      - sha256 matches if provided
      - image dimensions readable if checked

  stage_5_domain_policy:
    checks:
      - wedding_sdm visual truth rules
      - AI visual cannot represent actual work
      - public rights unknown creates review item

  stage_6_downstream_readiness:
    checks:
      - imported records can generate gallery_photos
      - imported records can update visual_asset_url_map_master
      - low-confidence records are isolated
```

---

## 4. Result Status

```yaml
handoff_import_status:
  accepted:
    meaning: "Can be used by downstream agent nodes."

  accepted_with_review_required:
    meaning: "Stored and visible, but public use blocked until review."

  rejected:
    meaning: "Not used downstream."

  partially_accepted:
    meaning: "Some records accepted, some rejected."
```

---

## 5. Import Report

Every import must create `handoff_import_report.json`.

```ts
export type HandoffImportReport = {
  report_version: string;
  project_id: string;
  handoff_type: string;
  status: "accepted" | "accepted_with_review_required" | "partially_accepted" | "rejected";
  totals: {
    files_received: number;
    records_received: number;
    records_accepted: number;
    records_review_required: number;
    records_rejected: number;
  };
  errors: HandoffImportIssue[];
  warnings: HandoffImportIssue[];
  review_items_created: string[];
};

export type HandoffImportIssue = {
  code: string;
  severity: "info" | "warning" | "error" | "fatal";
  target_path?: string;
  target_id?: string;
  message: string;
  suggested_action?: string;
};
```

---

## 6. Security Rules

```yaml
security_rules:
  - never execute imported files
  - reject script/executable extensions
  - normalize all file paths
  - prevent zip-slip/path traversal
  - enforce project-level authorization
  - store raw import package separately from accepted records
  - never auto-approve public image rights
```

---

## 7. Downstream Rules

```yaml
downstream_rules:
  image_analysis:
    - accepted photo records can populate photo_semantic_analyses
    - approved records can populate gallery_photos
    - review_required records are excluded from public hero/cover selection

  ai_visual_generation_result:
    - accepted AI visual records can populate visual_asset_url_map_master
    - disclosure is preserved in richmedia blocks
    - prohibited pages are enforced by visual placement validator
```
