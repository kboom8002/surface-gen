# 00. Project Overview

## 1. Project Name
Wedding Surface Agent

## 2. One-Sentence Definition
Wedding Surface Agent is a stateful AI agent webapp that converts a wedding brand factsheet and representative image set into a validated, CMS-ready AIHompy onboarding ZIP with SEO/AEO/GEO, knowledge graph, visual semantic, UX copy, and growth operation outputs.

## 3. Primary User
The primary user is an AIHompy factory operator or agency strategist onboarding a Korean wedding brand into a CMS-powered website system.

Secondary users include reviewers, clients, UX/copy editors, visual QA reviewers, and developers maintaining the agent factory.

## 4. Problem
Wedding brands need websites that are not merely beautiful but semantically rich, searchable, AI-answerable, conversion-oriented, and safe. Existing workflows usually fail because they treat images as decorative files, generate summary-only content, mix actual portfolio photos with AI visuals, and lack structured QA.

## 5. Solution
The system ingests brand facts and representative images, normalizes brand truth, tags images using 5D+1 taxonomy, generates CMS-ready SSoT assets, builds a GNB/IA surface contract, creates SEO/AEO/GEO outputs, generates a brand knowledge graph, validates the outputs through deterministic and LLM-assisted QA gates, and exports an onboarding ZIP.

## 6. Core Input

```yaml
inputs:
  - brand_factsheet
  - representative_images_20_to_100
  - service_package_policy_materials
  - pricing_policy_basis
  - contact_information
  - review_or_evidence_materials_optional
  - visual_preference_optional
```

## 7. Core Output

```yaml
core_upload_outputs:
  - universal_content_assets_final.json
  - brand_profiles.json
  - design_config.json
  - gnb_ia_config.json
  - gallery_albums.json
  - gallery_photos.json
  - album_taxonomy_nodes.json
  - visual_asset_url_map_master.json
```

Advanced outputs include semantic strategy, knowledge graph, schema readiness, UX copy, visual experience, growth operation, manifests, and QA reports.

## 8. Product Principles

### Surface-First
The GNB/IA and page surfaces are defined first. Assets are generated to fill and support those surfaces.

### Image-Semantic Core
Representative wedding images are not decorative. They are evidence, style signals, taxonomy nodes, richmedia references, and consultation inputs.

### SSoT-Ready
All public content must follow SSoT type and payload rules.

### People-First
Content must help real wedding customers choose, compare, trust, and inquire.

### Proof-Boundary
Every claim must have proof, boundary, or review-required status.

### Visual Truth
Actual portfolio photos and AI visuals must be clearly separated.

### Growth-Operable
The output must support post-launch monitoring, updates, and experiments.

## 9. MVP Outcome
The MVP must complete a thin but real vertical slice: create a project, upload a Brand Factsheet and images, run a minimum agent job, generate core JSON outputs, run 6-Gate QA, and export a ZIP.

## 10. v1 Outcome
v1 must support the full 12-Gate QA pipeline, visual semantic editor, asset editor, SEO/AEO/GEO outputs, knowledge graph outputs, repair loop, human review queue, and advanced ZIP package.

## 11. Non-Goals for MVP

```yaml
mvp_non_goals:
  - multi-industry support
  - billing
  - external Search Console API integration
  - automated AI visibility tracking
  - full A/B testing dashboard
  - production-grade marketplace management
```

## 12. Success Metrics

```yaml
success_metrics:
  onboarding_output:
    - required_8_json_generated
    - zip_export_success
    - no_forbidden_uca_type
    - image_paths_resolved
  content_quality:
    - body_richtext_density_pass
    - photo_semantic_qa_pass
    - commercial_copy_pass
  search_readiness:
    - seo_metadata_coverage
    - answer_extractability_score
    - schema_readiness_coverage
  operation:
    - job_completion_rate
    - repair_success_rate
    - human_review_resolution_rate
```
