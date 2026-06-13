/**
 * Shared TypeScript types for agent job UI and API responses.
 * These types mirror the API contract defined in docs/07_API_CONTRACTS.md §6.
 */

export type JobType = 'full_factory' | 'partial_regeneration' | 'qa_only' | 'export_only';

export type JobStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'review_required'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AgentJobSummary {
  id: string;
  projectId: string;
  jobType: JobType;
  status: JobStatus;
  currentNode?: string;
  completedNodes: string[];
  failedNode?: string;
  startedAt?: string;
  finishedAt?: string;
  error?: unknown;
  createdAt: string;
}

export interface AgentJobStep {
  id: string;
  nodeName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting_for_human';
  startedAt?: string;
  finishedAt?: string;
  outputSummary?: string;
  error?: unknown;
}

export interface RunJobRequest {
  jobType: JobType;
  options?: {
    startNode?: string;
    targetAssetIds?: string[];
    skipHumanReview?: boolean;
    maxImages?: number;
  };
}

export interface RunJobResponse {
  jobId: string;
  status: 'queued';
}
