import { z } from 'zod';
import { JobStatus, JobType } from './enums';

/**
 * Agent job and job step schemas.
 * Jobs are created by Route Handlers and processed by apps/worker.
 * Route Handlers must NOT run long-running operations — only create jobs.
 */

export const AgentJobStepSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  projectId: z.string().uuid(),
  nodeName: z.string().min(1),
  stepIndex: z.number().int().nonnegative(),
  status: z.enum([
    'queued',
    'running',
    'completed',
    'failed',
    'skipped',
    'waiting_for_human',
  ]),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  tokenUsage: z
    .object({
      promptTokens: z.number().int().optional(),
      completionTokens: z.number().int().optional(),
      totalTokens: z.number().int().optional(),
    })
    .optional(),
  durationMs: z.number().int().optional(),
  error: z.unknown().optional(),
  outputSummary: z.string().optional(),
});

export const AgentJobSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  jobType: JobType,
  status: JobStatus,
  currentNode: z.string().optional(),
  completedNodes: z.array(z.string()).default([]),
  failedNode: z.string().optional(),
  state: z.record(z.unknown()).optional(),
  retryCount: z.record(z.number()).optional(),
  error: z.unknown().optional(),
  requestedBy: z.string().uuid().optional(),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type AgentJob = z.infer<typeof AgentJobSchema>;
export type AgentJobStep = z.infer<typeof AgentJobStepSchema>;
