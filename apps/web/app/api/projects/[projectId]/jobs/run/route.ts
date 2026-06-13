import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * POST /api/projects/:projectId/jobs/run
 *
 * CRITICAL: This route handler NEVER executes LangGraph or any long-running model call.
 * It only creates a queued job record in `agent_jobs`.
 * The worker process polls `agent_jobs` and claims/runs jobs.
 *
 * See: docs/backend/JOB_QUEUE_SPEC.md §4 (Postgres-backed MVP Queue)
 */

const RunJobSchema = z.object({
  jobType: z.enum(['full_factory', 'partial_regeneration', 'qa_only', 'export_only']),
  options: z
    .object({
      startNode: z.string().optional(),
      targetAssetIds: z.array(z.string()).optional(),
      skipHumanReview: z.boolean().optional(),
      maxImages: z.number().int().positive().optional(),
    })
    .optional(),
});

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

  const body = (await request.json()) as unknown;
  const parsed = RunJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid job request',
          details: parsed.error.errors,
        },
      },
      { status: 400 },
    );
  }

  // Enforce max 1 active job per project (per JOB_QUEUE_SPEC.md §9)
  const { data: activeJob } = await supabase
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

  const { data: job, error } = await supabase
    .from('agent_jobs')
    .insert({
      project_id: projectId,
      job_type: parsed.data.jobType,
      status: 'queued',
      options: parsed.data.options ?? {},
      completed_nodes: [],
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
