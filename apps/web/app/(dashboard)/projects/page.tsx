import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('id, official_brand_name, tenant_slug, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">프로젝트</h1>
        <Link
          href="/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          새 프로젝트
        </Link>
      </div>
      {!projects || projects.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">아직 프로젝트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {project.official_brand_name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">@{project.tenant_slug}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
