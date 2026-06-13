# Next App Routing Spec

## Purpose

Defines the Next.js App Router structure for the web application.

## Route Groups

```text
apps/web/app/
├── (auth)/
│   ├── login/
│   └── callback/
├── (dashboard)/
│   ├── page.tsx
│   ├── projects/
│   │   ├── new/
│   │   └── [projectId]/
│   │       ├── page.tsx
│   │       ├── intake/
│   │       ├── factory/
│   │       ├── assets/
│   │       ├── visuals/
│   │       ├── qa/
│   │       ├── export/
│   │       └── settings/
│   └── layout.tsx
├── api/
│   ├── projects/
│   ├── uploads/
│   ├── jobs/
│   ├── assets/
│   ├── qa/
│   └── export/
└── layout.tsx
```

## Public Routes

```yaml
public_routes:
  /login:
    purpose: "User login"
  /auth/callback:
    purpose: "Supabase auth callback"
```

## Protected Routes

```yaml
protected_routes:
  /:
    purpose: "Dashboard"
  /projects/new:
    purpose: "Create project"
  /projects/[projectId]:
    purpose: "Project overview"
  /projects/[projectId]/intake:
    purpose: "Upload and validate inputs"
  /projects/[projectId]/factory:
    purpose: "Run and monitor agent job"
  /projects/[projectId]/assets:
    purpose: "Inspect and edit generated UCA assets"
  /projects/[projectId]/visuals:
    purpose: "Inspect and edit photo taxonomy/docents"
  /projects/[projectId]/qa:
    purpose: "Review 12-Gate validation results"
  /projects/[projectId]/export:
    purpose: "Generate and download onboarding ZIP"
```

## Route Guarding

```yaml
route_guarding:
  middleware:
    - require authenticated session for dashboard routes
    - redirect unauthenticated users to /login
  server_components:
    - verify project access with Supabase RLS-backed query
  api_routes:
    - validate session
    - validate project access
    - never trust client-supplied tenant_id alone
```

## URL State

Use query parameters for filters and tabs that should be shareable.

```yaml
examples:
  /projects/:id/assets?type=answer&status=review_required
  /projects/:id/qa?gate=content_density&severity=error
  /projects/:id/visuals?album=studio_album_001&usage=hero
```

## Navigation Requirements

Each project page must show:

```yaml
project_nav:
  - Overview
  - Intake
  - Factory
  - Assets
  - Visuals
  - QA
  - Export
  - Settings
```

## API Route Pattern

Next.js route handlers should not execute long-running model workflows.

```yaml
correct_pattern:
  route_handler:
    - authenticate
    - validate request
    - create job row
    - enqueue worker
    - return job_id
  worker:
    - execute LangGraph
    - update job status
```
