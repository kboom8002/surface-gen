'use client';
/**
 * Brand Factsheet Upload component.
 *
 * Supports: md, txt, docx, pdf, json (per docs/06_STORAGE_AND_FILE_SPEC.md §9)
 * Max size: 20 MB
 *
 * This component calls POST /api/projects/:projectId/files
 */
import { useState, useRef } from 'react';

interface Props {
  projectId: string;
  onSuccess?: (sourceFileId: string, fileName: string) => void;
}

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/plain',
  'application/json',
].join(',');

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.md,.txt,.json';

export function BrandFactsheetUpload({ projectId, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('fileType', 'brand_factsheet');

      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: form,
      });

      const data = (await res.json()) as {
        ok: boolean;
        data?: { sourceFileId: string; fileName: string };
        error?: { message: string };
      };

      if (!res.ok || !data.ok) {
        setError(data.error?.message ?? '업로드에 실패했습니다.');
        return;
      }

      const result = data.data!;
      setUploadedFile({ id: result.sourceFileId, name: result.fileName });
      onSuccess?.(result.sourceFileId, result.fileName);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        id={`factsheet-upload-${projectId}`}
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label
        htmlFor={`factsheet-upload-${projectId}`}
        className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
        }`}
      >
        {uploading ? (
          <span className="text-sm text-gray-500">업로드 중...</span>
        ) : (
          <span className="text-sm text-gray-600">
            클릭하여 파일 선택 (pdf, docx, md, txt, json · 최대 20 MB)
          </span>
        )}
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {uploadedFile && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <span className="text-green-700 text-sm font-medium">✓</span>
          <span className="text-green-700 text-sm">{uploadedFile.name}</span>
        </div>
      )}
    </div>
  );
}
