import { supabaseAdmin } from './supabase-admin';
import type { FactoryJobState } from '../state/factory-job-state';

/**
 * Load a job's full state from the database.
 * Returns null if the job does not exist or has no state yet.
 */
export async function loadJobState(jobId: string): Promise<FactoryJobState | null> {
  const { data, error } = await supabaseAdmin
    .from('agent_jobs')
    .select('state, project_id, status')
    .eq('id', jobId)
    .single();

  if (error || !data) return null;
  return data['state'] as FactoryJobState | null;
}

/**
 * Persist the full job state back to the database.
 * Also updates runtime tracking columns (current_node, completed_nodes, status).
 */
export async function saveJobState(jobId: string, state: FactoryJobState): Promise<void> {
  const { error } = await supabaseAdmin
    .from('agent_jobs')
    .update({
      state: state as unknown as Record<string, unknown>,
      current_node: state.runtime.currentNode,
      completed_nodes: state.runtime.completedNodes,
      status: state.runtime.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) throw new Error(`Failed to save job state: ${error.message}`);
}

/**
 * Update just the job status and optional extra columns.
 * Used for quick status transitions without rewriting the full state blob.
 */
export async function updateJobStatus(
  jobId: string,
  status: string,
  extra?: {
    currentNode?: string;
    failedNode?: string;
    error?: string;
    finishedAt?: string;
  },
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (extra?.currentNode !== undefined) updates['current_node'] = extra.currentNode;
  if (extra?.failedNode !== undefined) updates['failed_node'] = extra.failedNode;
  if (extra?.error !== undefined) updates['error'] = extra.error;
  if (extra?.finishedAt !== undefined) updates['finished_at'] = extra.finishedAt;

  const { error } = await supabaseAdmin.from('agent_jobs').update(updates).eq('id', jobId);
  if (error) throw new Error(`Failed to update job status: ${error.message}`);
}

/**
 * Create a new job step record (running status).
 * Returns the new step's UUID.
 */
export async function createJobStep(jobId: string, nodeName: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('agent_job_steps')
    .insert({
      job_id: jobId,
      node_name: nodeName,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) throw new Error(`Failed to create job step: ${error?.message ?? 'no data'}`);
  return data['id'] as string;
}

/**
 * Mark a job step as completed or failed.
 */
export async function completeJobStep(
  stepId: string,
  success: boolean,
  outputSummary?: string,
  errorMsg?: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('agent_job_steps')
    .update({
      status: success ? 'completed' : 'failed',
      finished_at: new Date().toISOString(),
      output_summary: outputSummary,
      error: errorMsg,
    })
    .eq('id', stepId);

  if (error) {
    // Non-fatal: log but don't throw — the main job should continue
    console.error(`[job-state-store] Failed to complete job step ${stepId}: ${error.message}`);
  }
}

/**
 * Claim the next queued job atomically using a Postgres RPC.
 * Uses FOR UPDATE SKIP LOCKED semantics to prevent duplicate processing.
 * Returns the job ID string, or null if no jobs are queued.
 */
export async function claimNextJob(): Promise<string | null> {
  const { data, error } = await supabaseAdmin.rpc('claim_next_agent_job');
  if (error) {
    console.error('[job-state-store] Error claiming job:', error.message);
    return null;
  }
  return (data as string | null);
}
