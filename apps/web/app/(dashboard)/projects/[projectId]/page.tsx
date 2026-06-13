import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  if (!project) notFound();

  const navItems = [
    { href: `/projects/${projectId}/intake`, label: '📋 소스 입력' },
    { href: `/projects/${projectId}/console`, label: '🚀 잡 콘솔' },
    { href: `/projects/${projectId}/assets`, label: '📄 에셋 편집' },
    { href: `/projects/${projectId}/visuals`, label: '🖼️ 사진 편집' },
    { href: `/projects/${projectId}/qa`, label: '✅ QA 센터' },
    { href: `/projects/${projectId}/export`, label: '📦 내보내기' },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/projects" className="text-blue-600 hover:underline text-sm">
          ← 프로젝트 목록
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          {project.official_brand_name}
        </h1>
        <p className="mt-1 text-gray-500">
          @{project.tenant_slug} · {project.industry_type}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center font-medium text-gray-700"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
