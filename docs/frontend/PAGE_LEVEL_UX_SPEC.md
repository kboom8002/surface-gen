# Page Level UX Spec

## Dashboard

### Goal
Show all projects, current statuses, and work that needs attention.

### Required Sections

```yaml
dashboard_sections:
  project_list:
    columns:
      - brand name
      - tenant slug
      - status
      - last job status
      - unresolved review count
      - export readiness
      - updated at
  quick_actions:
    - create project
    - continue latest project
  alerts:
    - failed jobs
    - blocked exports
    - review_required items
```

## New Project Page

### Required Fields

```yaml
fields:
  official_brand_name:
    required: true
  tenant_slug:
    required: true
  industry_type:
    default: wedding_sdm
    locked_in_mvp: true
```

### Acceptance

```yaml
accepted_when:
  - tenant_slug is normalized
  - duplicate slug is blocked
  - project row is created
  - user is redirected to intake
```

## Project Overview

### Goal
Summarize project state and next best action.

```yaml
sections:
  readiness_card:
    shows:
      - factsheet status
      - image count
      - rights coverage
      - latest job status
  output_summary:
    shows:
      - UCA count
      - gallery photo count
      - QA pass/fail
      - export status
  next_action:
    examples:
      - Upload Brand Factsheet
      - Add at least 20 images
      - Run input audit
      - Resolve review blockers
      - Export ZIP
```

## Intake Page

### Goal
Collect Brand Factsheet, policy files, evidence files, and images.

```yaml
sections:
  factsheet_upload:
    accepted_file_types:
      - md
      - txt
      - docx
      - pdf
      - json
  service_policy_upload:
    optional: true
  evidence_upload:
    optional: true
  image_upload:
    minimum_count: 20
    recommended_count: 50
  rights_bulk_editor:
    fields:
      - public_use_status
      - contains_face
      - consent_status
      - rights_note
  readiness_panel:
    shows:
      - readiness score
      - missing critical fields
      - risk items
```

## Factory Page

### Goal
Run and monitor the agent job.

```yaml
sections:
  job_control:
    actions:
      - start full run
      - pause
      - resume
      - retry failed step
  graph_timeline:
    shows:
      - node name
      - status
      - started_at
      - duration
      - retry count
  current_step_panel:
    shows:
      - current node
      - progress
      - latest log
  human_gate_panel:
    shows:
      - pending review requests
```

## Assets Page

### Goal
Inspect, filter, edit, and regenerate generated SSoT assets.

```yaml
features:
  filters:
    - type
    - category
    - status
    - review_status
    - qa_status
  table_columns:
    - type
    - title
    - category
    - status
    - review_status
    - density
    - relation count
  detail_panel:
    tabs:
      - content
      - json_payload
      - relations
      - SEO
      - QA
  actions:
    - edit
    - save draft
    - regenerate
    - mark review_required
    - approve
```

## Visuals Page

### Goal
Manage photo taxonomy, rights, docents, and usage roles.

```yaml
features:
  album_sidebar:
    shows:
      - album id
      - photo count
      - cover photo
  photo_grid:
    badges:
      - rights status
      - review status
      - usage role
      - confidence
  photo_detail:
    tabs:
      - metadata
      - taxonomy
      - copy
      - usage
      - rights
  bulk_actions:
    - set rights status
    - assign album
    - set usage role
    - request review
```

## QA Page

### Goal
Expose validation results and repair options.

```yaml
features:
  gate_summary:
    shows:
      - pass
      - warning
      - fail
      - blocked
  issue_list:
    filters:
      - gate
      - severity
      - auto_repair_available
      - human_review_required
  issue_detail:
    shows:
      - failure reason
      - affected asset
      - recommended fix
      - repair action
```

## Export Page

### Goal
Generate and download onboarding ZIP only when safe.

```yaml
sections:
  readiness_checklist:
    includes:
      - required 8 JSON present
      - images resolve
      - manifests generated
      - critical QA pass
      - human blockers resolved
  export_actions:
    - generate json files
    - generate ZIP
    - download ZIP
  final_manifest:
    shows:
      - file list
      - sha256
      - generated_at
```
