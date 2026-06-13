/**
 * Dashboard layout — wraps all (dashboard) route group pages.
 * Provides a simple top nav bar for authenticated users.
 */
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/projects"
            className="text-gray-900 font-semibold hover:text-blue-600 transition-colors"
          >
            Wedding Surface Agent
          </Link>
        </div>
      </header>
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
