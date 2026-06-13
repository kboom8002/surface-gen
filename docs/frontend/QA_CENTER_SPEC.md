# QA Center Spec

## Purpose

The QA Center exposes deterministic and LLM-assisted validation results. It must make the final package readiness clear and actionable.

## Gate Summary

The UI must show all 12 gates.

```yaml
gates:
  gate_01_encoding: "UTF-8 Encoding"
  gate_02_content_density: "Content Density"
  gate_03_type_registry: "SSoT Type and Registry"
  gate_04_uca_dedup: "UCA Dedup"
  gate_05_gnb_ia_sync: "GNB/IA Sync"
  gate_06_seo_aeo_readiness: "SEO/AEO Readiness"
  gate_07_knowledge_graph_integrity: "Knowledge Graph Integrity"
  gate_08_schema_readiness: "Schema.org Readiness"
  gate_09_ai_answer_extractability: "AI Answer Extractability"
  gate_10_visual_experience: "Visual Experience"
  gate_11_ux_copy_quality: "UX Copy Quality"
  gate_12_growth_operability: "Growth Operability"
```

## Severity Levels

```yaml
severity:
  info:
    blocks_export: false
  warning:
    blocks_export: false
  error:
    blocks_export: true_for_v1
  critical:
    blocks_export: true
```

## Issue List

```yaml
issue_list:
  filters:
    - gate
    - severity
    - target_type
    - repair_available
    - human_review_required
  columns:
    - severity
    - gate
    - target
    - message
    - repair_available
    - status
```

## Issue Detail

```yaml
issue_detail:
  shows:
    - full message
    - technical code
    - affected file or asset
    - expected condition
    - actual condition
    - recommended action
    - auto repair button when available
    - human review request button when required
```

## Repair Actions

```yaml
repair_actions:
  invalid_json:
    action: rerun_json_repair
  missing_required_field:
    action: run_field_completion
  body_density_fail:
    action: run_body_expansion
  unresolved_relation:
    action: run_relation_resolver
  unsupported_claim:
    action: mark_review_required_or_rewrite
  image_rights_unknown:
    action: request_human_review
```

## Export Blocking Logic

```yaml
export_blocked_if:
  - critical issue exists
  - required 8 JSON missing
  - forbidden UCA type exists
  - public AI visual can_represent_actual_work != false
  - image path unresolved for public photo
  - unresolved human review item with critical severity
```

## Acceptance Criteria

```yaml
accepted_when:
  - all gates are visible
  - failures show target asset/file
  - export blockers are clearly separated from warnings
  - auto repair can be triggered for supported issues
  - human review issues can be opened from QA Center
```
