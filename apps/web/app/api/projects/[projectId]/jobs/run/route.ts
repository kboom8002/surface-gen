import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse, after } from 'next/server';

export const maxDuration = 60;

/**
 * POST /api/projects/:projectId/jobs/run
 *
 * Creates a queued job record in `agent_jobs`, then runs a lightweight
 * in-process simulated pipeline that records steps to `agent_job_steps`.
 *
 * For MVP, this runs inline. In production, a separate worker process
 * would poll and claim jobs via the claim_next_agent_job RPC.
 */

const PIPELINE_NODES = [
  { name: 'intake_audit', label: '입력 검증' },
  { name: 'brand_truth', label: '브랜드 진실 추출' },
  { name: 'semantic_strategy', label: '시맨틱 전략 수립' },
  { name: 'knowledge_graph', label: '지식 그래프 구축' },
  { name: 'gnb_ia', label: 'GNB/IA 설계' },
  { name: 'photo_inventory', label: '사진 인벤토리 구축' },
  { name: 'photo_taxonomy', label: '사진 분류 체계' },
  { name: 'portfolio_generation', label: '포트폴리오 생성' },
  { name: 'catalog_generation', label: '카탈로그 생성' },
  { name: 'answer_generation', label: '답변 콘텐츠 생성' },
  { name: 'about_contact_generation', label: '소개/연락처 생성' },
  { name: 'copy_system', label: 'UX 카피 시스템' },
  { name: 'validation_gates', label: 'QA 검증 게이트' },
  { name: 'json_export', label: 'JSON 익스포트' },
];

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

  // Return immediately, but use Next.js `after()` to ensure the background task
  // is allowed to run to completion in Vercel Serverless environments.
  after(() => {
    return runPipeline(adminSupabase, job.id as string, projectId);
  });

  return NextResponse.json(
    { ok: true, data: { jobId: job.id, status: 'queued' } },
    { status: 201 },
  );
}

/**
 * MVP simulated pipeline execution.
 * Records step-by-step progress to agent_job_steps for UI display.
 * In production, replaced by LangGraph worker.
 */
// @ts-ignore
async function runPipeline(supabase: any, jobId: string, projectId: string) {
  try {
    // Mark job as running
    await supabase
      .from('agent_jobs')
      .update({ status: 'running', started_at: new Date().toISOString(), current_node: PIPELINE_NODES[0]?.name })
      .eq('id', jobId);

    for (let i = 0; i < PIPELINE_NODES.length; i++) {
      const node = PIPELINE_NODES[i];
      if (!node) continue;

      // Update current node
      await supabase
        .from('agent_jobs')
        .update({ current_node: node.name, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      // Create step as running
      const { data: step } = await supabase
        .from('agent_job_steps')
        .insert({
          job_id: jobId,
          project_id: projectId,
          node_name: node.name,
          step_index: i,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      // Simulate processing (1-3 seconds)
      const processingTime = 1000 + Math.random() * 2000;
      await new Promise((resolve) => setTimeout(resolve, processingTime));

      // Mark step completed
      if (step) {
        await supabase
          .from('agent_job_steps')
          .update({
            status: 'completed',
            finished_at: new Date().toISOString(),
            duration_ms: Math.round(processingTime),
            message: `${node.label} 완료`,
          })
          .eq('id', step.id);
      }
    }

    // Mark job completed
    await supabase
      .from('agent_jobs')
      .update({
        status: 'completed',
        current_node: null,
        finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  } catch (err) {
    console.error('Pipeline error:', err);
    await supabase
      .from('agent_jobs')
      .update({
        status: 'failed',
        error: { message: String(err) },
        finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}
