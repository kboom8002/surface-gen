import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { JobConsole } from '@/components/job-console';

export default async function JobConsolePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('id, official_brand_name, tenant_slug, status')
    .eq('id', projectId)
    .single();

  if (!project) notFound();

  const { data: jobs } = await supabase
    .from('agent_jobs')
    .select('id, status, created_at, updated_at, completed_at, error_message, current_node')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(10);

  const latestJob = jobs?.[0] ?? null;
  let steps: Array<{ id: string; node_name: string; status: string; created_at: string; message?: string }> = [];

  if (latestJob) {
    const { data: jobSteps } = await supabase
      .from('agent_job_steps')
      .select('id, node_name, status, created_at, updated_at, message, error_message')
      .eq('job_id', latestJob.id)
      .order('created_at', { ascending: true });
    steps = jobSteps ?? [];
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">잡 콘솔</h1>
        <p className="text-gray-500 mt-1">
          <span className="font-medium">{project.official_brand_name as string}</span> — AI 에이전트 실행 현황
        </p>
      </div>
      <JobConsole
        projectId={projectId}
        project={{ id: project.id as string, name: project.official_brand_name as string, tenantSlug: project.tenant_slug as string }}
        latestJob={latestJob as {
          id: string;
          status: string;
          created_at: string;
          updated_at: string;
          completed_at?: string;
          current_node?: string;
          error_message?: string;
        } | null}
        steps={steps}
        allJobs={(jobs ?? []) as Array<{ id: string; status: string; created_at: string }> }
      />
    </div>
  );
}
