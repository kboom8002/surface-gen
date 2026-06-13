# AGENTS.md

## Mission
Build a **Wedding SOTA Surface Asset Factory**: a stateful agent webapp that converts a Brand Factsheet plus 20-100 representative wedding images into a validated AIHompy onboarding bundle for `wedding_sdm` tenants.

The product must generate CMS-ready GNB/IA, SSoT content assets, gallery/photo metadata, 5D+1 photo taxonomy, portfolio docents, SEO/AEO/GEO outputs, a brand knowledge graph, Schema.org readiness maps, UX copy systems, AI visual planning metadata, QA reports, and an onboarding ZIP.

## Primary Stack
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Next.js Route Handlers, Supabase Postgres/Auth/Storage/Realtime
- Agent runtime: LangGraph, OpenAI API, optional Anthropic Claude API, structured outputs, Zod validation
- Workspace: pnpm, Turborepo
- Testing: Vitest, Playwright, Zod schema tests, golden fixture tests

## Non-Negotiables
Never invent customer reviews, awards, certifications, partnerships, media mentions, exact pricing, refund terms, delivery guarantees, location facts, season facts, fabric/dress brand facts, photographer credentials, or customer consent.

If a fact is missing, mark it as `review_required`, `draft`, or `internal_only`. Unsupported claims must never be published.

## Industry
The MVP industry is always:

```yaml
industry_type: wedding_sdm
```

Do not add other industries unless a task explicitly requires it.

## SSoT Type Rules
Allowed public wedding_sdm UCA types:

```yaml
allowed_types:
  - about_brand
  - brand_truth
  - evidence
  - portfolio
  - gallery
  - portfolio_docent
  - style_collection
  - program
  - product
  - compare
  - policy_card
  - process_step
  - answer
  - article
  - checklist
  - style_guide
  - contact_info
  - match_brief
  - cta_block
  - review
  - case_study
  - person
  - creator
  - brand_story
  - vendor_partner
  - web_presence
  - comparison
```

Forbidden public UCA types:

```yaml
forbidden_types:
  - gallery_photos
  - answer_faq
  - package
  - guide_article
  - image_asset
  - page_config
```

Mapping rules:

```yaml
package: program
packages: catalog
pricing: catalog
faq: answers
answer_faq: answer
guide_article: article
gallery_photos: gallery_photos.json only, not public UCA
image_asset: visual_asset_url_map_master.json only
```

## Required Public Asset Fields
Every public UCA asset requires:

```yaml
required_uca_fields:
  - id
  - tenant_id
  - type
  - category
  - title
  - slug
  - summary
  - status
  - review_status
  - sort_order
  - json_payload
```

Every detailed public asset also requires:

```yaml
required_detail_fields:
  - body
  - body_richtext
  - seo_title
  - meta_description
```

Do not create public summary-only assets.

## Minimum Body Richtext Density

```yaml
minimum_density:
  about_brand: 900 Korean characters
  brand_truth: 500 Korean characters
  portfolio_docent: 1000 Korean characters
  style_collection: 800 Korean characters
  program: 1000 Korean characters
  policy_card: 600 Korean characters
  answer: 650 Korean characters
  article: 3000 Korean characters
  contact_info: 500 Korean characters
  match_brief: 500 Korean characters
```

## Visual Truth
Actual photos and AI visuals must be separated.

```yaml
actual_photo:
  can_represent_actual_work: true
  requires: [rights_status, review_status, image_path, alt, caption]

ai_visual:
  can_represent_actual_work: false
  allowed_use:
    - internal_moodboard
    - editorial_illustration
    - service_process_visual
    - package_concept_visual
    - staging_placeholder_with_expiry
  forbidden_use:
    - actual_portfolio_replacement
```

Public AI visuals require `disclosure_text`, `source_ssot_refs`, `allowed_pages`, `prohibited_pages`, `rights_status`, `qa_status`, and `can_represent_actual_work: false`.

## Development Rules
Before editing, read:
1. `AGENTS.md`
2. The relevant `tasks/*.md` file
3. Docs listed under the task's Context Docs
4. Existing files in the task's Files In Scope

Work only within the task's file scope. Stop and report if another file must be changed.

## TypeScript Rules
- Use strict TypeScript.
- Avoid `any` unless justified.
- Use Zod for runtime validation.
- Keep shared schemas in `packages/schemas`.
- Keep deterministic validators in `packages/validators`.
- Keep prompts in `packages/prompts`.
- Do not duplicate schema definitions.

## LLM Output Rules
No raw LLM output may be persisted as production data. Every model output must pass structured output schema, Zod parsing, and deterministic validation where applicable. Invalid output must not be saved as approved data.

## Database and Security Rules
- Do not bypass RLS in client code.
- Service role keys may only be used in server-only or worker contexts.
- Never expose service role keys to the browser.
- Use migrations for schema changes.
- Never commit secrets.

## Agent Runtime Rules
Long-running jobs must not run directly inside Next.js route handlers. Route handlers authenticate, validate, create jobs, enqueue workers, and return job IDs. Workers run LangGraph, update state, save outputs, validate, repair, and package.

## Human Review Required
Human review is required for reviews, awards, certifications, partnerships, exact price/refund terms, public image rights, customer face/name exposure, public AI visual approval, and final publishing approval.

## Testing Rules
Each implementation task must include or update tests when relevant. Run task verification commands. Report failures honestly.

## Reporting Rules
After each task, report changed files, commands run, test results, known limitations, and remaining risks.

## Canonical Output Package

```text
brand_onboarding_bundle/
├── 01_upload/
│   ├── universal_content_assets_final.json
│   ├── brand_profiles.json
│   ├── design_config.json
│   ├── gnb_ia_config.json
│   ├── gallery_albums.json
│   ├── gallery_photos.json
│   ├── album_taxonomy_nodes.json
│   └── visual_asset_url_map_master.json
├── 02_semantic_strategy/
├── 03_knowledge_graph/
├── 04_schema/
├── 05_ux_copy/
├── 06_visual_experience/
├── 07_growth/
├── 08_manifests/
├── 09_qa/
└── images/
```

The `01_upload` folder is the canonical onboarding source. Do not place competing `universal_content_assets*.json` files elsewhere in the ZIP.

## Definition of Done
A task is done only when implementation matches requirements, verification was run or failure reported, no out-of-scope files were modified, no product requirement was invented, and generated output passes relevant validators.

---

# Handoff Import Addendum

The repository must support external handoff workflows.

## External Image Analysis

The app may receive image files plus `photo_semantic_manifest.json` generated outside the app, such as from a separate GPT session. Imported image analysis must be validated before downstream use.

Rules:

- Do not rerun image analysis if an approved imported manifest exists.
- Use imported metadata as the first source of visual semantics.
- Reanalyze only low-confidence, public hero/cover, or reviewer-flagged images.
- Imported metadata never auto-approves public image rights.

## AI Visual Generation Handoff

The app may generate AI visual prompts and usage briefs only. External AI systems may generate the images. The generated files must be imported with `ai_visual_generation_result_manifest.json`.

Rules:

- The app must not assume it generated the image.
- Prompt IDs and visual asset IDs must match the exported brief pack.
- Imported AI visuals must have `can_represent_actual_work: false`.
- Public AI visuals require disclosure metadata.
- AI visuals cannot be used as actual portfolio proof.
