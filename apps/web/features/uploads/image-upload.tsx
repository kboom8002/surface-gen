'use client';
/**
 * Image Upload component.
 *
 * Supports batch upload of 20-100 wedding images (jpeg, png, webp).
 * Max size per image: 25 MB
 *
 * Calls POST /api/projects/:projectId/images once per file.
 * Rights metadata defaults to unknown — see ImageRightsEditor to update.
 */
import { useState, useRef } from 'react';

interface UploadedImage {
  imageId: string;
  fileName: string;
  rightsStatus: string;
  publicUseAllowed: boolean;
}

interface FailedUpload {
  fileName: string;
  reason: string;
}

interface Props {
  projectId: string;
  onComplete?: (uploaded: UploadedImage[], failed: FailedUpload[]) => void;
}

export function ImageUpload({ projectId, onComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<{
    uploaded: UploadedImage[];
    failed: FailedUpload[];
  } | null>(null);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setProgress({ done: 0, total: files.length });
    const uploaded: UploadedImage[] = [];
    const failed: FailedUpload[] = [];

    for (const file of files) {
      try {
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(`/api/projects/${projectId}/images`, {
          method: 'POST',
          body: form,
        });

        const data = (await res.json()) as {
          ok: boolean;
          data?: UploadedImage;
          error?: { message: string };
        };

        if (!res.ok || !data.ok) {
          failed.push({ fileName: file.name, reason: data.error?.message ?? 'Upload failed' });
        } else {
          uploaded.push(data.data!);
        }
      } catch {
        failed.push({ fileName: file.name, reason: '네트워크 오류' });
      }

      setProgress((p) => p && { ...p, done: p.done + 1 });
    }

    setUploading(false);
    setResults({ uploaded, failed });
    onComplete?.(uploaded, failed);

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        className="hidden"
        id={`image-upload-${projectId}`}
        onChange={handleFilesChange}
        disabled={uploading}
      />
      <label
        htmlFor={`image-upload-${projectId}`}
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-amber-300 hover:border-amber-500 hover:bg-amber-50'
        }`}
      >
        {uploading && progress ? (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              업로드 중… {progress.done} / {progress.total}
            </p>
            <div className="mt-2 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600">클릭하여 이미지 선택 (다중 선택 가능)</p>
            <p className="text-xs text-gray-400 mt-1">jpg, png, webp · 최대 25 MB · 20~100장</p>
          </div>
        )}
      </label>

      {results && (
        <div className="space-y-2">
          {results.uploaded.length > 0 && (
            <p className="text-green-700 text-sm">✓ {results.uploaded.length}장 업로드 완료</p>
          )}
          {results.failed.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium mb-1">
                {results.failed.length}장 실패
              </p>
              <ul className="text-xs text-red-600 space-y-1">
                {results.failed.map((f, i) => (
                  <li key={i}>
                    {f.fileName}: {f.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-amber-50 rounded-lg px-4 py-3">
            <p className="text-sm text-amber-700">
              ⚠️ 업로드된 이미지의 권리 상태는 기본적으로 &quot;미확인&quot;입니다. 공개 사용 전
              반드시 권리를 검토하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
