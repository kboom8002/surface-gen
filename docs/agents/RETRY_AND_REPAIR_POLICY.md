# Retry and Repair Policy

## 1. Purpose

This document defines how the agent handles recoverable failures, retries, and repair operations.

Repair must improve validity and safety. It must never fabricate missing truth.

---

## 2. Retry Limits

```yaml
retry_limits:
  max_retry_per_node: 2
  max_total_repair_cycles: 3
  retry_backoff: exponential
  retry_jitter: true
```

If the retry limit is exceeded, the job must fail or pause with a clear reason.

---

## 3. Failure Classes

```yaml
failure_classes:
  structural:
    examples:
      - invalid_json
      - zod_schema_failure
      - missing_required_field
      - invalid_enum
    default_action: repair

  deterministic_quality:
    examples:
      - body_density_failure
      - forbidden_uca_type
      - unresolved_relation
      - image_path_missing
    default_action: repair_or_block

  semantic_quality:
    examples:
      - unsupported_claim
      - caption_overclaim
      - answer_not_direct
      - ai_visual_policy_violation
    default_action: repair_or_human_review

  human_truth:
    examples:
      - exact_price_unclear
      - review_unverified
      - award_without_source
      - image_rights_unknown
    default_action: human_review

  fatal:
    examples:
      - missing_project
      - no_usable_inputs
      - storage_permission_error
      - unrecoverable_schema_mismatch
    default_action: fail
```

---

## 4. Repair Actions

```yaml
repair_actions:
  json_repair_node:
    handles:
      - invalid_json
      - malformed_array
      - trailing_text

  schema_patch_node:
    handles:
      - missing_required_field
      - invalid_enum
      - wrong_type

  field_completion_node:
    handles:
      - missing seo_title
      - missing meta_description
      - missing summary
      - missing relations

  body_expansion_node:
    handles:
      - body_richtext missing
      - body_richtext below density minimum
      - summary-only content

  relation_resolver_node:
    handles:
      - unresolved related_program_ids
      - unresolved photo_ids
      - unresolved policy_ids

  claim_boundary_rewrite_node:
    handles:
      - unsupported public claim
      - overclaiming
      - guarantee language

  photo_docent_rewrite_node:
    handles:
      - unverified location claim
      - repeated caption template
      - exposed internal tags
      - overemotional copy

  ai_visual_policy_rewrite_node:
    handles:
      - missing disclosure
      - can_represent_actual_work not false
      - AI visual used as portfolio
```

---

## 5. Non-Repairable Issues

The system must not auto-repair by inventing facts.

```yaml
non_repairable_without_human:
  - missing refund policy
  - missing exact price
  - missing review source
  - missing award proof
  - missing certification proof
  - missing image consent
  - missing partnership proof
```

Allowed safe fallback:

```yaml
safe_fallback:
  - mark review_required
  - mark draft
  - mark internal_only
  - remove from public export
  - rewrite claim into non-specific boundary-aware copy
```

---

## 6. Repair Output Contract

Every repair node must return:

```ts
export type RepairResult = {
  repaired: boolean;
  targetIds: string[];
  repairType: string;
  beforeSummary: string;
  afterSummary: string;
  remainingIssues: GateResult[];
  humanReviewItems: HumanReviewItem[];
};
```

---

## 7. Validation After Repair

Every repaired output must be revalidated.

```yaml
post_repair_validation:
  required:
    - zod parse
    - relevant deterministic validator
    - gate result update
  forbidden:
    - marking gate as pass without running validation
```

---

## 8. Repair Logging

```yaml
repair_log:
  must_record:
    - job_id
    - node_name
    - target_ids
    - failure_type
    - repair_action
    - retry_count
    - result
    - timestamp
```

---

## 9. Repair Success Criteria

A repair succeeds only when:

```yaml
success_criteria:
  - original failure no longer appears
  - no new critical failure is introduced
  - repaired content remains truth-safe
  - output passes its schema
```
