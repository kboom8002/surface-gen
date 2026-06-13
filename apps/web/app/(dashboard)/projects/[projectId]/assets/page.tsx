import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { AssetEditor } from '@/components/asset-editor';

export default async function AssetEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, tenant_slug')
    .eq('id', projectId)
    .single();

  if (!project) notFound();

  const { data: assets } = await supabase
    .from('generated_assets')
    .select('id, uca_id, asset_type, category, title, slug, summary, status, review_status, sort_order, body_richtext, json_payload, created_at')
    .eq('project_id', projectId)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">에셋 에디터</h1>
        <p className="text-gray-500 mt-1">
          <span className="font-medium">{project.name as string}</span> — 생성된 UCA 에셋 검토 및 편집
        </p>
      </div>
      <AssetEditor
        projectId={projectId}
        assets={(assets ?? []) as Array<{
          id: string;
          uca_id: string;
          asset_type: string;
          category: string;
          title: string;
          slug: string;
          summary: string;
          status: string;
          review_status: string;
          sort_order: number;
          body_richtext?: string;
          json_payload?: Record<string, unknown>;
          created_at: string;
        }>}
      />
    </div>
  );
}
