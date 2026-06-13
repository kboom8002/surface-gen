# 01. Product Requirements

## 1. Product Scope
The product is a web application that lets an operator create a wedding brand onboarding project, upload Brand Factsheet and images, run an AI agent factory pipeline, review outputs, validate quality, and export an AIHompy-compatible onboarding ZIP.

## 2. Personas

### Factory Operator
Runs the full onboarding process, reviews QA failures, and exports the ZIP.

### Content Strategist
Reviews brand truth, search intent, answer/article outputs, and UX copy.

### Visual Reviewer
Checks image rights, photo taxonomy, captions, docents, and AI visual usage.

### Client Reviewer
Approves sensitive facts such as pricing, policies, reviews, awards, and public image usage.

### Developer
Maintains schemas, validators, agent nodes, UI, API, and export services.

## 3. Functional Requirements

### Project Management
- Create, view, update, and archive projects.
- Store tenant slug, brand name, industry type, status, and owner.
- `industry_type` must default to `wedding_sdm`.

### Input Intake
- Upload Brand Factsheet files.
- Upload package/policy/evidence files.
- Upload 20-100 representative images.
- Record image rights metadata.
- Show input readiness status.

### Agent Job Execution
- Start a factory job from a project.
- Persist job state.
- Show step-level progress.
- Allow retry, pause, resume, and safe failure.
- Run long jobs in worker, not route handlers.

### Content Generation
Generate:
- brand truth sheet
- semantic search strategy
- brand knowledge graph
- GNB/IA config
- photo inventory
- photo taxonomy
- photo docents
- gallery albums and photos
- UCA assets
- UX copy system
- AI visual planning metadata
- richmedia blocks
- schema readiness outputs
- growth operation outputs

### Human Review
Create review items for unsupported claims, price/policy uncertainty, image rights issues, AI visual public use, and final approval.

### Asset Review and Editing
Provide table/detail views for UCA assets, image metadata, photo copy, QA failures, and export files. Allow individual regeneration where safe.

### Validation
Run 6-Gate QA in MVP and 12-Gate QA in v1.

### Export
Generate required 8 JSON files, advanced strategy/QA files, image folders, manifests, and ZIP package.

## 4. Non-Functional Requirements

### Security
- RLS must protect project data.
- Service role key must never reach client.
- Storage paths must be project/tenant scoped.
- ZIP downloads must be authorized.

### Reliability
- Agent jobs must be resumable or fail safely.
- Intermediate outputs must be persisted.
- Validation failures must be inspectable.

### Performance
- Upload flow must handle at least 100 images.
- Long-running AI jobs must run in worker.
- UI must stay responsive during agent execution.

### Maintainability
- Shared schemas must live in `packages/schemas`.
- Validators must live in `packages/validators`.
- Prompts must live in `packages/prompts`.
- SSoT constants must live in `packages/ssot`.

## 5. MVP Requirements

```yaml
mvp_requirements:
  - project_crud
  - factsheet_upload
  - image_upload_with_rights
  - job_enqueue
  - worker_skeleton
  - input_audit_node
  - brand_truth_node
  - gnb_ia_node
  - basic_image_inventory
  - basic_photo_taxonomy
  - minimal_uca_generation
  - required_8_json_export
  - 6_gate_qa
  - zip_export
```

## 6. v1 Requirements

```yaml
v1_requirements:
  - full_langgraph_pipeline
  - full_content_asset_generation
  - visual_semantic_editor
  - asset_editor
  - qa_center
  - repair_loop
  - human_review_workflow
  - seo_aeo_geo_outputs
  - brand_knowledge_graph
  - schema_readiness_outputs
  - ai_visual_os
  - 12_gate_qa
  - advanced_zip_package
```

## 7. Out of Scope
- Payment and billing
- Multi-industry support beyond `wedding_sdm`
- Direct publishing to production CMS
- Automated Search Console integration in MVP
- Automated social publishing
- Legal contract generation

## 8. Acceptance
Product acceptance is defined in `docs/19_ACCEPTANCE_CRITERIA.md`.
