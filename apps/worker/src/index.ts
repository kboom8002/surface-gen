/**
 * apps/worker/src/index.ts
 *
 * Worker entrypoint for the Wedding Surface Factory.
 *
 * SECURITY: This is the ONLY context in which SUPABASE_SERVICE_ROLE_KEY is used.
 * Never import this module from apps/web or packages/*.
 *
 * Polling pattern:
 *   - Call claim_next_agent_job RPC (FOR UPDATE SKIP LOCKED)
 *   - If a job is claimed, run it to completion
 *   - Sleep POLL_INTERVAL_MS, then repeat
 *
 * Long-running jobs never run inside Next.js route handlers.
 * Route handlers create the job record and return a job ID;
 * this worker picks up the job and runs the LangGraph graph.
 */

import {
  claimNextJob,
  updateJobStatus,
} from './services/job-state-store';
import { buildWeddingSurfaceFactoryGraph } from './graphs/wedding-surface-factory.graph';
import { createInitialState } from './state/factory-job-state';
import { supabaseAdmin } from './services/supabase-admin';

const POLL_INTERVAL_MS = 5_000;

/**
 * Run a single claimed job from start to finish.
 */
export async function runJob(jobId: string): Promise<void> {
  console.log(`[Worker] Starting job: ${jobId}`);
  await updateJobStatus(jobId, 'running', { currentNode: 'intake_audit' });

  // Load the job record to get project_id
  const { data: jobRow, error: jobErr } = await supabaseAdmin
    .from('agent_jobs')
    .select('project_id, state')
    .eq('id', jobId)
    .single();

  if (jobErr || !jobRow) {
    await updateJobStatus(jobId, 'failed', { error: 'Could not load job from DB' });
    return;
  }

  // Load the associated project to get tenant info
  const { data: project, error: projErr } = await supabaseAdmin
    .from('projects')
    .select('id, tenant_slug, official_brand_name')
    .eq('id', jobRow['project_id'] as string)
    .single();

  if (projErr || !project) {
    await updateJobStatus(jobId, 'failed', { error: 'Project not found' });
    return;
  }

  // Load source files and images for inputs
  const { data: files } = await supabaseAdmin
    .from('source_files')
    .select('id')
    .eq('project_id', project['id'] as string)
    .in('file_type', ['brand_factsheet', 'other']);

  const { data: images } = await supabaseAdmin
    .from('source_images')
    .select('id')
    .eq('project_id', project['id'] as string);

  // Build initial state
  const state = createInitialState({
    jobId,
    projectId: project['id'] as string,
    tenantId: project['id'] as string,
    tenantSlug: project['tenant_slug'] as string,
    inputs: {
      brandFactsheetFileIds: files?.map(f => f.id as string) || [],
      imageFileIds: images?.map(i => i.id as string) || [],
      preferredLanguage: 'ko',
    },
  });

  try {
    const graph = buildWeddingSurfaceFactoryGraph();
    const result = await graph.invoke(state);
    await updateJobStatus(jobId, 'completed', {
      finishedAt: new Date().toISOString(),
    });
    console.log(`[Worker] Job ${jobId} completed. Final node: ${String((result as { runtime?: { currentNode?: string } }).runtime?.currentNode ?? 'unknown')}`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await updateJobStatus(jobId, 'failed', {
      error: errorMsg,
      finishedAt: new Date().toISOString(),
    });
    console.error(`[Worker] Job ${jobId} failed:`, errorMsg);
  }
}

/**
 * Main polling loop — runs forever.
 * In production, run inside a supervised container (e.g. Cloud Run Job, Fly Machine).
 */
async function pollLoop(): Promise<void> {
  console.log('[Worker] Wedding Surface Factory Worker starting — polling for jobs...');
  while (true) {
    try {
      const jobId = await claimNextJob();
      if (jobId) {
        await runJob(jobId);
      }
    } catch (err) {
      console.error('[Worker] Unhandled poll error:', err);
    }
    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Only run the poll loop if this file is executed directly (e.g., via tsx)
// In Vercel serverless environments, we import runJob directly and do not want to poll.
if (process.argv[1]?.includes('index.ts') || process.argv[1]?.includes('worker')) {
  void pollLoop();
}
