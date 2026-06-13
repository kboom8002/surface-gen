# Model Routing Policy

## 1. Purpose

This document defines which model class should be used for each agent task, how to control cost, and how to prevent quality regressions.

The application should support multiple providers through a typed model client abstraction. Runtime model names may change, but task classes and quality expectations should remain stable.

## 2. Model Client Abstraction

All model calls must go through a single adapter interface.

```ts
export type ModelTaskClass =
  | 'planner'
  | 'vision_analysis'
  | 'structured_generation'
  | 'longform_generation'
  | 'validator'
  | 'repair'
  | 'batch_low_risk';

export interface ModelClient {
  generateStructured<T>(request: StructuredModelRequest<T>): Promise<StructuredModelResult<T>>;
  analyzeImages<T>(request: ImageAnalysisRequest<T>): Promise<StructuredModelResult<T>>;
}
```

Do not call provider SDKs directly from LangGraph nodes.

## 3. Recommended Routing

```yaml
routing:
  planner:
    preferred: frontier_reasoning_model
    examples:
      - gpt-5.4
      - claude-sonnet-4-6
    use_for:
      - job planning
      - branch decisions
      - final synthesis

  vision_analysis:
    preferred: multimodal_frontier_model
    use_for:
      - visible fact extraction
      - photo taxonomy
      - photo docent QA

  structured_generation:
    preferred: strong_structured_output_model
    use_for:
      - GNB/IA
      - program payloads
      - answer payloads
      - schema readiness
      - knowledge graph

  longform_generation:
    preferred: high_quality_writing_model
    use_for:
      - articles
      - portfolio docent
      - about_brand

  validator:
    preferred: frontier_reasoning_model
    use_for:
      - semantic QA
      - unsupported claim detection
      - UX copy review

  repair:
    preferred: strong_structured_output_model
    use_for:
      - invalid output patch
      - density expansion
      - relation repair

  batch_low_risk:
    preferred: cost_optimized_model
    use_for:
      - short captions
      - low-risk microcopy variants
      - tag normalization
```

## 4. Deterministic Validation Comes First

Use deterministic validators before calling expensive validator models.

```text
Zod parse → deterministic checks → only then LLM semantic review if needed
```

## 5. Model Output Persistence

Persist the following metadata for each model step:

```yaml
model_step_metadata:
  provider:
  model:
  model_task_class:
  prompt_version:
  structured_schema_name:
  input_token_estimate:
  output_token_estimate:
  retry_count:
  validation_status:
```

## 6. Cost Control

```yaml
cost_controls:
  - batch images in bounded chunks
  - cache source document extraction
  - cache photo visible facts before generating captions
  - run deterministic validators before repair models
  - do not regenerate all assets when one asset fails
  - allow per-node regeneration
```

## 7. Human Review Override

No model can override human review rules.

Human review remains required for:

- public image rights
- customer reviews
- awards
- certifications
- exact prices
- refund terms
- AI visual public use
- final publish approval

## 8. Environment Variables

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DEFAULT_PLANNER_MODEL=
DEFAULT_VISION_MODEL=
DEFAULT_GENERATION_MODEL=
DEFAULT_VALIDATOR_MODEL=
DEFAULT_REPAIR_MODEL=
```

Do not hardcode model names in node implementations. Use configuration.
