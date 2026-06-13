'use client';

import { useState } from 'react';

interface Bundle {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  bundle_manifest: Record<string, unknown>;
  qa_report: Record<string, unknown>;
}

interface ExportCenterProps {
  projectId: string;
  tenantSlug: string;
  bundles: Bundle[];
}

const BUNDLE_STATUS_INFO: Record<string, { icon: string; label: string; color: string }> = {
  ready_for_zip: { icon: '✅', label: '다운로드 가능', color: 'text-green-700 bg-green-50 border-green-200' },
  blocked_by_qa: { icon: '🚫', label: 'QA 차단됨', color: 'text-red-700 bg-red-50 border-red-200' },
  packaging: { icon: '⏳', label: '패키징 중...', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  delivered: { icon: '📦', label: '전달 완료', color: 'text-gray-700 bg-gray-50 border-gray-200' },
};

export function ExportCenter({ projectId, tenantSlug, bundles }: ExportCenterProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (bundleId: string, jobId: string) => {
    setDownloading(bundleId);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/export/${bundleId}`, {
        method: 'GET',
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || '다운로드 실패');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brand_onboarding_bundle_${tenantSlug}_${jobId.substring(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : '다운로드 오류');
    } finally {
      setDownloading(null);
    }
  };

  if (bundles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h2 className="font-semibold text-gray-700 mb-2">익스포트 번들 없음</h2>
        <p className="text-gray-400 text-sm">에이전트를 실행하여 온보딩 번들을 생성하세요.</p>
      </div>
    );
  }

  const latestBundle = bundles[0];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Latest Bundle Highlight */}
      {latestBundle && (
        <div className="bg-white rounded-xl border-2 border-indigo-200 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">최신 번들</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(latestBundle.created_at).toLocaleString('ko-KR')} 생성
                </p>
                {latestBundle.bundle_manifest['asset_count'] !== undefined && (
                  <p className="text-sm text-gray-600 mt-1">
                    에셋 수: <span className="font-bold text-indigo-600">{String(latestBundle.bundle_manifest['asset_count'])}개</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    BUNDLE_STATUS_INFO[latestBundle.status]?.color ?? 'text-gray-700 bg-gray-50 border-gray-200'
                  }`}
                >
                  {BUNDLE_STATUS_INFO[latestBundle.status]?.icon} {BUNDLE_STATUS_INFO[latestBundle.status]?.label ?? latestBundle.status}
                </span>
                <button
                  onClick={() => void handleDownload(latestBundle.id, latestBundle.job_id)}
                  disabled={downloading === latestBundle.id || latestBundle.status === 'blocked_by_qa'}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {downloading === latestBundle.id ? (
                    <>⏳ 다운로드 중...</>
                  ) : (
                    <>📥 ZIP 다운로드</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bundle Sections */}
          {Array.isArray(latestBundle.bundle_manifest['bundle_sections']) && (
            <div className="px-6 py-4">
              <h3 className="text-xs font-medium text-gray-500 mb-2">번들 구성</h3>
              <div className="flex flex-wrap gap-2">
                {(latestBundle.bundle_manifest['bundle_sections'] as string[]).map((section) => (
                  <span key={section} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                    📁 {section}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* QA Summary */}
          {latestBundle.qa_report && (
            <div className="px-6 py-4 border-t border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 mb-2">QA 요약</h3>
              <div className="flex gap-3 text-xs">
                <span className="text-green-600">
                  ✅ 통과:{' '}
                  {
                    ((latestBundle.qa_report['gate_results'] as unknown[] | undefined) ?? []).filter(
                      (g) => (g as Record<string, unknown>)['status'] === 'pass',
                    ).length
                  }
                </span>
                <span className="text-yellow-600">
                  ⚠️ 경고:{' '}
                  {
                    ((latestBundle.qa_report['gate_results'] as unknown[] | undefined) ?? []).filter(
                      (g) => (g as Record<string, unknown>)['status'] === 'warning',
                    ).length
                  }
                </span>
                <span className="text-red-600">
                  ❌ 실패:{' '}
                  {
                    ((latestBundle.qa_report['gate_results'] as unknown[] | undefined) ?? []).filter(
                      (g) =>
                        (g as Record<string, unknown>)['status'] === 'fail' ||
                        (g as Record<string, unknown>)['status'] === 'blocked',
                    ).length
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bundle History */}
      {bundles.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">번들 이력</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {bundles.slice(1).map((bundle) => {
              const info = BUNDLE_STATUS_INFO[bundle.status];
              return (
                <div key={bundle.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {new Date(bundle.created_at).toLocaleString('ko-KR')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">잡 ID: {bundle.job_id.substring(0, 8)}...</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${info?.color ?? 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                      {info?.icon} {info?.label ?? bundle.status}
                    </span>
                    <button
                      onClick={() => void handleDownload(bundle.id, bundle.job_id)}
                      disabled={downloading === bundle.id || bundle.status === 'blocked_by_qa'}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                    >
                      다운로드
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Canonical Structure Info */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">📦 번들 구조 (Canonical)</h3>
        <pre className="text-xs text-gray-500 font-mono leading-relaxed">
{`brand_onboarding_bundle/
├── 01_upload/
│   ├── universal_content_assets_final.json
│   ├── brand_profiles.json
│   ├── gnb_ia_config.json
│   ├── gallery_albums.json
│   ├── gallery_photos.json
│   ├── album_taxonomy_nodes.json
│   └── visual_asset_url_map_master.json
├── 02_semantic_strategy/
├── 03_knowledge_graph/
├── 04_schema/
├── 05_ux_copy/
├── 06_visual_experience/
├── 08_manifests/
└── 09_qa/`}
        </pre>
      </div>
    </div>
  );
}
