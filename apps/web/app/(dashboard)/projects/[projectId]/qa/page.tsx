import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { QaCenter } from '@/components/qa-center';

export default async function QaCenterPage({
  params,
}: {
  params: { projectId: string };
}) {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, tenant_slug')
    .eq('id', params.projectId)
    .single();

  if (!project) notFound();

  // Get the latest job's QA results
  const { data: latestJob } = await supabase
    .from('agent_jobs')
    .select('id, status, completed_at')
    .eq('project_id', params.projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let qaData = null;
  if (latestJob) {
    const { data: bundle } = await supabase
      .from('export_bundles')
      .select('qa_report, status')
      .eq('job_id', latestJob.id)
      .single();
    qaData = bundle;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QA 센터</h1>
        <p className="text-gray-500 mt-1">
          <span className="font-medium">{project.name as string}</span> — 12 게이트 품질 검증 결과
        </p>
      </div>
      <QaCenter
        qaReport={(qaData as { qa_report: Record<string, unknown>; status: string } | null)?.qa_report ?? null}
        bundleStatus={(qaData as { status: string } | null)?.status ?? null}
      />
    </div>
  );
}
