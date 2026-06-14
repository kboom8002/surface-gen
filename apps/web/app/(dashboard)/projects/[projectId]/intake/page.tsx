import Link from 'next/link';
import { FileDropzone } from '@/components/FileDropzone';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function IntakePage({ params }: Props) {
  const { projectId } = await params;
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
          ← 프로젝트
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">소스 입력</h1>
      </div>
      <div className="grid gap-6">
        <FileDropzone 
          projectId={projectId}
          fileType="brand_factsheet"
          title="Brand Factsheet 업로드"
          description="브랜드 정보 문서를 업로드하세요 (md, txt, docx, pdf, json)"
          accept=".md,.txt,.docx,.pdf,.json,application/json,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />

        <FileDropzone 
          projectId={projectId}
          fileType="image"
          title="이미지 업로드"
          description="최소 20장, 최대 100장의 웨딩 사진을 업로드하세요"
          accept="image/*"
          multiple={true}
          warning="권리 상태를 확인하지 않은 이미지는 공개 표면에 사용할 수 없습니다."
        />
      </div>
    </main>
  );
}
