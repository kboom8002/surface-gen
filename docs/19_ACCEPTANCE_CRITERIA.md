# 19. Acceptance Criteria

## Purpose
This document defines acceptance criteria for the Wedding Surface Agent repository. A feature is accepted only when it satisfies product requirements, SSoT output requirements, validation requirements, security requirements, UX requirements, and packaging requirements.

The product must not be accepted based only on “the UI looks done” or “the model returned content.”

## Global Acceptance Criteria
The product is acceptable when it can take a Brand Factsheet and representative image set and generate a validated onboarding package for a `wedding_sdm` tenant.

Required core outputs:

```yaml
required_core_outputs:
  - universal_content_assets_final.json
  - brand_profiles.json
  - design_config.json
  - gnb_ia_config.json
  - gallery_albums.json
  - gallery_photos.json
  - album_taxonomy_nodes.json
  - visual_asset_url_map_master.json
```

Recommended advanced outputs:

```yaml
advanced_outputs:
  - search_intent_map.json
  - qis_growth_registry.json
  - entity_keyword_map.json
  - local_geo_intent_map.json
  - ai_answer_opportunity_map.json
  - brand_knowledge_graph.json
  - entity_registry.json
  - entity_relation_edges.json
  - claim_proof_boundary_graph.json
  - semantic_surface_map.json
  - schema_readiness_map.json
  - jsonld_generation_plan.json
  - rich_result_eligibility_report.json
  - copy_system.json
  - microcopy_library.json
  - cta_strategy_map.json
  - form_ux_intent_capture_map.json
  - visual_experience_map.json
  - page_visual_sequence_map.json
  - ai_visual_brief_pack.json
  - image_crop_and_layout_map.json
  - growth_experiment_backlog.json
  - content_refresh_calendar.json
  - ai_visibility_observation_plan.json
  - search_console_observation_plan.json
  - conversion_experiment_plan.json
```

## MVP Acceptance Criteria

### Project Intake
Accepted when a user can create a project, the project has `tenant_slug`, `official_brand_name`, and `industry_type: wedding_sdm`, the user can upload a Brand Factsheet, upload 20 or more images, and assign or confirm image rights status.

### Agent Job
Accepted when the user can start an agent job, job status is persisted, job step status is visible, job can complete or fail safely, failure reason is saved, and long model calls are not run directly inside a Next.js route handler.

### Minimum Agent Outputs
Accepted when the system generates an input readiness report, brand truth sheet, GNB/IA config, image inventory, basic photo taxonomy, and minimal `universal_content_assets_final.json`.

MVP minimum UCA types:

```yaml
mvp_minimum_uca_types:
  - about_brand
  - brand_truth
  - portfolio_docent
  - program
  - policy_card
  - answer
  - contact_info
  - match_brief
```

### Minimum JSON Export
Accepted when required 8 JSON files are generated, valid UTF-8, valid JSON, tenant identity is consistent, and image paths are resolvable.

### Minimum QA
MVP must pass:

```yaml
mvp_required_gates:
  - Gate 1: UTF-8 Encoding
  - Gate 2: Content Density
  - Gate 3: SSoT Type Alignment
  - Gate 4: UCA Dedup Safety
  - Gate 5: GNB/IA Sync
  - Gate 6: SEO/AEO Readiness
```

### ZIP Export
Accepted when the user can generate a ZIP package containing `01_upload`, required 8 JSON files, images or valid image references, and `final_package_manifest.json`.

## v1 Acceptance Criteria
v1 is accepted when MVP criteria are met plus full 12-Gate QA, full advanced outputs, repair loop, human review, asset editor, visual semantic editor, QA center, and export center.

Full 12 gates:

```yaml
v1_required_gates:
  - Gate 1: UTF-8 Encoding
  - Gate 2: Content Density
  - Gate 3: SSoT Type and Registry
  - Gate 4: UCA Dedup
  - Gate 5: GNB/IA Sync
  - Gate 6: SEO/AEO Readiness
  - Gate 7: Knowledge Graph Integrity
  - Gate 8: Schema.org Readiness
  - Gate 9: AI Answer Extractability
  - Gate 10: Visual Experience
  - Gate 11: UX Copy Quality
  - Gate 12: Growth Operability
```

## Content Acceptance Criteria
Every public asset must include `id`, `tenant_id`, `type`, `category`, `title`, `slug`, `summary`, `status`, `review_status`, `sort_order`, and `json_payload`. Every detailed public asset must include `body`, `body_richtext`, `seo_title`, and `meta_description`.

Forbidden content includes fake reviews, unsupported awards/certifications/partnerships, unverified exact location claims, unverified price guarantees, result guarantees, customer identity exposure without consent, and AI visual represented as actual portfolio.

Minimum body_richtext density:

```yaml
minimum_body_richtext_density:
  about_brand: 900
  brand_truth: 500
  portfolio_docent: 1000
  style_collection: 800
  program: 1000
  policy_card: 600
  answer: 650
  article: 3000
  contact_info: 500
  match_brief: 500
```

## Photo and Visual Acceptance Criteria
Every public photo must have identity, visual facts, taxonomy, copy, QA, rights, and review fields. Photo copy is accepted only when it matches visible evidence and avoids unverified location, season, fabric, brand, and emotional overclaim.

AI visual output is accepted only when `can_represent_actual_work` is false, purpose is locked, source SSoT references exist, disclosure text exists if public, prohibited pages are defined, and QA status is not failed.

## SSoT Type Acceptance Criteria
The system must not export forbidden public UCA types:

```yaml
blocked_public_uca_types:
  - gallery_photos
  - answer_faq
  - package
  - guide_article
  - image_asset
  - page_config
```

Correct replacements:

```yaml
replacement_rules:
  gallery_photos: gallery_photos.json
  answer_faq: answer
  package: program
  guide_article: article
  image_asset: visual_asset_url_map_master.json
```

## Security Acceptance Criteria
Users can access only their own projects, RLS is active, service role key is never exposed to browser, storage paths are scoped by project/tenant, uploaded files are validated, secrets are not committed, and ZIP download is authorized.

## Performance Acceptance Criteria
Large jobs run in worker, UI remains responsive, job progress is visible, image upload handles at least 100 images, export handles large JSON safely, and repeated validation is not unnecessarily LLM-based.

## Developer Experience Acceptance Criteria
`pnpm install`, `pnpm typecheck`, and `pnpm test` work; local env variables are documented; seed fixture exists; golden sample test exists; and task files are clear enough for AI pair-coding.

## Release Candidate Acceptance
A release candidate is accepted only when all MVP/v1 criteria for the target release pass, no critical QA failures exist, no unresolved critical human review items remain, generated ZIP matches expected folder structure, required 8 JSON files exist, schema validation passes, export manifest matches file contents, security checks pass, and e2e happy path passes.
