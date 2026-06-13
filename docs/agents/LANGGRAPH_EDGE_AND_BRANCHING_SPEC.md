# LangGraph Edge and Branching Spec

## 1. Purpose

This document defines graph transitions, branches, and stop conditions.

The graph must be predictable and auditable. Branching must be based on explicit state and QA results, not hidden model judgment.

---

## 2. Main Happy Path

```text
intake_audit_node
  -> brand_truth_node
  -> semantic_strategy_node
  -> knowledge_graph_node
  -> claim_proof_boundary_node
  -> gnb_ia_node
  -> schema_target_node
  -> image_inventory_node
  -> photo_taxonomy_node
  -> photo_docent_node
  -> visual_experience_node
  -> gallery_portfolio_node
  -> catalog_policy_node
  -> answer_generation_node
  -> article_generation_node
  -> about_evidence_node
  -> contact_cta_node
  -> copy_system_node
  -> ai_visual_os_node
  -> crosslink_node
  -> schema_readiness_node
  -> ssot_materialization_node
  -> validation_node
  -> export_json_node
  -> zip_packaging_node
  -> final_report_node
```

---

## 3. Branch Types

```yaml
branch_types:
  continue:
    description: Node succeeded and next canonical node runs.
  repair:
    description: Validation failed but issue is machine-repairable.
  human_review:
    description: Issue requires human review before public-ready export.
  skip_optional:
    description: Optional node skipped due to missing optional inputs.
  fail:
    description: Fatal issue blocks job.
  pause:
    description: Graph pauses until human action or external state changes.
```

---

## 4. Branch Conditions

### 4.1 Intake Branches

```yaml
intake_audit_node:
  continue_if:
    - brand factsheet exists
    - image count >= minimum for selected mode
  pause_if:
    - image rights status missing and mode is production
  fail_if:
    - no factsheet and no usable text input
```

### 4.2 Brand Truth Branches

```yaml
brand_truth_node:
  continue_if:
    - brandTruthSheet is valid
  human_review_if:
    - unsupported public claims detected
    - exact commercial policy unclear
  repair_if:
    - output schema invalid
```

### 4.3 Image Branches

```yaml
image_inventory_node:
  continue_if:
    - photo IDs assigned
    - image paths resolvable
  repair_if:
    - duplicate photo_id
    - invalid normalized file name
  human_review_if:
    - public rights unknown
  fail_if:
    - no images available
```

### 4.4 Photo Taxonomy Branches

```yaml
photo_taxonomy_node:
  continue_if:
    - taxonomy coverage >= threshold
  repair_if:
    - missing required taxonomy fields
  human_review_if:
    - confidence below threshold on public hero candidates
```

### 4.5 Content Branches

```yaml
content_generation_nodes:
  continue_if:
    - generated assets pass schema
  repair_if:
    - missing body_richtext
    - body density below minimum
    - invalid UCA type
    - unresolved relation IDs
  human_review_if:
    - claim/proof mismatch
    - policy ambiguity
```

### 4.6 AI Visual Branches

```yaml
ai_visual_os_node:
  skip_optional_if:
    - no AI visual needed
  continue_if:
    - AI visual briefs are internal or properly disclosed
  human_review_if:
    - AI visual intended for public surface
  fail_if:
    - AI visual is mapped as actual portfolio replacement
```

### 4.7 Validation Branches

```yaml
validation_node:
  export_if:
    - all critical gates pass
  repair_if:
    - failed gate is repairable
  human_review_if:
    - failed gate needs human decision
  fail_if:
    - fatal structural gate fails
```

---

## 5. Retry Policy

```yaml
retry_policy:
  max_retry_per_node: 2
  retry_backoff: exponential
  retryable_errors:
    - model_timeout
    - transient_api_error
    - invalid_structured_output
    - repairable_schema_error
  non_retryable_errors:
    - missing_required_input
    - permission_denied
    - human_approval_required
    - unsupported_project_type
```

---

## 6. Repair Subgraph

```text
validation_node
  -> repair_router_node
      -> json_repair_node
      -> field_completion_node
      -> body_expansion_node
      -> relation_resolver_node
      -> claim_boundary_rewrite_node
      -> photo_docent_rewrite_node
  -> validation_node
```

The repair subgraph must never auto-approve human-required facts.

---

## 7. Stop Conditions

```yaml
stop_conditions:
  completed:
    - final_report_node succeeded
    - zip path exists
  paused:
    - blocking human review item exists
  failed:
    - fatal error exists
    - retry limit exceeded for critical node
  cancelled:
    - user cancels job
```

---

## 8. MVP Graph Branching

MVP can use a smaller graph but must preserve branch behavior.

```yaml
mvp_required_branching:
  - intake failure handling
  - model output schema repair
  - image rights human review
  - content density failure
  - export block on invalid required JSON
```
