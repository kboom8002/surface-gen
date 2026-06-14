'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface JobStep {
  id: string;
  node_name: string;
  status: string;
  created_at: string;
  message?: string;
  error_message?: string;
}

interface Job {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  current_node?: string;
  error_message?: string;
}

interface JobConsoleProps {
  projectId: string;
  project: { id: string; name: string; tenantSlug: string };
  latestJob: Job | null;
  steps: JobStep[];
  allJobs: Array<{ id: string; status: string; created_at: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-700',
  running: 'bg-blue-100 text-blue-700 animate-pulse',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  review_required: 'bg-yellow-100 text-yellow-700',
  paused: 'bg-orange-100 text-orange-700',
};

const NODE_LABELS: Record<string, string> = {
  intake_audit: '입력 검증',
  brand_truth: '브랜드 진실 추출',
  semantic_strategy: '시맨틱 전략',
  knowledge_graph: '지식 그래프',
  gnb_ia: 'GNB/IA 설계',
  photo_inventory: '사진 인벤토리',
  photo_taxonomy: '사진 분류',
  photo_docent: '사진 도슨트',
  visual_experience: '비주얼 경험 맵',
  portfolio_generation: '포트폴리오 생성',
  catalog_generation: '카탈로그 생성',
  answer_generation: '답변 콘텐츠',
  article_generation: '아티클 생성',
  about_contact_generation: '소개/연락처',
  copy_system: 'UX 카피 시스템',
  ai_visual_os: 'AI 비주얼 브리프',
  crosslink_schema: '크로스링크/스키마',
  ssot_materialization: 'SSoT 구체화',
  validation_gates: 'QA 검증 게이트',
  json_export: 'JSON 익스포트',
  zip_packaging: 'ZIP 패키징',
};

export function JobConsole({ projectId, project, latestJob, steps, allJobs }: JobConsoleProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [localJob, setLocalJob] = useState<Job | null>(latestJob);
  const [localSteps, setLocalSteps] = useState<JobStep[]>(steps);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepsEndRef = useRef<HTMLDivElement | null>(null);

  // Sync with SSR props on router.refresh()
  useEffect(() => {
    setLocalJob(latestJob);
  }, [latestJob]);

  useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  const isRunning = localJob?.status === 'running' || localJob?.status === 'queued';

  // Auto-scroll steps to bottom
  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localSteps]);

  // Poll for updates while running
  useEffect(() => {
    if (!isRunning) return;
    pollRef.current = setInterval(() => {
      router.refresh();
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isRunning, router]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startJob = async () => {
    setIsStarting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/jobs/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrorMsg(data.error?.message || '에이전트 실행에 실패했습니다.');
        return;
      }
      // Start polling for updates
      router.refresh();
    } catch (e) {
      console.error('Failed to start job:', e);
      setErrorMsg('네트워크 오류가 발생했습니다.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => void startJob()}
          disabled={isStarting || isRunning}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {isStarting ? '시작 중...' : isRunning ? '실행 중...' : '🚀 에이전트 실행'}
        </button>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          🔄 새로고침
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>❌ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 text-xs ml-2">
            닫기
          </button>
        </div>
      )}

      {/* Current Job Status */}
      {localJob ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">최근 잡</h2>
              <p className="text-xs text-gray-400 mt-0.5">ID: {localJob.id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[localJob.status] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {localJob.status}
            </span>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">시작</p>
              <p className="font-medium text-gray-800">
                {new Date(localJob.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-gray-400">현재 노드</p>
              <p className="font-medium text-gray-800">
                {localJob.current_node
                  ? (NODE_LABELS[localJob.current_node] ?? localJob.current_node)
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-400">완료</p>
              <p className="font-medium text-gray-800">
                {localJob.completed_at
                  ? new Date(localJob.completed_at).toLocaleString('ko-KR')
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-400">단계</p>
              <p className="font-medium text-gray-800">{localSteps.length}개</p>
            </div>
          </div>
          {localJob.error_message && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ❌ {localJob.error_message}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400 text-sm">아직 실행된 잡이 없습니다. 에이전트를 실행해보세요.</p>
        </div>
      )}

      {/* Step Timeline */}
      {localSteps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">실행 단계</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-50">
              {localSteps.map((step, idx) => (
                <div key={step.id} className="px-6 py-3 flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'completed' ? (
                      <span className="text-green-500 text-sm">✅</span>
                    ) : step.status === 'failed' ? (
                      <span className="text-red-500 text-sm">❌</span>
                    ) : step.status === 'running' ? (
                      <span className="text-blue-500 text-sm animate-spin inline-block">⚙️</span>
                    ) : (
                      <span className="text-gray-300 text-sm">⏳</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">
                        {NODE_LABELS[step.node_name] ?? step.node_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(step.created_at).toLocaleTimeString('ko-KR')}
                      </span>
                    </div>
                    {step.message && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{step.message}</p>
                    )}
                    {step.error_message && (
                      <p className="text-xs text-red-500 mt-0.5">{step.error_message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div ref={stepsEndRef} />
          </div>
        </div>
      )}

      {/* Job History */}
      {allJobs.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">잡 이력</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {allJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="px-6 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(job.created_at).toLocaleString('ko-KR')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
