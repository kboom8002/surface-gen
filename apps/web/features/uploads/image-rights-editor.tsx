'use client';
/**
 * Image Rights Editor component.
 *
 * Allows updating rights_status, consent_status, public_use_allowed,
 * contains_face, contains_logo, contains_customer_name for a source image.
 *
 * Calls PATCH /api/projects/:projectId/images/:imageId
 *
 * CRITICAL: public_use_allowed must only be set to true after explicit human
 * review. This component displays warnings when face/customer data are present.
 */
import { useState } from 'react';

type RightsStatus = 'approved' | 'review_required' | 'restricted' | 'rejected' | 'unknown';
type ConsentStatus = 'approved' | 'review_required' | 'restricted' | 'unknown';

interface ImageRightsState {
  rightsStatus: RightsStatus;
  consentStatus: ConsentStatus;
  publicUseAllowed: boolean;
  containsFace: boolean | null;
  containsLogo: boolean | null;
  containsCustomerName: boolean | null;
  rightsNote?: string;
}

interface Props {
  projectId: string;
  imageId: string;
  fileName: string;
  initial: ImageRightsState;
  onSaved?: (updated: ImageRightsState) => void;
}

const RIGHTS_OPTIONS: { value: RightsStatus; label: string }[] = [
  { value: 'unknown', label: '미확인' },
  { value: 'review_required', label: '검토 필요' },
  { value: 'approved', label: '승인됨' },
  { value: 'restricted', label: '제한됨' },
  { value: 'rejected', label: '거부됨' },
];

const CONSENT_OPTIONS: { value: ConsentStatus; label: string }[] = [
  { value: 'unknown', label: '미확인' },
  { value: 'review_required', label: '검토 필요' },
  { value: 'approved', label: '동의 있음' },
  { value: 'restricted', label: '제한됨' },
];

export function ImageRightsEditor({ projectId, imageId, fileName, initial, onSaved }: Props) {
  const [form, setForm] = useState<ImageRightsState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/projects/${projectId}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        ok: boolean;
        data?: ImageRightsState;
        error?: { message: string };
      };
      if (!res.ok || !data.ok) {
        setError(data.error?.message ?? '저장에 실패했습니다.');
        return;
      }
      setSaved(true);
      onSaved?.(form);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const hasFaceWarning = form.containsFace === true;
  const hasNameWarning = form.containsCustomerName === true;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>

      {/* Rights Status */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">권리 상태</label>
        <select
          value={form.rightsStatus}
          onChange={(e) =>
            setForm((f) => ({ ...f, rightsStatus: e.target.value as RightsStatus }))
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {RIGHTS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Consent Status */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">동의 상태</label>
        <select
          value={form.consentStatus}
          onChange={(e) =>
            setForm((f) => ({ ...f, consentStatus: e.target.value as ConsentStatus }))
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CONSENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Flags */}
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ['containsFace', '얼굴 포함'],
            ['containsLogo', '로고 포함'],
            ['containsCustomerName', '고객명 포함'],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <select
              value={form[key] === null ? 'null' : form[key] ? 'true' : 'false'}
              onChange={(e) => {
                const val = e.target.value === 'null' ? null : e.target.value === 'true';
                setForm((f) => ({ ...f, [key]: val }));
              }}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="null">미확인</option>
              <option value="true">예</option>
              <option value="false">아니오</option>
            </select>
          </div>
        ))}
      </div>

      {/* Public use toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={`pub-${imageId}`}
          checked={form.publicUseAllowed}
          onChange={(e) => setForm((f) => ({ ...f, publicUseAllowed: e.target.checked }))}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor={`pub-${imageId}`} className="text-sm text-gray-700">
          공개 표면 사용 허용
        </label>
      </div>

      {/* Warnings */}
      {(hasFaceWarning || hasNameWarning) && form.publicUseAllowed && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-xs text-red-700">
            ⚠️{' '}
            {[hasFaceWarning && '얼굴', hasNameWarning && '고객명'].filter(Boolean).join(' · ')}이
            포함된 이미지를 공개 사용으로 설정했습니다. 반드시 동의를 확인하세요.
          </p>
        </div>
      )}

      {/* Rights note */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">메모 (선택)</label>
        <textarea
          value={form.rightsNote ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, rightsNote: e.target.value }))}
          rows={2}
          maxLength={2000}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="권리 출처, 계약 번호 등"
        />
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
      {saved && <p className="text-green-600 text-xs">✓ 저장되었습니다.</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? '저장 중...' : '저장'}
      </button>
    </div>
  );
}
