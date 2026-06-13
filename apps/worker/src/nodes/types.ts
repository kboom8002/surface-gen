import type { GateResult } from '@surface-gen/schemas';
import type { FactoryJobState, HumanReviewItem } from '../state/factory-job-state';

/**
 * Context injected into every node at invocation time.
 * Nodes should use the logger and read identity fields from here.
 */
export type NodeContext = {
  jobId: string;
  projectId: string;
  tenantSlug: string;
  industryType: 'wedding_sdm';
  logger: (msg: string, data?: unknown) => void;
};

/**
 * A non-blocking warning produced by a node.
 * Does not halt the graph but is surfaced in the QA report.
 */
export type FactoryWarning = {
  code: string;
  message: string;
  fieldPath?: string;
  assetId?: string;
};

/**
 * What a node returns to the graph.
 * The patch is merged into intermediate/outputs state by the graph reducer.
 */
export type AgentNodeResult<TPatch> = {
  patch: TPatch;
  qa?: GateResult[];
  reviewItems?: HumanReviewItem[];
  warnings?: FactoryWarning[];
  error?: string;
};

/**
 * A partial update to the graph state produced by a node.
 * Nodes should only set keys they own — do not overwrite unrelated branches.
 */
export type NodeStatePatch = Partial<FactoryJobState['intermediate']> & {
  outputs?: Partial<FactoryJobState['outputs']>;
};
