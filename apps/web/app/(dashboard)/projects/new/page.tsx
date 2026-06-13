'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({ officialBrandName: '', tenantSlug: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        ok: boolean;
        data?: { projectId: string };
        error?: { message: string };
      };
      if (!res.ok || !data.ok) {
        setError(data.error?.message ?? '프로젝트 생성에 실패했습니다.');
        return;
      }
      router.push(`/projects/${data.data!.projectId}`);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">새 프로젝트</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-xl border border-gray-200"
      >
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="officialBrandName"
          >
            브랜드 공식명 *
          </label>
          <input
            id="officialBrandName"
            type="text"
            required
            value={form.officialBrandName}
            onChange={(e) => setForm((f) => ({ ...f, officialBrandName: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="스튜디오 블랑"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="tenantSlug"
          >
            테넌트 슬러그 * (영소문자, 숫자, 하이픈)
          </label>
          <input
            id="tenantSlug"
            type="text"
            required
            pattern="[a-z0-9-]+"
            value={form.tenantSlug}
            onChange={(e) =>
              setForm((f) => ({ ...f, tenantSlug: e.target.value.toLowerCase() }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="studio-blanc"
          />
        </div>
        <div className="bg-blue-50 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-700">
            <span className="font-medium">업종:</span> wedding_sdm (고정)
          </p>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '생성 중...' : '프로젝트 생성'}
        </button>
      </form>
    </main>
  );
}
