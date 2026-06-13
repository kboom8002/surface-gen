'use client';

interface GateResult {
  gateId: string;
  gateName: string;
  status: 'pass' | 'warning' | 'fail' | 'blocked';
  severity: string;
  summary: string;
  checkedAt: string;
  failures: Array<{ code: string; message: string; assetId?: string }>;
  warnings: Array<{ code: string; message: string; assetId?: string }>;
}

interface QaReport {
  gate_results?: GateResult[];
  export_allowed?: boolean;
  fatal_errors?: string[];
  rejected_assets?: unknown[];
}

interface QaCenterProps {
  qaReport: Record<string, unknown> | null;
  bundleStatus: string | null;
}

const STATUS_ICONS: Record<string, string> = {
  pass: '✅',
  warning: '⚠️',
  fail: '❌',
  blocked: '🚫',
};

const STATUS_COLORS: Record<string, string> = {
  pass: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  fail: 'bg-red-50 border-red-200',
  blocked: 'bg-red-100 border-red-300',
};

export function QaCenter({ qaReport, bundleStatus }: QaCenterProps) {
  if (!qaReport) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-gray-500">QA 리포트가 없습니다. 에이전트를 실행하면 자동으로 생성됩니다.</p>
      </div>
    );
  }

  const report = qaReport as unknown as QaReport;
  const gateResults = (report.gate_results ?? []) as GateResult[];
  const exportAllowed = report.export_allowed ?? false;
  const fatalErrors = report.fatal_errors ?? [];
  const rejectedCount = (report.rejected_assets as unknown[] | undefined)?.length ?? 0;

  const passCount = gateResults.filter((g) => g.status === 'pass').length;
  const warnCount = gateResults.filter((g) => g.status === 'warning').length;
  const failCount = gateResults.filter((g) => g.status === 'fail' || g.status === 'blocked').length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div
        className={`rounded-xl border-2 p-6 ${
          exportAllowed ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{exportAllowed ? '✅' : '🚫'}</span>
          <div>
            <h2 className={`text-xl font-bold ${exportAllowed ? 'text-green-800' : 'text-red-800'}`}>
              {exportAllowed ? '익스포트 가능' : '익스포트 차단됨'}
            </h2>
            <p className={`text-sm mt-1 ${exportAllowed ? 'text-green-600' : 'text-red-600'}`}>
              번들 상태: <span className="font-medium">{bundleStatus ?? '-'}</span>
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-green-700 font-bold text-2xl">{passCount}</p>
                <p className="text-gray-500">통과</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-700 font-bold text-2xl">{warnCount}</p>
                <p className="text-gray-500">경고</p>
              </div>
              <div className="text-center">
                <p className="text-red-700 font-bold text-2xl">{failCount}</p>
                <p className="text-gray-500">실패</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fatal Errors */}
      {fatalErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-red-800 text-sm">⛔ 치명적 오류</h3>
          {fatalErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-700 font-mono">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Gate Results */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-800">게이트 검증 결과 ({gateResults.length}개)</h2>
        {gateResults.map((gate) => (
          <div
            key={gate.gateId}
            className={`rounded-xl border p-4 ${STATUS_COLORS[gate.status] ?? 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{STATUS_ICONS[gate.status] ?? '❓'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">{gate.gateName}</span>
                  <span className="text-xs text-gray-400 font-mono">{gate.gateId}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{gate.summary}</p>
                {gate.failures.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {gate.failures.slice(0, 3).map((f, i) => (
                      <p key={i} className="text-xs text-red-700 bg-red-100 rounded px-2 py-1">
                        <span className="font-mono">{f.code}</span>: {f.message}
                        {f.assetId ? ` (${f.assetId.substring(0, 8)}...)` : ''}
                      </p>
                    ))}
                    {gate.failures.length > 3 && (
                      <p className="text-xs text-red-500">+ {gate.failures.length - 3}개 더</p>
                    )}
                  </div>
                )}
                {gate.warnings.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {gate.warnings.slice(0, 2).map((w, i) => (
                      <p key={i} className="text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-1">
                        {w.message}
                        {w.assetId ? ` (${w.assetId.substring(0, 8)}...)` : ''}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {new Date(gate.checkedAt).toLocaleTimeString('ko-KR')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {rejectedCount > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            ❌ 거부된 에셋: <span className="font-bold text-red-700">{rejectedCount}개</span> — 금지된 타입 또는 스키마 검증 실패
          </p>
        </div>
      )}
    </div>
  );
}
