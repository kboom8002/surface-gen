# LangGraph Node Spec

## 1. Purpose

This document defines the responsibilities, inputs, outputs, and acceptance criteria for each LangGraph node.

Each node must be implemented as a small, testable unit.

---

## 2. Node Implementation Contract

```ts
export type FactoryNode<TInput, TPatch> = (state: FactoryJobState, context: NodeContext) => Promise<AgentNodeResult<TPatch>>;
```

```ts
export type NodeContext = {
  modelClient: ModelClient;
  storageClient: StorageClient;
  dbClient: DbClient;
  logger: Logger;
  abortSignal?: AbortSignal;
};
```

---

## 3. Common Node Requirements

Every node must:

```yaml
common_requirements:
  - read only required state branches
  - validate all model outputs
  - produce typed state patch
  - create warnings for partial uncertainty
  - create human review items when required
  - log start and finish
  - never persist public production data before validation
```

---

## 4. Node Specs

### 4.1 intake_audit_node

```yaml
input:
  - project metadata
  - uploaded files
  - uploaded images
output:
  - inputReadinessReport
checks:
  - brand factsheet exists
  - image count >= 20 for standard run
  - service/package info exists or marked missing
  - rights metadata exists or marked review_required
fail_if:
  - no brand name
  - no usable input files
```

### 4.2 brand_truth_node

```yaml
input:
  - inputReadinessReport
  - extracted factsheet text
  - policy/evidence text
output:
  - brandTruthSheet
  - human review items for unsupported claims
rules:
  - separate facts from assumptions
  - never invent reviews, awards, certifications, partnerships
  - mark unclear commercial facts review_required
```

### 4.3 semantic_strategy_node

```yaml
input:
  - brandTruthSheet
  - service/package facts
output:
  - searchIntentMap
  - qisGrowthRegistry
  - entityKeywordMap
  - localGeoIntentMap
  - aiAnswerOpportunityMap
rules:
  - query intents must map to GNB surfaces
  - questions must be customer decision scenes, not keyword spam
```

### 4.4 knowledge_graph_node

```yaml
input:
  - brandTruthSheet
  - semantic strategy outputs
output:
  - brandKnowledgeGraph
  - entityRegistry
  - entityRelationEdges
rules:
  - all nodes require source_basis
  - confidence below threshold must not drive public claims
```

### 4.5 claim_proof_boundary_node

```yaml
input:
  - brandTruthSheet
  - knowledge graph
output:
  - claimProofBoundaryGraph
  - human review items
rules:
  - every public claim needs proof or boundary
  - unsupported claim becomes hold or review_required
```

### 4.6 gnb_ia_node

```yaml
input:
  - brandTruthSheet
  - semantic strategy
output:
  - gnbIaConfig
rules:
  - standard nodes: portfolio, catalog, gallery, answers, about, contact
  - alias mapping must follow UCA rules
  - top-level GNB count should be <= 7
```

### 4.7 schema_target_node

```yaml
input:
  - gnbIaConfig
  - intended asset plan
output:
  - schemaTargetMap
rules:
  - assign Schema.org target for major public assets
  - report missing fields early
```

### 4.8 image_inventory_node

```yaml
input:
  - uploaded images
  - project tenant_slug
output:
  - photoInventory
rules:
  - assign album_id and photo_id
  - normalize file names
  - preserve original_file_name
  - rights unknown -> review_required
```

### 4.9 photo_taxonomy_node

```yaml
input:
  - photoInventory
  - image files
output:
  - photoTaxonomy
rules:
  - visible evidence only
  - do not infer exact location, season, brand, or fabric
  - include 5D+1 vibe vector
```

### 4.10 photo_docent_node

```yaml
input:
  - photoTaxonomy
output:
  - photoDocents
rules:
  - alt 40-90 Korean characters
  - caption 50-100 Korean characters
  - scene_note 90-170 Korean characters
  - style_note 90-170 Korean characters
  - recommended_for 70-150 Korean characters
```

### 4.11 visual_experience_node

```yaml
input:
  - photoTaxonomy
  - gnbIaConfig
  - brandTruthSheet
output:
  - visualExperienceMap
rules:
  - separate actual photos and AI visuals
  - define page visual sequence
  - include mobile crop guidance
```

### 4.12 content generation nodes

```yaml
nodes:
  gallery_portfolio_node:
    outputs:
      - gallery albums
      - portfolio assets
      - portfolio_docent assets
      - style_collection assets
  catalog_policy_node:
    outputs:
      - program assets
      - product assets if available
      - compare assets
      - policy_card assets
      - process_step assets
  answer_generation_node:
    outputs:
      - answer assets
      - QIS-linked decision cards
  article_generation_node:
    outputs:
      - article assets
  about_evidence_node:
    outputs:
      - about_brand
      - brand_truth
      - evidence
      - person/web_presence when provided
  contact_cta_node:
    outputs:
      - contact_info
      - match_brief
      - cta_block
```

### 4.13 validation_node

```yaml
input:
  - all generated outputs
output:
  - gateResults
rules:
  - run deterministic validators first
  - classify as pass, warning, fail, blocked
```

### 4.14 repair_router_node

```yaml
input:
  - gateResults
  - failed artifacts
output:
  - repaired artifacts or review items
rules:
  - max retry per node: 2
  - human-required issues must not be auto-approved
```

### 4.15 export_json_node

```yaml
input:
  - validated outputs
output:
  - generated JSON file paths
rules:
  - write required 8 JSON files
  - generate advanced strategy files
  - do not create competing UCA files outside 01_upload
```

### 4.16 zip_packaging_node

```yaml
input:
  - generated JSON files
  - image files
  - manifests
output:
  - zipFilePath
rules:
  - include canonical folder structure
  - include SHA256 manifest
  - verify file paths
```

---

## 5. Node Testing

Each node should have:

```yaml
tests:
  - schema test
  - happy path fixture test
  - invalid input test
  - repairable failure test when applicable
```
