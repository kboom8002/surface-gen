import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * POST /api/projects/:projectId/jobs/run
 *
 * Creates a queued job record in `agent_jobs`.
 * A separate worker process (apps/worker) polls and claims jobs via the claim_next_agent_job RPC.
 */

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { projectId } = await params;
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

  // Verify project access
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();
  if (!project) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } },
      { status: 404 },
    );
  }

  // Admin client for bypassing RLS
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Enforce max 1 active job per project
  const { data: activeJob } = await adminSupabase
    .from('agent_jobs')
    .select('id, status')
    .eq('project_id', projectId)
    .in('status', ['queued', 'running', 'paused', 'review_required'])
    .maybeSingle();

  if (activeJob) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'JOB_ALREADY_ACTIVE',
          message: `프로젝트에 이미 활성 Job이 있습니다: ${activeJob.status}`,
        },
      },
      { status: 409 },
    );
  }

  // Create job record
  const { data: job, error } = await adminSupabase
    .from('agent_jobs')
    .insert({
      project_id: projectId,
      job_type: 'full_factory',
      status: 'queued',
      requested_by: user.id,
    })
    .select('id, status')
    .single();

  if (error || !job) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'DB_ERROR', message: error?.message ?? 'Failed to create job' },
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true, data: { jobId: job.id, status: 'queued' } },
    { status: 201 },
  );
}
