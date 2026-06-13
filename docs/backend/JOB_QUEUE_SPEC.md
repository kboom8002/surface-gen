# Job Queue Specification

## 1. Purpose

This document defines the job queue design for running Wedding Surface Agent workflows.

The MVP queue may be Postgres-backed using `agent_jobs`, while production may later move to a dedicated queue system.

## 2. Job Types

```yaml
job_types:
  full_factory:
    description: "Run full E2E generation from intake to export-ready outputs."

  partial_regeneration:
    description: "Regenerate selected asset, photo metadata, or output file."

  qa_only:
    description: "Run deterministic QA without content generation."

  export_only:
    description: "Generate JSON or ZIP from already approved assets."
```

## 3. Job Statuses

```yaml
job_statuses:
  queued:
    meaning: "Created and waiting for worker."

  running:
    meaning: "Worker is executing the graph."

  paused:
    meaning: "Paused manually or by system."

  review_required:
    meaning: "Waiting for human review resolution."

  completed:
    meaning: "Job completed successfully."

  failed:
    meaning: "Job failed and cannot proceed without retry or intervention."

  cancelled:
    meaning: "User or system cancelled job."
```

## 4. Postgres-backed MVP Queue

MVP queue uses `agent_jobs`:

```sql
select *
from agent_jobs
where status = 'queued'
order by created_at asc
limit 1;
```

Then worker updates selected job to `running` inside a transaction.

Preferred future improvement:

- create `claim_next_agent_job()` Postgres function using `for update skip locked`

## 5. Claim Function Concept

```sql
create or replace function claim_next_agent_job()
returns agent_jobs
language plpgsql
security definer
as $$
declare
  job agent_jobs;
begin
  select * into job
  from agent_jobs
  where status = 'queued'
  order by created_at asc
  for update skip locked
  limit 1;

  if job.id is null then
    return null;
  end if;

  update agent_jobs
  set status = 'running', started_at = now(), updated_at = now()
  where id = job.id
  returning * into job;

  return job;
end;
$$;
```

## 6. Job Payload

```ts
type AgentJobPayload = {
  projectId: string;
  jobType: "full_factory" | "partial_regeneration" | "qa_only" | "export_only";
  options?: {
    startNode?: string;
    targetAssetIds?: string[];
    targetPhotoIds?: string[];
    gateIds?: string[];
    includeAdvancedOutputs?: boolean;
    requireQaPass?: boolean;
  };
};
```

## 7. Step Tracking

Every node execution creates or updates an `agent_job_steps` record.

```yaml
step_tracking:
  required_fields:
    - job_id
    - project_id
    - node_name
    - step_index
    - status
    - started_at
    - finished_at
    - error
    - token_usage
```

## 8. Retry Policy

```yaml
retry_policy:
  max_retry_per_node: 2
  retryable_errors:
    - transient_model_error
    - model_timeout
    - invalid_json_repairable
    - storage_temporary_failure
  non_retryable_errors:
    - missing_required_input
    - project_access_denied
    - no_public_images_available
    - critical_human_review_required
```

## 9. Concurrency Policy

MVP:

```yaml
mvp_concurrency:
  max_running_jobs_per_project: 1
  max_global_workers: configurable
```

Rules:

- Do not run two `full_factory` jobs for the same project simultaneously.
- Allow `qa_only` only if no full generation is running, unless read-only snapshot is implemented.
- Export should require stable project output state.

## 10. Cancellation

Cancellation behavior:

```yaml
cancel_behavior:
  queued:
    action: set status cancelled
  running:
    action: set cancellation_requested flag in state, worker checks between nodes
  review_required:
    action: set status cancelled if user has permission
```

MVP may implement cooperative cancellation only between nodes.

## 11. Progress Reporting

Progress can be derived from:

```yaml
progress_sources:
  - agent_jobs.current_node
  - agent_job_steps statuses
  - known total node count
  - qa gate count
```

Recommended response:

```ts
type JobProgress = {
  jobId: string;
  status: string;
  currentNode?: string;
  completedNodes: string[];
  failedNode?: string;
  progressPercent: number;
};
```

## 12. Acceptance Criteria

```yaml
accepted_when:
  - API can create queued job
  - worker can claim queued job
  - same project cannot run conflicting full jobs
  - step statuses are visible
  - failed jobs record error details
  - review_required jobs can resume after review
  - cancellation is safe between nodes
```
