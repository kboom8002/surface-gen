# 08. Frontend UX Spec

## Purpose

This document defines the frontend experience for the Wedding Surface Agent web app. The frontend must help operators create a project, upload factsheets and images, run the agent factory, review outputs, fix QA issues, and export a CMS-ready onboarding ZIP.

The product is not a generic chat interface. It is a controlled production console for generating validated wedding brand surface assets.

## UX Principles

```yaml
principles:
  guided_workflow:
    meaning: "Operators should always know the next step."
  validation_visible:
    meaning: "Input readiness, job status, QA gates, and review blockers must be visible."
  evidence_first:
    meaning: "Claims, reviews, policies, and image rights must show evidence/review state."
  image_semantic_core:
    meaning: "Photos are not just uploads. They are searchable, taggable, reusable semantic assets."
  repairable_outputs:
    meaning: "Every failure should expose a reason and a repair action where possible."
  export_confidence:
    meaning: "The operator should understand why the ZIP is ready or blocked."
```

## Primary User Roles

```yaml
roles:
  admin:
    permissions:
      - manage organization
      - manage all projects
      - run exports
      - approve final packages
  operator:
    permissions:
      - create projects
      - upload inputs
      - run jobs
      - edit generated assets
      - request reviews
  reviewer:
    permissions:
      - approve or reject human review items
      - edit review notes
      - approve public image/AI visual use
  client_viewer:
    permissions:
      - view selected project outputs
      - comment on review items
      - no export by default
```

## Main Workflow

```text
Dashboard
  -> New Project
  -> Intake Upload
  -> Input Readiness
  -> Factory Run Console
  -> Human Review Queue
  -> Asset Editor
  -> Visual Semantic Editor
  -> QA Center
  -> Export Center
```

## Global Layout

```yaml
global_layout:
  top_bar:
    elements:
      - project switcher
      - global status
      - user menu
  left_sidebar:
    elements:
      - Dashboard
      - Intake
      - Factory
      - Assets
      - Visuals
      - QA
      - Export
      - Settings
  main_panel:
    purpose: "Task-specific workspace"
  right_panel_optional:
    purpose: "Context, QA hints, selected item details"
```

## Project Status Model

```yaml
project_status:
  draft:
    description: "Project created but inputs are incomplete."
  intake_ready:
    description: "Minimum factsheet and images are present."
  generating:
    description: "Agent job is running."
  review_required:
    description: "Human review blockers exist."
  qa_failed:
    description: "One or more required gates failed."
  export_ready:
    description: "Required files and gates pass."
  exported:
    description: "ZIP package was generated."
```

## UX State Requirements

Every page must support:

```yaml
page_states:
  loading:
    required: true
  empty:
    required: true
  error:
    required: true
  unauthorized:
    required: true
  success:
    required: true
```

## Accessibility

```yaml
accessibility:
  keyboard_navigation: required
  visible_focus: required
  aria_labels_for_icon_buttons: required
  contrast_safe_status_colors: required
  image_alt_in_review_grid: required
  form_errors_associated_with_inputs: required
```

## UX Copy Rules

- Use concise Korean UI copy by default.
- Avoid vague status such as "처리 중" without context.
- Prefer actionable copy: "이미지 권리 상태를 확인하세요".
- Failure messages must identify the failed gate and next action.
- Do not expose internal prompt text in the UI.

## Critical Frontend Acceptance

```yaml
accepted_when:
  - operator can complete intake without reading developer docs
  - job status and current node are visible
  - QA failures are grouped by severity and gate
  - review_required items are easy to approve/reject
  - export center clearly shows ready/blocked state
```

---

# Handoff Import UI Extension

The frontend must expose handoff import options.

New screens:

```yaml
screens:
  image_analysis_handoff_import:
    route: /projects/[id]/handoff/image-analysis

  ai_visual_prompt_export:
    route: /projects/[id]/handoff/ai-visual-prompts

  ai_visual_result_import:
    route: /projects/[id]/handoff/ai-visual-results

  handoff_validation_center:
    route: /projects/[id]/handoff/validation
```

The UI must clearly distinguish actual photos from AI-generated guide visuals.
