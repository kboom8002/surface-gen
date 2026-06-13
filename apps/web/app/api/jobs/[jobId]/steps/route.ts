import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/jobs/:jobId/steps
 *
 * Returns step-level execution trace for a job.
 * Each row corresponds to one node execution in the LangGraph workflow.
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

  const { data: steps, error } = await supabase
    .from('agent_job_steps')
    .select('id, node_name, status, started_at, finished_at, output_summary, error')
    .eq('job_id', jobId)
    .order('started_at', { ascending: true });

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data: { steps: steps ?? [] } });
}
