# Wedding Surface Agent

A stateful AI agent webapp for generating CMS-ready wedding brand website onboarding bundles from a Brand Factsheet and representative image set.

## What This Project Does
Wedding Surface Agent turns Brand Factsheets, 20-100 representative wedding images, service/package/pricing/policy information, and proof/evidence materials into a complete AIHompy onboarding package for the `wedding_sdm` industry.

The generated package includes CMS-ready GNB/IA, SSoT content assets, gallery albums and photo metadata, 5D+1 photo taxonomy, vibe vector metadata, portfolio docent content, SEO/AEO/GEO strategy outputs, a brand knowledge graph, Schema.org readiness outputs, UX copy systems, AI visual planning metadata, QA reports, and onboarding ZIP.

## Why This Exists
Wedding websites are visual-first, but most CMS onboarding workflows treat images as simple files. This project treats wedding images as semantic assets that can become portfolio evidence, style signals, gallery filters, answer/article richmedia, program support visuals, consultation references, SEO image context, and AI-search grounding signals.

## Core Workflow

```text
Brand Factsheet + Images
        ↓
Input Audit
        ↓
Brand Truth Normalization
        ↓
SEO/AEO/GEO Semantic Strategy
        ↓
Brand Knowledge Graph
        ↓
GNB/IA Surface Contract
        ↓
Image Inventory
        ↓
5D+1 Photo Taxonomy
        ↓
Photo Docent Text
        ↓
Portfolio / Gallery / Catalog / Answers / About / Contact Assets
        ↓
UX Copy + Visual Experience + AI Visual OS
        ↓
Crosslink + Schema Readiness
        ↓
SSoT UCA Materialization
        ↓
12-Gate QA
        ↓
Onboarding ZIP
```

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase Postgres/Auth/Storage/Realtime, Next.js Route Handlers
- Agent: LangGraph, OpenAI API, optional Anthropic Claude API, structured outputs, Zod validation
- Tooling: pnpm, Turborepo, Vitest, Playwright

## Repository Structure

```text
wedding-surface-agent/
├── apps/
│   ├── web/
│   └── worker/
├── packages/
│   ├── schemas/
│   ├── validators/
│   ├── prompts/
│   ├── ssot/
│   ├── shared/
│   └── ui/
├── supabase/
├── docs/
├── tasks/
├── tests/
├── scripts/
├── AGENTS.md
└── README.md
```

## Main Applications

### `apps/web`
The Next.js web application: authentication, project dashboard, intake/upload UI, image rights management, job console, asset editor, visual semantic editor, QA center, and ZIP export center.

### `apps/worker`
The long-running agent worker: LangGraph execution, model calls, checkpoint updates, intermediate output persistence, validation, repair loop, JSON export, and ZIP packaging.

## Main Packages

- `packages/schemas`: shared Zod schemas and TypeScript types.
- `packages/validators`: deterministic validation functions.
- `packages/prompts`: prompt builders for agent nodes.
- `packages/ssot`: wedding-specific SSoT type maps, category maps, density rules, and output constants.
- `packages/shared`: common utilities.
- `packages/ui`: shared UI components.

## Canonical Output Files
The onboarding package must include these files in `01_upload/`:

```text
universal_content_assets_final.json
brand_profiles.json
design_config.json
gnb_ia_config.json
gallery_albums.json
gallery_photos.json
album_taxonomy_nodes.json
visual_asset_url_map_master.json
```

Advanced folders may include semantic strategy, knowledge graph, schema, UX copy, visual experience, growth, manifests, and QA files.

## Development Workflow
Use Specification-Driven Development.

```text
1. Read AGENTS.md
2. Read the target tasks/*.md file
3. Read linked docs
4. Implement only scoped files
5. Run verification commands
6. Report changed files and risks
```

Do not implement broad features without a task file.

## Validation Philosophy
LLM output is never trusted by default. Every model output must pass structured output contract, Zod schema parsing, deterministic validation, and human review when required. The product should fail safely.

## MVP Scope
MVP includes project CRUD, Brand Factsheet upload, image upload with rights metadata, agent job creation, minimum LangGraph vertical slice, brand truth generation, GNB/IA generation, basic image inventory, basic photo taxonomy, minimal UCA generation, required 8 JSON export, 6-Gate QA, and ZIP packaging.

MVP excludes full growth dashboard, AI visibility automation, advanced A/B testing, multi-industry support, billing, and full visual editor polish.

## v1 Scope
v1 includes full 12-Gate QA, repair loop, visual semantic editor, asset editor, knowledge graph outputs, SEO/AEO/GEO strategy outputs, Schema.org readiness outputs, AI visual OS, growth loop outputs, and final onboarding ZIP.

---

# Handoff Import Workflow

The app supports cost-optimized and agency-friendly handoff workflows.

## External Image Analysis Import

Operators may analyze images outside the app, then import:

```text
image files + photo_semantic_manifest.json + handoff_manifest.json
```

The app validates the import and uses the approved metadata for gallery, portfolio, answer, article, and visual experience generation.

## Prompt-Only AI Visual Workflow

The app can generate AI visual briefs and prompts, export them, and wait for externally generated images to be uploaded back into the project.

```text
app creates prompts → external AI creates images → app imports files and validates usage metadata
```

This keeps image generation flexible while preserving SSoT, disclosure, and safety rules.
