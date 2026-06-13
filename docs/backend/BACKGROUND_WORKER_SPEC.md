# Background Worker Specification

## 1. Purpose

The background worker runs long-running LangGraph agent jobs.

Next.js route handlers must not perform full agent generation because the workflow may include:

- large file parsing
- image analysis
- multiple model calls
- retries
- human-in-the-loop pauses
- QA validation
- JSON export
- ZIP packaging

## 2. Worker Responsibilities

```yaml
worker_responsibilities:
  - claim queued jobs
  - load project inputs
  - run LangGraph graph
  - call model providers through typed clients
  - validate structured outputs
  - persist intermediate artifacts
  - update agent job state
  - create human review items
  - run deterministic QA
  - execute repair loop
  - export JSON
  - package ZIP
```

## 3. Worker Non-Responsibilities

```yaml
worker_must_not:
  - render UI
  - serve browser requests directly
  - expose service role key
  - bypass validation for generated content
  - approve human review items automatically
```

## 4. Worker Process Model

MVP options:

```yaml
worker_runtime_options:
  node_process:
    recommended_for: MVP
    command: pnpm worker:dev

  serverless_job:
    recommended_for: small tasks only
    note: long jobs may exceed runtime limits

  container_worker:
    recommended_for: production
    note: run with queue polling and graceful shutdown
```

## 5. Job Claiming

Worker claims queued jobs safely:

```yaml
job_claim_flow:
  1: select queued job ordered by created_at
  2: update status to running with started_at
  3: set current_node to graph entry node
  4: create first agent_job_step
  5: run graph until completion, failure, or human pause
```

Recommended implementation:

- Use a Postgres function or transaction to claim a job.
- Avoid two workers running the same job.
- Store worker heartbeat in future production version.

## 6. LangGraph Integration

The worker hosts:

```yaml
langgraph_components:
  graph:
    - wedding_surface_factory_graph

  nodes:
    - intake_audit_node
    - brand_truth_node
    - semantic_strategy_node
    - knowledge_graph_node
    - gnb_ia_node
    - image_inventory_node
    - photo_taxonomy_node
    - photo_docent_node
    - visual_experience_node
    - portfolio_generation_node
    - catalog_generation_node
    - answer_generation_node
    - article_generation_node
    - about_contact_generation_node
    - copy_system_node
    - ai_visual_os_node
    - crosslink_schema_node
    - ssot_materialization_node
    - validation_node
    - repair_router_node
    - export_json_node
    - zip_packaging_node
```

## 7. State Persistence

After every node:

```yaml
persist_after_node:
  - update agent_jobs.state
  - update agent_jobs.current_node
  - insert/update agent_job_steps
  - save large artifacts to agent_artifacts or storage
  - save token usage if available
```

## 8. Human-in-the-loop Pauses

If a node detects critical uncertainty:

```yaml
pause_conditions:
  - public image rights unknown
  - exact price or refund policy unclear
  - unverified review/award/certification
  - AI visual public use requires approval
  - final export approval required
```

Worker behavior:

```yaml
on_human_pause:
  - create human_review_items
  - set job status to review_required
  - set current_node to waiting node
  - stop execution safely
```

Resume behavior:

```yaml
on_resume:
  - verify required review items resolved
  - reload state checkpoint
  - continue from paused node or next node
```

## 9. Error Handling

```yaml
error_handling:
  retryable:
    - provider timeout
    - transient storage error
    - invalid structured output repairable

  non_retryable:
    - missing required Brand Factsheet
    - no images
    - forbidden UCA type generated after repair attempts
    - project access violation

  max_retry_per_node: 2
```

## 10. Worker Environment Variables

```yaml
required_env:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - OPENAI_API_KEY
  - ANTHROPIC_API_KEY optional
  - WORKER_SECRET
```

## 11. Observability

Worker must log:

```yaml
worker_logs:
  - job claimed
  - node started
  - node completed
  - node failed
  - model call summary
  - validation failure summary
  - repair attempt
  - human review pause
  - export completed
```

Do not log secrets, raw private file content, or sensitive customer identity details unnecessarily.

## 12. Acceptance Criteria

```yaml
accepted_when:
  - worker can claim queued job
  - worker updates job status and steps
  - worker can run minimum graph vertical slice
  - worker persists state after each node
  - worker stops safely on human review
  - worker records failures clearly
  - worker does not run inside browser or Next.js long route
```
