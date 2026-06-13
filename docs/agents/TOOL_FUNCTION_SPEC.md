# Tool Function Spec

## 1. Purpose

This document defines typed tool functions available to LangGraph nodes.

Tools abstract storage, database, model, validation, export, and human review operations. Nodes should call tool adapters instead of directly accessing infrastructure whenever possible.

## 2. Tool Categories

```yaml
tool_categories:
  source:
    - read_source_file
    - list_source_files
    - list_source_images
    - get_image_metadata

  model:
    - generate_structured_output
    - analyze_image_batch
    - repair_structured_output

  validation:
    - validate_zod_schema
    - run_deterministic_validator
    - run_12_gate_validation
    - resolve_asset_relations
    - resolve_image_paths

  persistence:
    - save_intermediate_output
    - save_generated_asset
    - save_generated_json_file
    - save_qa_report
    - update_job_step

  human_review:
    - create_human_review_item
    - list_open_review_items
    - check_review_status

  export:
    - build_required_json_outputs
    - build_manifest
    - build_zip_package
```

## 3. Common Tool Result

```ts
export type ToolResult<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

Tools must not throw for expected business failures. Return a typed error.

## 4. Source Tools

### 4.1 read_source_file

```ts
type ReadSourceFileInput = {
  projectId: string;
  fileId: string;
};

type ReadSourceFileOutput = {
  fileId: string;
  fileName: string;
  mimeType: string;
  text?: string;
  storagePath: string;
};
```

### 4.2 list_source_images

```ts
type ListSourceImagesInput = {
  projectId: string;
};

type ListSourceImagesOutput = {
  images: Array<{
    imageId: string;
    originalFileName: string;
    storagePath: string;
    thumbnailPath?: string;
    rightsStatus: string;
    metadata: Record<string, unknown>;
  }>;
};
```

## 5. Model Tools

### 5.1 generate_structured_output

```ts
type GenerateStructuredOutputInput<TSchemaName extends string> = {
  taskClass: ModelTaskClass;
  schemaName: TSchemaName;
  promptVersion: string;
  system: string;
  user: string;
  temperature?: number;
  maxOutputTokens?: number;
};
```

Output must be parsed through the requested schema before returning to the node.

### 5.2 analyze_image_batch

```ts
type AnalyzeImageBatchInput<TSchemaName extends string> = {
  taskClass: 'vision_analysis';
  schemaName: TSchemaName;
  promptVersion: string;
  images: Array<{
    imageId: string;
    storagePath: string;
    publicUrl?: string;
  }>;
  system: string;
  user: string;
};
```

## 6. Validation Tools

### 6.1 run_12_gate_validation

```ts
type Run12GateValidationInput = {
  projectId: string;
  outputs: {
    universalContentAssets: unknown[];
    gnbIaConfig: unknown;
    galleryAlbums: unknown[];
    galleryPhotos: unknown[];
    visualAssetMap: unknown[];
    advancedFiles?: Record<string, unknown>;
  };
};
```

Returns:

```ts
type Run12GateValidationOutput = {
  overallStatus: 'pass' | 'warning' | 'fail';
  gateResults: GateResult[];
  fatalErrors: FactoryError[];
  warnings: FactoryWarning[];
};
```

## 7. Persistence Tools

Persistence tools must always attach:

- project_id
- job_id when applicable
- node_name when applicable
- created_at timestamp

Do not save model outputs as approved production data if validation fails.

## 8. Human Review Tools

### 8.1 create_human_review_item

```ts
type CreateHumanReviewItemInput = {
  projectId: string;
  jobId?: string;
  itemType:
    | 'claim'
    | 'policy'
    | 'price'
    | 'review'
    | 'award'
    | 'image_rights'
    | 'ai_visual_public_use'
    | 'final_approval';
  targetId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  suggestedAction?: string;
};
```

## 9. Export Tools

### 9.1 build_required_json_outputs

Builds the canonical 8 JSON files:

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

### 9.2 build_zip_package

Must produce:

```text
brand_onboarding_bundle/
├── 01_upload/
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

## 10. Tool Safety Rules

```yaml
safety_rules:
  - Tools must validate inputs.
  - Tools must not expose service role credentials to browser contexts.
  - Tools must return typed errors.
  - Tools must not silently coerce invalid data into valid-looking output.
  - Tools must not approve human-review-required items automatically.
```
