import type { GateResult, QaReport } from '@surface-gen/schemas';

/**
 * Canonical status values for a factory job.
 * Extends the base JobStatus enum with handoff-specific statuses.
 */
export type JobStatusType =
  | 'queued'
  | 'running'
  | 'paused'
  | 'review_required'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'waiting_for_image_analysis_handoff'
  | 'waiting_for_ai_visual_generation';

/**
 * Factory inputs — what the user uploads to kick off the job.
 * Aligned with AGENT_STATE_SCHEMA.md §3.
 */
export type FactoryInputs = {
  brandFactsheetFileIds: string[];
  packagePolicyFileIds?: string[];
  imageFileIds: string[];
  evidenceFileIds?: string[];
  userProvidedNotes?: string;
  preferredLanguage: 'ko' | 'en';
  options?: Record<string, unknown>;
};

/**
 * Brand truth sheet extracted from the factsheet and policy files.
 * Separates verified facts, assumptions, review-required items, and forbidden claims.
 */
export type BrandTruthSheet = {
  tenantSlug: string;
  officialBrandName: string;
  positioning?: string;
  coreAudience?: string[];
  doNotMisread?: string[];
  serviceDomains?: string[];
  programs?: Array<{
    name: string;
    included?: string[];
    excluded?: string[];
  }>;
  pricingBasis?: string;
  policies?: Array<{ type: string; summary: string }>;
  verifiedFacts?: Array<{ fact: string; source: string }>;
  assumptions?: Array<{ assumption: string; confidence: number }>;
  reviewRequired?: Array<{ field: string; reason: string }>;
  forbiddenClaims?: string[];
};

/**
 * Output of the intake_audit node.
 * Reports what is present and what is missing before proceeding.
 */
export type InputReadinessReport = {
  overallScore: number;
  hasBrandName: boolean;
  hasFactsheet: boolean;
  imageCount: number;
  imageCountSufficient: boolean;
  missingCritical: string[];
  missingRecommended: string[];
  warnings: string[];
  canProceed: boolean;
};

/**
 * Intermediate state: progressively filled as nodes run.
 * Aligned with AGENT_STATE_SCHEMA.md §4.
 */
export type FactoryIntermediate = {
  inputReadinessReport?: InputReadinessReport;
  brandTruthSheet?: BrandTruthSheet;
  semanticStrategy?: Record<string, unknown>;
  knowledgeGraph?: Record<string, unknown>;
  gnbIaConfig?: Record<string, unknown>;
  photoInventory?: Record<string, unknown>;
  photoTaxonomy?: Record<string, unknown>;
  photoDocents?: Record<string, unknown>;
  visualExperienceMap?: Record<string, unknown>;
  portfolioAssets?: unknown[];
  catalogAssets?: unknown[];
  answerAssets?: unknown[];
  articleAssets?: unknown[];
  aboutContactAssets?: unknown[];
  copySystem?: Record<string, unknown>;
  aiVisualBriefs?: unknown[];
  crosslinkMatrix?: Record<string, unknown>;
  schemaReadinessMap?: Record<string, unknown>;
  rejectedAssets?: unknown[];
};

/**
 * Final output state: filled during export nodes.
 * Aligned with AGENT_STATE_SCHEMA.md §5.
 */
export type FactoryOutputs = {
  universalContentAssets?: unknown[];
  galleryAlbums?: unknown[];
  galleryPhotos?: unknown[];
  albumTaxonomyNodes?: unknown[];
  visualAssetUrlMapMaster?: Record<string, unknown>;
  brandProfiles?: Record<string, unknown>;
  designConfig?: Record<string, unknown>;
  gnbIaConfigFinal?: Record<string, unknown>;
  zipFilePath?: string;
  exportBundlePath?: string;
};

/**
 * A single human review item requiring manual sign-off.
 * Aligned with AGENT_STATE_SCHEMA.md §6.
 */
export type HumanReviewItem = {
  id: string;
  itemType:
    | 'claim'
    | 'policy'
    | 'price'
    | 'review'
    | 'evidence'
    | 'image_rights'
    | 'ai_visual_public_use'
    | 'final_approval';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'deferred';
  targetType?: string;
  targetId?: string;
  reason: string;
  createdAt: string;
};

/**
 * Review tracking state.
 */
export type FactoryReviewState = {
  humanReviewItems: HumanReviewItem[];
  approvals: Record<string, boolean>;
  blockingReviewCount: number;
};

/**
 * QA gate tracking state.
 */
export type FactoryQaState = {
  gateResults: GateResult[];
  fatalErrors: string[];
  repairAttempts: number;
  maxRepairAttempts: number;
  exportAllowed: boolean;
  qaReport?: QaReport;
};

/**
 * Runtime state: current position in the graph and job lifecycle status.
 */
export type FactoryRuntimeState = {
  currentNode: string;
  completedNodes: string[];
  failedNode?: string;
  status: JobStatusType;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
};

/**
 * Top-level factory job state.
 * This is the single state shape for the LangGraph factory graph.
 * Aligned with AGENT_STATE_SCHEMA.md §2.
 */
export type FactoryJobState = {
  // Identity
  jobId: string;
  projectId: string;
  tenantId: string;
  tenantSlug: string;
  industryType: 'wedding_sdm';
  schemaVersion: 'factory-state-v1';
  // Inputs
  inputs: FactoryInputs;
  // Processing
  intermediate: FactoryIntermediate;
  // Outputs
  outputs: FactoryOutputs;
  // Review
  review: FactoryReviewState;
  // QA
  qa: FactoryQaState;
  // Runtime
  runtime: FactoryRuntimeState;
};

/**
 * Create a fresh initial state for a new factory job.
 */
export function createInitialState(params: {
  jobId: string;
  projectId: string;
  tenantId: string;
  tenantSlug: string;
  inputs: FactoryInputs;
}): FactoryJobState {
  return {
    ...params,
    industryType: 'wedding_sdm',
    schemaVersion: 'factory-state-v1',
    intermediate: {},
    outputs: {},
    review: {
      humanReviewItems: [],
      approvals: {},
      blockingReviewCount: 0,
    },
    qa: {
      gateResults: [],
      fatalErrors: [],
      repairAttempts: 0,
      maxRepairAttempts: 3,
      exportAllowed: false,
    },
    runtime: {
      currentNode: 'intake_audit',
      completedNodes: [],
      status: 'running',
      startedAt: new Date().toISOString(),
    },
  };
}
