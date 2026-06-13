import Link from 'next/link';

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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Brand Factsheet 업로드</h2>
          <p className="text-sm text-gray-500 mb-4">
            브랜드 정보 문서를 업로드하세요 (md, txt, docx, pdf, json)
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">이미지 업로드</h2>
          <p className="text-sm text-gray-500 mb-4">
            최소 20장, 최대 100장의 웨딩 사진을 업로드하세요
          </p>
          <div className="bg-amber-50 rounded-lg px-4 py-3 mt-2">
            <p className="text-sm text-amber-700">
              ⚠️ 권리 상태를 확인하지 않은 이미지는 공개 표면에 사용할 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
