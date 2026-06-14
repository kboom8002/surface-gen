import Link from 'next/link';
import LogoutButton from '@/components/logout-button';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/projects"
            className="text-gray-900 font-semibold hover:text-blue-600 transition-colors text-lg tracking-tight"
          >
            Wedding Surface Agent
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-650 font-medium bg-slate-50 border border-slate-100 rounded-full px-3 py-1 shadow-sm">
                  {user.email}
                </span>
                <span className="text-gray-300" aria-hidden="true">|</span>
                <LogoutButton />
              </>
            )}
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
