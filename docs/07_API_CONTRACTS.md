# 07. API Contracts

## 1. Purpose

This document defines the HTTP API contract for the Next.js application.

The API layer must:

- authenticate users
- enforce project access
- validate request bodies with Zod
- create and read projects
- handle uploads
- enqueue agent jobs
- expose job progress
- read and update generated assets
- run QA and export packages

Long-running generation must be performed by the worker, not inside route handlers.

## 2. API Principles

```yaml
api_principles:
  auth_first:
    meaning: "Every project-scoped endpoint requires an authenticated user."

  validate_all_inputs:
    meaning: "Every request body and query parameter must be Zod-validated."

  route_handlers_enqueue:
    meaning: "Route handlers start jobs but do not perform long model calls."

  typed_responses:
    meaning: "Every endpoint has a typed response contract."

  safe_failures:
    meaning: "Errors return clear messages and do not leak secrets."
```

## 3. Common Response Types

### 3.1 Success envelope

```ts
export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};
```

### 3.2 Error envelope

```ts
export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

## 4. Project Endpoints

### POST `/api/projects`

Creates a new project.

Request:

```ts
type CreateProjectRequest = {
  officialBrandName: string;
  tenantSlug: string;
  organizationId?: string;
};
```

Response:

```ts
type CreateProjectResponse = {
  projectId: string;
  tenantSlug: string;
  officialBrandName: string;
  industryType: "wedding_sdm";
  status: "draft";
};
```

Validation:

- `officialBrandName` required
- `tenantSlug` lowercase slug
- `industryType` fixed as `wedding_sdm`

### GET `/api/projects`

Lists projects visible to the user.

Query:

```ts
type ListProjectsQuery = {
  status?: string;
  limit?: number;
  cursor?: string;
};
```

### GET `/api/projects/:projectId`

Returns project detail.

### PATCH `/api/projects/:projectId`

Updates editable project metadata.

Request:

```ts
type UpdateProjectRequest = {
  officialBrandName?: string;
  status?: "draft" | "intake_ready" | "review_required" | "export_ready" | "blocked";
  settings?: Record<string, unknown>;
};
```

## 5. Upload Endpoints

### POST `/api/projects/:projectId/files`

Uploads Brand Factsheet, policy, evidence, or reference files.

Form fields:

```yaml
multipart_fields:
  file: File
  fileType: brand_factsheet | package_policy | evidence | reference | other
```

Response:

```ts
type UploadFileResponse = {
  sourceFileId: string;
  fileName: string;
  storagePath: string;
  fileType: string;
  parseStatus: "pending" | "parsed" | "failed" | "skipped";
};
```

### POST `/api/projects/:projectId/images`

Uploads a single source image.

Form fields:

```yaml
multipart_fields:
  file: File
  rightsStatus: approved | review_required | restricted | rejected | unknown
  consentStatus: approved | review_required | restricted | unknown
  containsFace: boolean optional
  containsLogo: boolean optional
  containsCustomerName: boolean optional
```

### POST `/api/projects/:projectId/images/batch`

Uploads multiple source images.

Response:

```ts
type BatchUploadImagesResponse = {
  uploaded: Array<{
    sourceImageId: string;
    originalFileName: string;
    storagePath: string;
  }>;
  failed: Array<{
    originalFileName: string;
    reason: string;
  }>;
};
```

### PATCH `/api/projects/:projectId/images/:imageId/rights`

Updates image rights metadata.

Request:

```ts
type UpdateImageRightsRequest = {
  rightsStatus?: "approved" | "review_required" | "restricted" | "rejected" | "unknown";
  consentStatus?: "approved" | "review_required" | "restricted" | "unknown";
  publicUseAllowed?: boolean;
  containsFace?: boolean;
  containsLogo?: boolean;
  containsCustomerName?: boolean;
};
```

## 6. Agent Job Endpoints

### POST `/api/projects/:projectId/jobs/run`

Creates and enqueues an agent job.

Request:

```ts
type RunAgentJobRequest = {
  jobType: "full_factory" | "partial_regeneration" | "qa_only" | "export_only";
  options?: {
    startNode?: string;
    targetAssetIds?: string[];
    skipHumanReview?: boolean;
    maxImages?: number;
  };
};
```

Response:

```ts
type RunAgentJobResponse = {
  jobId: string;
  status: "queued";
};
```

Rules:

- The route handler creates the job and enqueues worker execution.
- It must not run LangGraph inline.

### GET `/api/jobs/:jobId`

Returns job status and current node.

Response:

```ts
type GetJobResponse = {
  jobId: string;
  projectId: string;
  jobType: string;
  status: string;
  currentNode?: string;
  completedNodes: string[];
  failedNode?: string;
  error?: unknown;
  startedAt?: string;
  finishedAt?: string;
};
```

### GET `/api/jobs/:jobId/steps`

Returns step-level execution trace.

### POST `/api/jobs/:jobId/pause`

Pauses a running or queued job if supported.

### POST `/api/jobs/:jobId/resume`

Resumes a paused or human-review job.

### POST `/api/jobs/:jobId/retry`

Retries a failed job or failed node.

Request:

```ts
type RetryJobRequest = {
  fromNode?: string;
  repairMode?: "auto" | "manual_patch" | "rerun_node";
};
```

## 7. Asset Endpoints

### GET `/api/projects/:projectId/assets`

Query:

```ts
type ListAssetsQuery = {
  type?: string;
  category?: string;
  reviewStatus?: string;
  qaStatus?: string;
  limit?: number;
  cursor?: string;
};
```

### GET `/api/projects/:projectId/assets/:assetId`

Returns one generated asset.

### PATCH `/api/projects/:projectId/assets/:assetId`

Updates editable generated asset fields.

Request:

```ts
type UpdateAssetRequest = {
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  bodyRichtext?: string;
  status?: "active" | "draft" | "suspended" | "archived";
  reviewStatus?: "approved" | "review_required" | "rejected" | "internal_only";
  jsonPayload?: Record<string, unknown>;
  relations?: Record<string, unknown>;
  seo?: Record<string, unknown>;
};
```

### POST `/api/projects/:projectId/assets/:assetId/regenerate`

Creates a partial regeneration job for one asset.

## 8. Visual Endpoints

### GET `/api/projects/:projectId/photos`

Lists gallery photos and taxonomy metadata.

### PATCH `/api/projects/:projectId/photos/:photoId`

Updates photo metadata, copy, rights, or usage role.

Request:

```ts
type UpdatePhotoRequest = {
  taxonomy?: Record<string, unknown>;
  copy?: {
    alt?: string;
    caption?: string;
    sceneNote?: string;
    styleNote?: string;
    recommendedFor?: string;
  };
  usageRole?: string;
  reviewStatus?: string;
};
```

### GET `/api/projects/:projectId/visual-assets`

Lists actual and AI visual asset records.

## 9. QA Endpoints

### POST `/api/projects/:projectId/qa/run`

Runs deterministic QA.

Request:

```ts
type RunQaRequest = {
  scope: "all" | "assets" | "photos" | "export" | "schema";
  gateIds?: string[];
};
```

### GET `/api/projects/:projectId/qa`

Returns latest QA reports and gate results.

### POST `/api/projects/:projectId/qa/repair`

Starts repair job for selected QA failures.

Request:

```ts
type RepairQaRequest = {
  gateResultIds: string[];
  mode: "auto" | "draft_patch";
};
```

## 10. Human Review Endpoints

### GET `/api/projects/:projectId/review-items`

Lists open review items.

### PATCH `/api/projects/:projectId/review-items/:reviewItemId`

Request:

```ts
type UpdateReviewItemRequest = {
  status: "approved" | "rejected" | "resolved" | "deferred";
  resolutionNote?: string;
};
```

## 11. Export Endpoints

### POST `/api/projects/:projectId/export/json`

Generates required JSON files and stores them.

Request:

```ts
type ExportJsonRequest = {
  includeAdvancedOutputs?: boolean;
  runPreflightQa?: boolean;
};
```

Response:

```ts
type ExportJsonResponse = {
  files: Array<{
    fileName: string;
    fileGroup: string;
    storagePath: string;
    sha256: string;
  }>;
};
```

### POST `/api/projects/:projectId/export/zip`

Generates final onboarding ZIP.

Request:

```ts
type ExportZipRequest = {
  includeAdvancedOutputs: boolean;
  requireQaPass: boolean;
};
```

Response:

```ts
type ExportZipResponse = {
  exportPackageId: string;
  packageName: string;
  storagePath: string;
  sha256: string;
  status: "generated";
};
```

### GET `/api/projects/:projectId/export/:exportPackageId/download`

Returns a signed URL or streams the ZIP, after access check.

## 12. Error Codes

```yaml
error_codes:
  UNAUTHORIZED: "User is not authenticated."
  FORBIDDEN: "User cannot access this project."
  NOT_FOUND: "Requested resource not found."
  VALIDATION_ERROR: "Request body or query failed validation."
  PROJECT_NOT_READY: "Project does not meet readiness requirements."
  JOB_ALREADY_RUNNING: "A conflicting job is already running."
  QA_BLOCKED: "Export blocked by QA failures."
  HUMAN_REVIEW_REQUIRED: "Critical review items are still open."
  STORAGE_ERROR: "File storage operation failed."
  EXPORT_ERROR: "Export generation failed."
```

## 13. Route Handler Rules

Every route handler must:

```yaml
route_handler_required_steps:
  - create Supabase server client
  - get authenticated user
  - validate params
  - validate body/query
  - check project access when project scoped
  - perform small bounded operation
  - return typed envelope
```

Never:

```yaml
route_handler_never:
  - run long LangGraph job inline
  - expose service role to browser
  - accept unvalidated JSON
  - return raw stack traces
  - write unvalidated LLM output as approved data
```

## 14. Acceptance Criteria

This API contract is implemented when:

```yaml
accepted_when:
  - project CRUD works
  - upload endpoints store files in scoped paths
  - job run endpoint enqueues worker job
  - job status endpoints expose progress
  - assets can be listed and updated
  - QA endpoints run deterministic validators
  - export endpoints generate JSON and ZIP
  - all endpoints validate input
  - all project endpoints enforce access control
```

---

# Handoff API Extension

Add these API contracts.

```yaml
handoff_routes:
  - POST /api/projects/:projectId/handoff/uploads
  - POST /api/projects/:projectId/handoff/:uploadId/validate
  - POST /api/projects/:projectId/handoff/:uploadId/accept
  - POST /api/projects/:projectId/handoff/:uploadId/reject
  - POST /api/projects/:projectId/handoff/ai-visual-prompts/export
```

The route handler must enqueue heavy validation if the package is large. Do not perform long-running zip extraction, image inspection, or model calls inside the request lifecycle.
