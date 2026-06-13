'use client';

import { useState, useMemo } from 'react';

interface Asset {
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
}

interface AssetEditorProps {
  projectId: string;
  assets: Asset[];
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  about_brand: '브랜드 소개',
  brand_story: '브랜드 스토리',
  portfolio: '포트폴리오',
  portfolio_docent: '포트폴리오 도슨트',
  style_collection: '스타일 컬렉션',
  program: '프로그램',
  policy_card: '정책 카드',
  process_step: '프로세스',
  answer: '자주 묻는 질문',
  article: '아티클',
  contact_info: '연락처',
};

function getReviewStatusClass(status: string): string {
  switch (status) {
    case 'pending_review': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'review_required': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'approved': return 'bg-green-50 text-green-700 border-green-200';
    case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-50 text-gray-500 border-gray-200';
  }
}

function getReviewStatusLabel(status: string): string {
  switch (status) {
    case 'pending_review': return '검토 대기';
    case 'review_required': return '필수 검토';
    case 'approved': return '승인됨';
    case 'rejected': return '반려됨';
    default: return status;
  }
}

function getAssetTypeLabel(type: string): string {
  return ASSET_TYPE_LABELS[type] ?? type;
}

export function AssetEditor({ projectId, assets }: AssetEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(assets[0]?.id ?? null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(assets.map((a) => a.category)))],
    [assets],
  );
  const filtered = useMemo(
    () =>
      assets.filter(
        (a) =>
          (filterCategory === 'all' || a.category === filterCategory) &&
          (filterStatus === 'all' || a.review_status === filterStatus),
      ),
    [assets, filterCategory, filterStatus],
  );

  const selected = assets.find((a) => a.id === selectedId) ?? null;

  const handleApprove = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/assets/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: 'approved' }),
      });
      if (res.ok) setSaveMsg('✅ 승인 완료');
      else setSaveMsg('❌ 오류 발생');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? '전체 카테고리' : c}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
          >
            <option value="all">전체 상태</option>
            <option value="pending_review">검토 대기</option>
            <option value="review_required">필수 검토</option>
            <option value="approved">승인됨</option>
          </select>
        </div>
        <div className="text-xs text-gray-400 px-3 py-2 border-b border-gray-50">
          {filtered.length}개 에셋
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setSelectedId(asset.id)}
              className={
                'w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors' +
                (selectedId === asset.id ? ' bg-indigo-50 border-r-2 border-indigo-400' : '')
              }
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{asset.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {getAssetTypeLabel(asset.asset_type)}
                  </p>
                </div>
                <span
                  className={
                    'flex-shrink-0 text-xs px-1.5 py-0.5 rounded border ' +
                    getReviewStatusClass(asset.review_status)
                  }
                >
                  {getReviewStatusLabel(asset.review_status)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">{selected.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {getAssetTypeLabel(selected.asset_type)} &middot; /{selected.slug}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saveMsg !== null && <span className="text-xs text-gray-500">{saveMsg}</span>}
              <button
                onClick={() => void handleApprove()}
                disabled={isSaving || selected.review_status === 'approved'}
                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? '저장 중...' : '✓ 승인'}
              </button>
            </div>
          </div>

          <div className="px-6 py-3 border-b border-gray-50 flex gap-4 text-xs text-gray-500">
            <span>
              {'상태: '}
              <span className={'font-medium px-1.5 py-0.5 rounded border ' + getReviewStatusClass(selected.review_status)}>
                {getReviewStatusLabel(selected.review_status)}
              </span>
            </span>
            <span>{'카테고리: ' + selected.category}</span>
            <span>{'정렬: ' + String(selected.sort_order)}</span>
          </div>

          {selected.json_payload?.['seo_title'] !== undefined && (
            <div className="px-6 py-3 border-b border-gray-50 bg-blue-50 text-xs space-y-1">
              <p>
                <span className="text-gray-500">SEO 제목: </span>
                <span className="text-blue-700 font-medium">{String(selected.json_payload['seo_title'])}</span>
              </p>
              {selected.json_payload['meta_description'] !== undefined && (
                <p>
                  <span className="text-gray-500">메타 설명: </span>
                  <span className="text-gray-700">{String(selected.json_payload['meta_description'])}</span>
                </p>
              )}
            </div>
          )}

          {selected.review_status === 'review_required' && (
            <div className="mx-6 mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
              {'⚠️ 이 에셋은 인간 검토가 필요합니다. 가격, 연락처, 또는 정책 정보를 포함할 수 있습니다.'}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div
              dangerouslySetInnerHTML={{ __html: selected.body_richtext ?? '' }}
              className="text-gray-700 leading-relaxed text-sm"
            />
          </div>

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              <span className="font-medium">요약: </span>
              {selected.summary}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
          <p className="text-gray-400 text-sm">에셋을 선택하세요</p>
        </div>
      )}
    </div>
  );
}
