# Agent State Schema

## 1. Purpose

This document defines the canonical state shape for the LangGraph factory job.

The implementation should keep this state in sync with `packages/schemas/src/agent-state.ts`.

---

## 2. FactoryJobState

```ts
export type FactoryJobState = {
  jobId: string;
  projectId: string;
  tenantId: string;
  tenantSlug: string;
  industryType: "wedding_sdm";

  mode: "draft" | "review" | "production";

  inputs: FactoryInputs;
  intermediate: FactoryIntermediate;
  outputs: FactoryOutputs;
  review: FactoryReviewState;
  qa: FactoryQaState;
  runtime: FactoryRuntimeState;
};
```

---

## 3. Inputs

```ts
export type FactoryInputs = {
  brandFactsheetFileIds: string[];
  packagePolicyFileIds: string[];
  imageFileIds: string[];
  evidenceFileIds: string[];
  userProvidedNotes?: string;
  preferredLanguage: "ko" | "en";
};
```

---

## 4. Intermediate State

```ts
export type FactoryIntermediate = {
  inputReadinessReport?: InputReadinessReport;
  brandTruthSheet?: BrandTruthSheet;
  searchIntentMap?: SearchIntentMap;
  qisGrowthRegistry?: QisGrowthRegistry;
  entityKeywordMap?: EntityKeywordMap;
  localGeoIntentMap?: LocalGeoIntentMap;
  aiAnswerOpportunityMap?: AiAnswerOpportunityMap;
  brandKnowledgeGraph?: BrandKnowledgeGraph;
  claimProofBoundaryGraph?: ClaimProofBoundaryGraph;
  gnbIaConfig?: GnbIaConfig;
  schemaTargetMap?: SchemaTargetMap;
  photoInventory?: PhotoInventoryRecord[];
  photoTaxonomy?: PhotoTaxonomyRecord[];
  photoDocents?: PhotoDocentRecord[];
  visualExperienceMap?: VisualExperienceMap;
  crosslinkMatrix?: CrosslinkMatrix;
  schemaReadinessMap?: SchemaReadinessMap;
};
```

---

## 5. Outputs

```ts
export type FactoryOutputs = {
  universalContentAssets?: UniversalContentAsset[];
  brandProfiles?: BrandProfile[];
  designConfig?: DesignConfig;
  galleryAlbums?: GalleryAlbum[];
  galleryPhotos?: GalleryPhoto[];
  albumTaxonomyNodes?: AlbumTaxonomyNode[];
  visualAssetUrlMapMaster?: VisualAssetMapRecord[];
  advancedFiles?: Record<string, unknown>;
  qaReports?: QaReport[];
  jsonFilePaths?: Record<string, string>;
  zipFilePath?: string;
  manifestPath?: string;
};
```

---

## 6. Review State

```ts
export type FactoryReviewState = {
  humanReviewItems: HumanReviewItem[];
  approvals: ApprovalRecord[];
  blockingReviewCount: number;
  nonBlockingReviewCount: number;
};
```

```ts
export type HumanReviewItem = {
  id: string;
  projectId: string;
  itemType:
    | "claim"
    | "policy"
    | "price"
    | "review"
    | "evidence"
    | "image_rights"
    | "ai_visual_public_use"
    | "final_approval";
  targetId: string;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  suggestedAction?: string;
  status: "open" | "approved" | "rejected" | "resolved" | "deferred";
  createdAt: string;
  resolvedAt?: string;
};
```

---

## 7. QA State

```ts
export type FactoryQaState = {
  gateResults: GateResult[];
  fatalErrors: FactoryError[];
  warnings: FactoryWarning[];
  repairAttempts: RepairAttempt[];
};
```

```ts
export type GateResult = {
  gateId: string;
  gateName: string;
  status: "pass" | "warning" | "fail" | "blocked";
  severity: "info" | "low" | "medium" | "high" | "critical";
  message: string;
  targetIds?: string[];
  repairable: boolean;
  createdAt: string;
};
```

---

## 8. Runtime State

```ts
export type FactoryRuntimeState = {
  currentNode: string;
  completedNodes: string[];
  failedNodes: string[];
  retryCount: Record<string, number>;
  status: "queued" | "running" | "paused" | "failed" | "completed" | "cancelled";
  startedAt?: string;
  updatedAt: string;
  finishedAt?: string;
};
```

---

## 9. State Update Rules

```yaml
state_update_rules:
  - Nodes return typed patches.
  - Nodes do not overwrite unrelated state branches.
  - A missing optional branch is allowed before its generating node runs.
  - Production export requires all required output branches.
  - Failed nodes must record error and retry count.
```

---

## 10. Versioning

State schema must include version metadata when persisted.

```ts
export type PersistedFactoryJobState = {
  schemaVersion: "factory-state-v1";
  state: FactoryJobState;
};
```

If the schema changes, add a migration function rather than silently assuming compatibility.
