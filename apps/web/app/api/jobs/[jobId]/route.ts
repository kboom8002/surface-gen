import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/jobs/:jobId
 *
 * Returns job status, current_node, completed_nodes, and error state.
 * Used by the frontend to poll job progress.
 */

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 },
    );
  }

  const { data: job, error } = await supabase
    .from('agent_jobs')
    .select(
      'id, project_id, job_type, status, current_node, completed_nodes, failed_node, started_at, finished_at, error, created_at',
    )
    .eq('id', jobId)
    .single();

  if (error || !job) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Job not found' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, data: { job } });
}
