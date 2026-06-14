'use client';

import React, { useState, useRef } from 'react';

interface FileDropzoneProps {
  projectId: string;
  fileType: 'brand_factsheet' | 'image';
  accept: string;
  multiple?: boolean;
  title: string;
  description: string;
  warning?: string;
}

export function FileDropzone({
  projectId,
  fileType,
  accept,
  multiple = false,
  title,
  description,
  warning,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filesStatus, setFilesStatus] = useState<{ name: string; status: 'uploading' | 'success' | 'error'; message?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    const validFiles = multiple ? files : [files[0]];
    const filesToUpload = validFiles.filter((f): f is File => f !== undefined);
    
    if (filesToUpload.length === 0) return;

    setUploading(true);
    
    // Add to status list
    const newStatuses = filesToUpload.map(f => ({ name: f.name, status: 'uploading' as const }));
    setFilesStatus(prev => [...newStatuses, ...prev]);

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      try {
        const res = await fetch(`/api/projects/${projectId}/upload`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        
        setFilesStatus(prev => prev.map(s => 
          s.name === file.name 
            ? { ...s, status: data.ok ? 'success' : 'error', message: data.ok ? undefined : (data.error?.message || '업로드 실패') }
            : s
        ));
      } catch (err) {
        setFilesStatus(prev => prev.map(s => 
          s.name === file.name ? { ...s, status: 'error', message: '네트워크 오류' } : s
        ));
      }
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // reset input
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-700">클릭하여 파일 선택 또는 여기로 드래그</p>
          <p className="text-xs text-gray-500">최대 파일 크기: 50MB</p>
        </div>
      </div>

      {warning && (
        <div className="bg-amber-50 rounded-lg px-4 py-3 mt-4">
          <p className="text-sm text-amber-700">⚠️ {warning}</p>
        </div>
      )}

      {filesStatus.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
          {filesStatus.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded border border-gray-100">
              <span className="truncate max-w-[70%]">{file.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                file.status === 'uploading' ? 'bg-blue-100 text-blue-700' :
                file.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {file.status === 'uploading' ? '업로드 중...' : file.status === 'success' ? '완료' : '실패'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
