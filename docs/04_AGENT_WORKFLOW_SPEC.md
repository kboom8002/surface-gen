# 04. Agent Workflow Spec

## 1. Purpose

This document defines the canonical agent workflow for the Wedding Surface Agent repository.

The agent workflow converts a `wedding_sdm` project from raw intake inputs into a validated AIHompy onboarding bundle. The workflow must be stateful, resumable, validated, and safe by default.

The workflow is implemented as a LangGraph graph in `apps/worker`, not as a long-running Next.js route handler.

---

## 2. Workflow Principles

```yaml
principles:
  stateful:
    description: Every node reads and writes a typed state patch.
  checkpointed:
    description: Long-running jobs can resume from the last successful node.
  validation_first:
    description: Every generated artifact is schema-validated before persistence as production data.
  human_review_aware:
    description: Claims, policy facts, image rights, reviews, and AI visual publication may require human approval.
  repairable:
    description: Recoverable failures route to deterministic or LLM repair nodes.
  export_safe:
    description: ZIP export occurs only after required gates pass or unresolved risks are explicitly marked.
```

---

## 3. Main Graph

```yaml
main_graph:
  name: wedding_surface_factory_graph
  state_schema: FactoryJobState
  execution_runtime: apps/worker
  persistence:
    primary: agent_jobs.state
    step_log: agent_job_steps
    artifacts: generated_assets and generated_json_files
```

### Canonical node order

```yaml
nodes:
  - intake_audit_node
  - brand_truth_node
  - semantic_strategy_node
  - knowledge_graph_node
  - claim_proof_boundary_node
  - gnb_ia_node
  - schema_target_node
  - image_inventory_node
  - photo_taxonomy_node
  - photo_docent_node
  - visual_experience_node
  - gallery_portfolio_node
  - catalog_policy_node
  - answer_generation_node
  - article_generation_node
  - about_evidence_node
  - contact_cta_node
  - copy_system_node
  - ai_visual_os_node
  - crosslink_node
  - schema_readiness_node
  - ssot_materialization_node
  - validation_node
  - repair_router_node
  - export_json_node
  - zip_packaging_node
  - final_report_node
```

---

## 4. Node Categories

```yaml
node_categories:
  intake:
    - intake_audit_node
  truth_and_strategy:
    - brand_truth_node
    - semantic_strategy_node
    - knowledge_graph_node
    - claim_proof_boundary_node
  surface_architecture:
    - gnb_ia_node
    - schema_target_node
  visual_semantics:
    - image_inventory_node
    - photo_taxonomy_node
    - photo_docent_node
    - visual_experience_node
  content_generation:
    - gallery_portfolio_node
    - catalog_policy_node
    - answer_generation_node
    - article_generation_node
    - about_evidence_node
    - contact_cta_node
  experience_finish:
    - copy_system_node
    - ai_visual_os_node
    - crosslink_node
    - schema_readiness_node
  materialization:
    - ssot_materialization_node
    - export_json_node
    - zip_packaging_node
  quality:
    - validation_node
    - repair_router_node
    - final_report_node
```

---

## 5. State Patch Rule

Each node must return a partial state patch, never a completely unrelated object.

```ts
export type AgentNodeResult<TPatch> = {
  patch: TPatch;
  qa?: GateResult[];
  reviewItems?: HumanReviewItem[];
  warnings?: FactoryWarning[];
};
```

A node must not silently mutate job state outside the graph runtime.

---

## 6. Persistence Rule

```yaml
persistence_rule:
  raw_model_output:
    allowed_storage: debug logs only
    production_use: forbidden
  validated_output:
    required_before_persistence:
      - structured output parse
      - Zod validation
      - deterministic validation when available
  generated_assets:
    storage: generated_assets table
  generated_json_files:
    storage: generated_json_files table and Supabase Storage
```

---

## 7. Failure Handling

```yaml
failure_types:
  recoverable:
    - invalid_json
    - zod_schema_failure
    - missing_required_field
    - body_density_failure
    - unresolved_relation
    - incomplete_gallery_photo_metadata
  human_required:
    - unverified_review
    - ambiguous_price_policy
    - public_image_rights_unknown
    - ai_visual_public_use_unapproved
  fatal:
    - missing_project
    - missing_required_input
    - impossible_schema_state
    - storage_write_failure_after_retry
```

Recoverable failures route to the repair router. Human-required failures create review items and may pause the graph depending on severity. Fatal failures stop the job.

---

## 8. Human Gate Policy

Human gates may be blocking or non-blocking.

```yaml
human_gates:
  claim_review_gate:
    blocking: true
    condition: unsupported public claim detected
  policy_review_gate:
    blocking: true
    condition: exact pricing, refund, delivery, or cancellation terms are unclear
  image_rights_review_gate:
    blocking: true
    condition: public image rights are unknown
  ai_visual_public_use_gate:
    blocking: true
    condition: AI visual is intended for public website use
  final_approval_gate:
    blocking: true
    condition: before final ZIP export in production mode
```

MVP may allow draft export when unresolved items are marked `review_required`, but public-ready export must block on critical unresolved items.

---

## 9. Output Contract

The graph must ultimately produce the canonical eight upload files:

```text
01_upload/universal_content_assets_final.json
01_upload/brand_profiles.json
01_upload/design_config.json
01_upload/gnb_ia_config.json
01_upload/gallery_albums.json
01_upload/gallery_photos.json
01_upload/album_taxonomy_nodes.json
01_upload/visual_asset_url_map_master.json
```

Advanced outputs must be written under their own folders and must not create competing UCA files outside `01_upload`.

---

## 10. Verification

Every graph run must produce a final report containing:

```yaml
final_report:
  project_id:
  job_id:
  completed_nodes:
  failed_nodes:
  generated_outputs:
  gate_results:
  human_review_items:
  package_status:
  export_paths:
```

---

# Handoff Import Workflow Extension

The LangGraph workflow must support handoff import routing.

New nodes:

```yaml
handoff_import_router_node:
  purpose: "Route to internal analysis or imported handoff path."

image_analysis_handoff_import_node:
  purpose: "Validate external photo semantic manifest and persist accepted records."

ai_visual_prompt_export_node:
  purpose: "Generate prompt-only AI visual package for external generation."

ai_visual_result_import_node:
  purpose: "Validate externally generated AI visual files and metadata."
```

Graph behavior:

```yaml
if external_image_analysis_import_exists:
  skip_internal_full_image_analysis: true
  use_imported_photo_semantic_manifest: true

if ai_visual_prompt_only_mode:
  generate_prompt_package: true
  pause_status: waiting_for_ai_visual_generation
  resume_after: ai_visual_result_import_node
```
