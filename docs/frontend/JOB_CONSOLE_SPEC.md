# Job Console Spec

## Purpose

The Job Console allows operators to run, monitor, pause, resume, retry, and inspect LangGraph agent jobs.

## Core Concepts

```yaml
job_status:
  queued:
    description: "Job created but not yet started."
  running:
    description: "Worker is executing graph nodes."
  paused:
    description: "Job is paused, often for human review."
  waiting_for_review:
    description: "A human gate must be resolved."
  failed:
    description: "Job failed and cannot continue without action."
  completed:
    description: "Job completed successfully."
  canceled:
    description: "User canceled the job."
```

## Required UI Sections

```yaml
sections:
  job_header:
    shows:
      - job id
      - status
      - started at
      - duration
      - current node
  control_bar:
    actions:
      - start
      - pause
      - resume
      - retry failed node
      - cancel
  graph_timeline:
    shows:
      - node order
      - node status
      - retry count
      - duration
  current_node_panel:
    shows:
      - input summary
      - output summary
      - latest status
  logs_panel:
    shows:
      - timestamp
      - level
      - message
  human_gate_panel:
    shows:
      - pending review items
      - required decision
      - linked target asset
```

## Node Status

```yaml
node_status:
  pending:
  running:
  succeeded:
  failed:
  skipped:
  waiting_for_review:
  repaired:
```

## Actions

```yaml
actions:
  start_full_run:
    enabled_when:
      - project has minimum intake inputs
      - no active running job
  pause:
    enabled_when:
      - job.status == running
  resume:
    enabled_when:
      - job.status in [paused, waiting_for_review]
  retry_failed_node:
    enabled_when:
      - job.status == failed
      - failed node retry_count < max_retry
  cancel:
    enabled_when:
      - job.status in [queued, running, paused, waiting_for_review]
```

## Failure Presentation

Failures must show:

```yaml
failure_detail:
  - node name
  - failure type
  - human readable reason
  - affected files/assets
  - repair availability
  - next recommended action
```

## Realtime

The UI may use Supabase Realtime or polling.

```yaml
realtime_requirements:
  - job status updates within reasonable delay
  - node progress is visible
  - UI handles reconnect
  - stale status is indicated
```

## Acceptance Criteria

```yaml
accepted_when:
  - operator can start a job
  - current node is visible
  - completed/failed nodes are visible
  - human gate pauses are visible
  - retry action is available for supported failures
  - no long-running operation blocks the browser
```
