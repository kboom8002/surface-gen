# Agent System Overview

## 1. Purpose

The agent system is the automated factory that transforms project inputs into a validated AIHompy onboarding bundle for `wedding_sdm` brands.

It is designed as a multi-node, stateful, resumable graph rather than a single prompt or monolithic generation call.

---

## 2. System Components

```yaml
components:
  web_app:
    path: apps/web
    role:
      - project intake
      - upload management
      - job console
      - human review
      - asset editing
      - QA center
      - export center

  worker:
    path: apps/worker
    role:
      - run LangGraph
      - call models
      - validate outputs
      - persist artifacts
      - repair failures
      - package ZIP

  schemas:
    path: packages/schemas
    role:
      - Zod schemas
      - TypeScript types
      - structured output contracts

  validators:
    path: packages/validators
    role:
      - deterministic QA
      - path resolution checks
      - density checks
      - type checks
      - policy checks

  prompts:
    path: packages/prompts
    role:
      - prompt builders
      - node-specific instructions
      - model output contracts

  ssot:
    path: packages/ssot
    role:
      - allowed type registry
      - category mapping
      - density rules
      - canonical output file names
```

---

## 3. Design Goals

```yaml
goals:
  reliable_generation:
    description: Use staged generation and validation, not one-shot prompting.
  safe_public_content:
    description: Do not publish unsupported claims or rights-unclear images.
  cms_ready_output:
    description: Generate exact files required by the onboarding contract.
  searchable_content:
    description: Produce SEO/AEO/GEO semantic strategy artifacts.
  visual_semantic_quality:
    description: Treat photos as semantic, searchable, decision-supporting assets.
  human_review:
    description: Keep humans in the loop for claims, policies, rights, and final approval.
```

---

## 4. Agent Boundaries

The agent may:

```yaml
allowed:
  - extract facts from uploaded material
  - separate facts from assumptions
  - generate draft content
  - assign taxonomy metadata based on visible evidence
  - create structured JSON outputs
  - create review_required items
  - recommend content patches
  - package validated outputs
```

The agent must not:

```yaml
forbidden:
  - invent reviews
  - invent awards
  - invent exact prices
  - invent refund rules
  - infer private customer identities
  - claim AI visuals are real portfolio photos
  - bypass validation
  - export forbidden public UCA types
```

---

## 5. Runtime Flow

```text
Next.js API route
  -> validates request
  -> creates agent_jobs row
  -> enqueues worker job
  -> returns job_id

Worker
  -> loads job state
  -> runs LangGraph node
  -> persists node output
  -> validates output
  -> routes to next node, repair, human gate, or failure

Web UI
  -> displays realtime or polled job progress
  -> allows review and patching
  -> triggers export when gates pass
```

---

## 6. Model Use Philosophy

LLMs are used for reasoning, drafting, classification, and repair. Deterministic TypeScript code is used for validation, path checks, packaging, and security-sensitive decisions.

```yaml
model_usage:
  high_reasoning:
    use_for:
      - brand truth
      - knowledge graph
      - article finalization
      - complex repair
  batch_generation:
    use_for:
      - answers
      - captions
      - microcopy
  vision_reasoning:
    use_for:
      - visible fact extraction
      - photo taxonomy
      - docent QA
  deterministic_code:
    use_for:
      - schema validation
      - file path checks
      - relation resolution
      - ZIP manifest
```

---

## 7. Minimum MVP Graph

MVP graph may be a smaller vertical slice:

```yaml
mvp_graph:
  nodes:
    - intake_audit_node
    - brand_truth_node
    - gnb_ia_node
    - image_inventory_node
    - photo_taxonomy_node
    - ssot_materialization_node
    - validation_node
    - export_json_node
    - zip_packaging_node
```

This must still follow the same state, validation, and persistence rules.
