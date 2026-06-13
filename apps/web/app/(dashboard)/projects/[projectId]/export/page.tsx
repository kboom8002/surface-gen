import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ExportCenter } from '@/components/export-center';

export default async function ExportCenterPage({
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

  const { data: bundles } = await supabase
    .from('export_bundles')
    .select('id, job_id, status, created_at, bundle_manifest, qa_report')
    .eq('project_id', params.projectId)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">익스포트 센터</h1>
        <p className="text-gray-500 mt-1">
          <span className="font-medium">{project.name as string}</span> — 온보딩 번들 다운로드
        </p>
      </div>
      <ExportCenter
        projectId={params.projectId}
        tenantSlug={project.tenant_slug as string}
        bundles={(bundles ?? []) as Array<{
          id: string;
          job_id: string;
          status: string;
          created_at: string;
          bundle_manifest: Record<string, unknown>;
          qa_report: Record<string, unknown>;
        }>}
      />
    </div>
  );
}
