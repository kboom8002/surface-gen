# 09. Agent Prompt and Tool Spec

## 1. Purpose

This document defines how agent nodes build prompts, call models, use tools, request structured outputs, validate results, and persist safe outputs.

The product must never rely on ad-hoc prompt text scattered across node implementations. All reusable prompts and tool contracts must be versioned and typed.

## 2. Prompt Architecture

All prompt builders live in `packages/prompts`.

```text
packages/prompts/src/
├── index.ts
├── shared/
│   ├── system-policies.ts
│   ├── wedding-ssot-rules.ts
│   ├── truth-safety-rules.ts
│   └── output-format-rules.ts
├── nodes/
│   ├── input-audit.prompt.ts
│   ├── brand-truth.prompt.ts
│   ├── semantic-search-strategy.prompt.ts
│   ├── knowledge-graph.prompt.ts
│   ├── gnb-ia.prompt.ts
│   ├── photo-taxonomy.prompt.ts
│   ├── photo-docent.prompt.ts
│   ├── visual-experience.prompt.ts
│   ├── portfolio-generation.prompt.ts
│   ├── catalog-generation.prompt.ts
│   ├── answer-generation.prompt.ts
│   ├── article-generation.prompt.ts
│   ├── about-contact-generation.prompt.ts
│   ├── copy-system.prompt.ts
│   ├── ai-visual-os.prompt.ts
│   ├── crosslink-schema.prompt.ts
│   ├── ssot-materialization.prompt.ts
│   └── qa-repair.prompt.ts
└── types.ts
```

## 3. Prompt Builder Contract

Each prompt builder must be a pure function.

```ts
export type PromptBuildResult = {
  promptVersion: string;
  system: string;
  user: string;
  metadata: {
    nodeName: string;
    tenantSlug: string;
    expectedSchemaName: string;
    safetyLevel: 'standard' | 'high';
  };
};
```

Prompt builders must not:

- call external APIs
- read from the database
- mutate job state
- embed secrets
- invent tenant-specific facts

## 4. Shared System Policy Blocks

Every generation prompt must include the following blocks, either directly or through shared helpers.

```yaml
required_policy_blocks:
  - truth_and_evidence_policy
  - wedding_sdm_ssot_type_policy
  - forbidden_claim_policy
  - body_richtext_density_policy
  - ai_visual_separation_policy
  - output_schema_policy
```

## 5. Node Prompt Coverage

```yaml
prompt_coverage:
  input_audit_node:
    output: InputReadinessReport
    safety: high

  brand_truth_node:
    output: BrandTruthSheet
    safety: high

  semantic_strategy_node:
    outputs:
      - SearchIntentMap
      - QisGrowthRegistry
      - EntityKeywordMap
      - LocalGeoIntentMap
      - AiAnswerOpportunityMap
    safety: standard

  knowledge_graph_node:
    outputs:
      - BrandKnowledgeGraph
      - EntityRegistry
      - EntityRelationEdges
      - ClaimProofBoundaryGraph
    safety: high

  gnb_ia_node:
    output: GnbIaConfig
    safety: standard

  photo_taxonomy_node:
    output: PhotoTaxonomyRecord[]
    safety: high

  photo_docent_node:
    output: PhotoDocentRecord[]
    safety: high

  content_generation_nodes:
    outputs:
      - UniversalContentAsset[]
    safety: high

  validation_node:
    output: QaReport
    safety: high

  repair_node:
    output: RepairPatch
    safety: high
```

## 6. Structured Output Requirement

Every model output must target a schema from `packages/schemas`.

Accepted flow:

```text
prompt builder
  ↓
model client call with structured output schema
  ↓
Zod parse
  ↓
deterministic validator
  ↓
persist approved or review_required output
```

Rejected flow:

```text
prompt string
  ↓
raw LLM text
  ↓
database insert
```

## 7. Tool Use Policy

Tools should be represented as typed capabilities in `docs/agents/TOOL_FUNCTION_SPEC.md` and implemented through adapters.

Tool categories:

```yaml
tool_categories:
  storage:
    - read_source_file
    - list_source_images
    - write_generated_json
    - write_zip_package

  validation:
    - validate_zod_schema
    - validate_12_gates
    - resolve_relations
    - resolve_image_paths

  model:
    - generate_structured_output
    - analyze_image_batch
    - repair_invalid_output

  human_review:
    - create_review_item
    - check_review_status
```

## 8. Prompt Versioning

Each prompt must define:

```ts
export const PROMPT_VERSION = 'node-name.v1.0.0';
```

When prompt behavior changes in a way that can alter outputs, increment the version.

Persist prompt version in `agent_job_steps.output_ref` or step metadata.

## 9. Safety Clauses for Wedding Content

All generation prompts must enforce:

```yaml
safety_clauses:
  - Do not invent reviews, awards, certifications, partnerships, media mentions, exact prices, refund terms, delivery guarantees, customer consent, or location facts.
  - If uncertain, set review_status to review_required.
  - Do not use forbidden UCA types.
  - Do not use gallery_photos as public UCA.
  - Do not use AI visuals as actual portfolio evidence.
  - Body and body_richtext are required for public detailed assets.
  - Photo copy must describe only visible evidence.
```

## 10. Output Failure Handling

When a model output fails schema validation:

```yaml
failure_handling:
  invalid_json:
    action: run_json_repair_node
  missing_required_fields:
    action: run_field_completion_repair
  unsupported_claim:
    action: mark_review_required_or_remove_claim
  body_density_fail:
    action: run_body_expansion_repair
  unresolved_relations:
    action: run_relation_resolver_repair
```
