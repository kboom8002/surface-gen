# Prompt Library

## 1. Purpose

This document lists canonical prompt modules that must be implemented in `packages/prompts`.

Each prompt module must include:

- prompt version
- input type
- expected output schema
- safety clauses
- formatting rules
- failure notes

## 2. Shared Prompt Fragments

### 2.1 Truth Safety Fragment

```text
Do not invent facts. Do not create unsupported reviews, awards, certifications, exact prices, refund terms, delivery guarantees, or customer consent. If the source material does not support a claim, mark it as review_required or omit it from public copy.
```

### 2.2 SSoT Type Fragment

```text
Use only allowed wedding_sdm UCA types. Never use gallery_photos, answer_faq, package, guide_article, image_asset, or page_config as public UCA types. Use program instead of package, answer instead of answer_faq, article instead of guide_article, and gallery_photos.json for individual photo records.
```

### 2.3 Body Richtext Fragment

```text
For public detailed assets, generate both body and body_richtext. The body_richtext must be substantial and cannot be the same as summary. Use clear sections, decision criteria, cautions, related actions, and natural Korean prose.
```

### 2.4 AI Visual Fragment

```text
AI visuals cannot represent actual portfolio work. Any public AI visual must be described as an explanatory or editorial visual, include disclosure text, and set can_represent_actual_work to false.
```

## 3. Node Prompt Modules

### 3.1 Input Audit Prompt

File: `packages/prompts/src/nodes/input-audit.prompt.ts`

Output schema: `InputReadinessReportSchema`

Responsibilities:

- inspect available inputs
- score readiness
- identify missing critical fields
- identify review_required items
- identify image rights risks

### 3.2 Brand Truth Prompt

File: `packages/prompts/src/nodes/brand-truth.prompt.ts`

Output schema: `BrandTruthSheetSchema`

Responsibilities:

- separate strategic truth from operational truth
- create allowed claims
- create forbidden claims
- create facts vs assumptions map
- create claim boundary notes

### 3.3 Semantic Search Strategy Prompt

File: `packages/prompts/src/nodes/semantic-search-strategy.prompt.ts`

Output schemas:

- `SearchIntentMapSchema`
- `QisGrowthRegistrySchema`
- `EntityKeywordMapSchema`
- `LocalGeoIntentMapSchema`
- `AiAnswerOpportunityMapSchema`

Responsibilities:

- generate canonical search intents
- map queries to GNB surfaces
- generate QIS growth registry
- map local intent
- identify AI answer opportunities

### 3.4 Knowledge Graph Prompt

File: `packages/prompts/src/nodes/knowledge-graph.prompt.ts`

Output schemas:

- `BrandKnowledgeGraphSchema`
- `EntityRegistrySchema`
- `EntityRelationEdgesSchema`
- `ClaimProofBoundaryGraphSchema`

Responsibilities:

- create brand, service, program, problem, proof, policy, answer, CTA nodes
- create typed edges
- map claims to proof and boundary
- assign confidence scores

### 3.5 GNB/IA Prompt

File: `packages/prompts/src/nodes/gnb-ia.prompt.ts`

Output schema: `GnbIaConfigSchema`

Responsibilities:

- generate standard wedding GNB
- assign allowed SSoT types per node
- generate mobile bottom nav
- map aliases

### 3.6 Photo Taxonomy Prompt

File: `packages/prompts/src/nodes/photo-taxonomy.prompt.ts`

Output schema: `PhotoTaxonomyBatchSchema`

Responsibilities:

- extract visible facts
- classify scene, subject, mood, style, composition
- assign vibe vector
- avoid unverified inference

### 3.7 Photo Docent Prompt

File: `packages/prompts/src/nodes/photo-docent.prompt.ts`

Output schema: `PhotoDocentBatchSchema`

Responsibilities:

- generate alt, caption, scene_note, style_note, recommended_for
- keep copy visible-evidence based
- avoid repeated templates

### 3.8 Content Generation Prompts

Files:

- `portfolio-generation.prompt.ts`
- `catalog-generation.prompt.ts`
- `answer-generation.prompt.ts`
- `article-generation.prompt.ts`
- `about-contact-generation.prompt.ts`

Output schema: `UniversalContentAssetBatchSchema`

Responsibilities:

- generate SSoT-compliant UCA assets
- include body and body_richtext
- include SEO fields
- include relations
- include review_status

### 3.9 Copy System Prompt

File: `copy-system.prompt.ts`

Output schemas:

- `CopySystemSchema`
- `MicrocopyLibrarySchema`
- `CtaStrategyMapSchema`

Responsibilities:

- define brand voice
- generate page-level microcopy rules
- generate CTA strategy
- prevent repetitive copy

### 3.10 AI Visual OS Prompt

File: `ai-visual-os.prompt.ts`

Output schemas:

- `AiVisualBriefPackSchema`
- `VisualAssetMapSchema`

Responsibilities:

- decide if AI visual is needed
- classify visual purpose
- generate prompts
- create disclosure
- prohibit actual portfolio replacement

### 3.11 QA Repair Prompt

File: `qa-repair.prompt.ts`

Output schema: `RepairPatchSchema`

Responsibilities:

- repair schema failures
- expand low-density body text
- remove unsupported claims
- patch unresolved relations
- rewrite AI visual policy violations

## 4. Prompt Quality Rules

A good prompt must:

- state the exact output schema
- include relevant source material
- include forbidden behavior
- include review_required fallback
- instruct model not to add extra keys unless schema allows
- prefer Korean content for public copy
- keep internal metadata in English-compatible IDs

## 5. Bad Prompt Patterns

Do not write prompts that say:

- “Make it beautiful.”
- “Generate all content freely.”
- “Assume missing facts.”
- “Use any suitable type.”
- “Create reviews if missing.”
- “Use AI visuals as portfolio images.”

## 6. Prompt Test Fixtures

Each prompt module should have at least one fixture-driven test that checks:

- prompt includes truth safety clause
- prompt includes forbidden type policy
- prompt references expected schema name
- prompt version is present
