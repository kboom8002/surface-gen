# Component Inventory

## Purpose

Defines reusable frontend components. Components should be small, typed, accessible, and composable.

## Layout Components

```yaml
layout_components:
  AppShell:
    responsibility: "Top-level dashboard shell"
  ProjectSidebar:
    responsibility: "Project section navigation"
  StatusBadge:
    responsibility: "Consistent status display"
  EmptyState:
    responsibility: "No data guidance"
  ErrorState:
    responsibility: "Recoverable error display"
  LoadingPanel:
    responsibility: "Async loading state"
```

## Project Components

```yaml
project_components:
  ProjectCard:
    props:
      - project
      - latestJob
      - qaSummary
  ProjectStatusPill:
    props:
      - status
  NextActionCard:
    props:
      - actionLabel
      - description
      - href
```

## Upload Components

```yaml
upload_components:
  FactsheetUploader:
    responsibility: "Upload and display Brand Factsheet"
  ImageBatchUploader:
    responsibility: "Upload 20-100 images"
  UploadProgressList:
    responsibility: "Display per-file upload progress"
  RightsBulkEditor:
    responsibility: "Apply rights metadata to selected images"
  ImageUploadGrid:
    responsibility: "Preview uploaded images"
```

## Job Components

```yaml
job_components:
  JobTimeline:
    responsibility: "Show LangGraph node progress"
  JobNodeCard:
    responsibility: "Display individual node status"
  JobLogPanel:
    responsibility: "Display recent job logs"
  JobControlBar:
    actions:
      - start
      - pause
      - resume
      - retry
  HumanGateBanner:
    responsibility: "Alert when human review is required"
```

## Asset Components

```yaml
asset_components:
  AssetTable:
    responsibility: "Filtered UCA list"
  AssetTypeFilter:
    responsibility: "Filter by UCA type"
  AssetDetailDrawer:
    responsibility: "Inspect selected asset"
  RichTextPreview:
    responsibility: "Render generated body_richtext safely"
  JsonPayloadViewer:
    responsibility: "Pretty JSON display"
  RelationResolverPanel:
    responsibility: "Show linked assets and broken relations"
  SeoFieldsEditor:
    responsibility: "Edit seo_title and meta_description"
```

## Visual Components

```yaml
visual_components:
  AlbumSidebar:
    responsibility: "List albums and photo counts"
  PhotoGrid:
    responsibility: "Display uploaded/generated photo records"
  PhotoCard:
    responsibility: "Photo preview and status badges"
  PhotoTaxonomyEditor:
    responsibility: "Edit scene, subject, mood, style, composition, vibe vector"
  PhotoDocentEditor:
    responsibility: "Edit alt/caption/scene_note/style_note/recommended_for"
  RightsStatusBadge:
    responsibility: "Display photo rights state"
  UsageRoleSelector:
    responsibility: "Assign usage role"
```

## QA Components

```yaml
qa_components:
  GateSummaryGrid:
    responsibility: "Show 12-Gate status"
  GateResultCard:
    responsibility: "One gate status and counts"
  QaIssueList:
    responsibility: "Issues filtered by severity/gate"
  QaIssueDetail:
    responsibility: "Explain issue and repair option"
  RepairActionButton:
    responsibility: "Trigger repair workflow"
```

## Export Components

```yaml
export_components:
  ExportReadinessChecklist:
    responsibility: "Show required files and blockers"
  FileManifestTable:
    responsibility: "Display generated files and hashes"
  ZipGenerationPanel:
    responsibility: "Generate and download ZIP"
  RequiredJsonChecklist:
    responsibility: "Show status of the required 8 JSON files"
```

## Component Rules

```yaml
rules:
  - Components must not call privileged Supabase APIs directly from the browser.
  - Components must receive typed props.
  - Components must expose loading, empty, and error states where applicable.
  - Generated HTML/richtext must be sanitized before rendering.
  - Icon-only buttons require aria-label.
```
