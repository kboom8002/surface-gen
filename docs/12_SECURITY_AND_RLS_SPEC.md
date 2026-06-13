# 12. Security and RLS Specification

## 1. Purpose

This document defines security requirements and Supabase Row Level Security policies for the Wedding Surface Agent webapp.

The system handles:

- client brand documents
- wedding images, sometimes containing faces
- policy and pricing data
- generated public website copy
- AI outputs requiring review
- export ZIP packages

Security must be designed around privacy, tenant isolation, least privilege, and safe AI output handling.

## 2. Security Principles

```yaml
security_principles:
  least_privilege:
    meaning: "Users and workers get only the minimum access required."

  project_isolation:
    meaning: "Users can access only projects in organizations where they are members."

  private_by_default:
    meaning: "Source uploads, images, generated JSON, and ZIPs are private unless explicitly exposed."

  service_role_server_only:
    meaning: "Supabase service role key is never exposed to browser code."

  human_review_for_risky_publication:
    meaning: "Reviews, claims, pricing, policy, image rights, and AI visuals require explicit review states."

  safe_failure:
    meaning: "Failures should block export rather than publish unsafe assets."
```

## 3. Roles

```yaml
application_roles:
  owner:
    permissions:
      - manage organization
      - manage members
      - create projects
      - run jobs
      - approve final exports

  admin:
    permissions:
      - create projects
      - run jobs
      - review assets
      - export packages

  operator:
    permissions:
      - create and edit projects
      - upload files
      - run jobs
      - edit generated assets

  reviewer:
    permissions:
      - view projects
      - approve/reject human review items
      - edit review notes

  viewer:
    permissions:
      - view project and outputs
      - download approved exports if allowed
```

MVP may implement owner/operator only, but schema and RLS should support expansion.

## 4. Access Model

A user can access a project if:

```sql
exists (
  select 1
  from organization_members om
  join projects p on p.organization_id = om.organization_id
  where p.id = project_id
    and om.user_id = auth.uid()
)
```

All project-scoped tables must apply this rule.

## 5. RLS Policy Groups

### 5.1 profiles

Rules:

- Users can read their own profile.
- Users can update their own display metadata.
- Organization owners/admins may read member profiles through organization membership views if needed.

### 5.2 organizations

Rules:

- Members can read organizations they belong to.
- Owners can update organization metadata.
- Only owners can delete organizations.

### 5.3 organization_members

Rules:

- Members can read membership rows for their organizations.
- Owners/admins can invite or modify members.
- Users cannot self-escalate role.

### 5.4 projects

Rules:

- Organization members can read projects.
- Owner/admin/operator can create projects.
- Owner/admin/operator can update projects.
- Delete may be owner/admin only.

### 5.5 source_files and source_images

Rules:

- Members can read source records for accessible projects.
- Owner/admin/operator can upload/update.
- Viewer cannot mutate.
- Physical storage access still requires signed URL or storage policy.

### 5.6 agent_jobs and agent_job_steps

Rules:

- Members can read job status for accessible projects.
- Owner/admin/operator can create jobs.
- Worker service role can update job states.
- Browser clients cannot directly mutate step outputs.

### 5.7 generated_assets

Rules:

- Members can read assets.
- Owner/admin/operator can edit draft/review_required assets.
- Reviewer can update review_status and review notes where supported.
- Worker service role can insert/update generated assets.

### 5.8 QA and review tables

Rules:

- Members can read QA reports.
- Worker service role can insert QA results.
- Reviewers and above can update human review items.

### 5.9 export_packages

Rules:

- Members can read package metadata.
- Owner/admin/operator can request export.
- Downloads require access check and signed URL.

## 6. Service Role Boundaries

The service role key may be used only in:

```yaml
allowed_service_role_contexts:
  - apps/worker
  - server-only export services
  - Supabase Edge Functions where explicitly required
  - admin maintenance scripts
```

The service role key must never be used in:

```yaml
forbidden_service_role_contexts:
  - React components
  - browser bundles
  - client-side hooks
  - public environment variables
```

## 7. Storage Security

### 7.1 Private buckets

The following buckets are private by default:

```yaml
private_buckets:
  - source-uploads
  - source-images
  - generated-json
  - generated-zips
  - qa-reports
```

### 7.2 Conditional buckets

```yaml
conditional_buckets:
  normalized-images:
    default: private
    public_allowed_only_after: rights approved and export policy allows

  ai-visuals:
    default: private
    public_allowed_only_after: disclosure and QA pass
```

### 7.3 Signed URL rules

```yaml
signed_url_rules:
  - generated server-side only
  - require project access check
  - short expiration
  - no wildcard public access for private sources
```

## 8. Upload Security

```yaml
upload_security:
  validate:
    - file extension
    - MIME type
    - size limit
    - project access
  sanitize:
    - file name
    - path components
  reject:
    - executable files
    - path traversal strings
    - unsupported MIME types
```

## 9. AI Output Security

LLM output may include unsafe or unsupported claims. Therefore:

```yaml
ai_output_security:
  - do not persist raw model output as approved public content
  - validate structured output with Zod
  - run deterministic QA
  - mark missing-proof claims as review_required
  - block unsupported reviews, awards, certifications, partnerships
  - require AI visual disclosure metadata
```

## 10. Human Review Blockers

Export must be blocked when any critical open review item exists:

```yaml
critical_review_blockers:
  - image_rights with public_use_unknown
  - fake_or_unverified_review
  - unsupported_award_or_certification
  - exact_price_policy_unconfirmed
  - refund_policy_unconfirmed
  - AI_visual_public_use_without_disclosure
  - final_publish_not_approved
```

## 11. Environment Variables

```yaml
server_only_env:
  - SUPABASE_SERVICE_ROLE_KEY
  - OPENAI_API_KEY
  - ANTHROPIC_API_KEY
  - WORKER_SECRET

public_env:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Never expose server-only variables to client bundles.

## 12. Audit Logging

MVP should log:

```yaml
audit_events:
  - project created
  - file uploaded
  - image rights changed
  - agent job started
  - human review approved/rejected
  - export generated
  - export downloaded
```

This may be implemented as a future `audit_logs` table if not in MVP.

## 13. RLS Acceptance Criteria

RLS is accepted when:

```yaml
accepted_when:
  - RLS enabled on all user-facing tables
  - unauthenticated users cannot read project data
  - users cannot read projects outside their organization
  - users cannot mutate job steps directly
  - browser cannot access service-role operations
  - storage signed URLs require project access
  - tests verify cross-organization isolation
```
