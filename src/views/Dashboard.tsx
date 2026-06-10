import React from 'react';
import { Badge, GlassCard, GlassPanel } from '../components/StyledComponents';
import { FirCluster, OperationsOverview, SourceValidation } from '../types';

interface DashboardProps {
  firClusters: FirCluster[];
  overview: OperationsOverview;
  validations: SourceValidation[];
  isLoading: boolean;
  lastSynced: string | null;
  onTriggerSOS: () => void;
}

function formatTime(value: string | null) {
  if (!value) return '等待同步';
  return new Date(value).toLocaleString();
}

export default function Dashboard({
  firClusters,
  overview,
  validations,
  isLoading,
  lastSynced,
  onTriggerSOS,
}: DashboardProps) {
  const highlightedClusters = firClusters.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <GlassPanel className="overflow-hidden">
        <div className="absolute inset-y-0 right-0 hidden w-[40%] bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.24),transparent_58%),radial-gradient(circle_at_bottom,rgba(249,115,22,0.18),transparent_48%)] md:block"></div>
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge active color="primary">AIRAC {overview.latestAirac}</Badge>
              <Badge color="secondary">{overview.healthySources}/{overview.totalSources} 個來源可連線</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.06em] text-on-surface md:text-6xl">
              依 README 規格建構的 FIR 聯絡情報台，而不是展示用假卡片。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant md:text-lg">
              控制台目前已將 FIR ICAO、設施名稱、電話、傳真、AFTN、VHF、AIRAC 週期與來源網址都提升為第一級資料欄位。畫面重點放在作業就緒度、來源可信度與快速緊急轉接。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onTriggerSOS}
                className="inline-flex items-center gap-3 rounded-full bg-secondary px-6 py-4 text-sm font-bold uppercase tracking-[0.28em] text-on-secondary shadow-[0_16px_48px_rgba(249,115,22,0.35)] transition hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined">emergency</span>
                啟動緊急轉接
              </button>
              <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-on-surface-variant">
                最後同步：<span className="font-semibold text-on-surface">{formatTime(lastSynced)}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ['FIR 節點', overview.firCount, '不同 FIR / ARTCC 的涵蓋數'],
              ['設施總數', overview.facilityCount, '可直接使用的作業聯絡資料'],
              ['已驗證', overview.verifiedFacilityCount, '通過即時來源檢查的紀錄'],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-[11px] uppercase tracking-[0.28em] text-on-surface-variant">{label}</div>
                <div className="mt-3 text-4xl font-bold tracking-[-0.06em] text-on-surface">{value}</div>
                <div className="mt-2 text-sm text-on-surface-variant">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassPanel>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">重點 FIR</div>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">作業就緒度</h2>
            </div>
            {isLoading && <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {highlightedClusters.map((cluster) => (
              <GlassCard key={cluster.firIcao} className="bg-white/[0.03]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">{cluster.firIcao}</div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-on-surface">{cluster.firName}</h3>
                  </div>
                  <Badge
                    active={cluster.statusTone === 'hot'}
                    color={cluster.statusTone === 'stable' ? 'primary' : 'secondary'}
                  >
                    {cluster.readinessLabel}
                  </Badge>
                </div>

                <div className="mt-5 space-y-3 text-sm text-on-surface-variant">
                  <div className="flex items-center justify-between">
                    <span>設施</span>
                    <span className="font-semibold text-on-surface">{cluster.facilityCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>驗證</span>
                    <span className="font-semibold text-on-surface">{cluster.verifiedFacilities}/{cluster.facilityCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AFTN</span>
                    <span className="font-semibold text-on-surface">{cluster.aftnAddresses[0]}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {cluster.frequencies.slice(0, 3).map((frequency) => (
                    <span key={frequency} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-on-surface">
                      {frequency}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">來源健康度</div>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">驗證矩陣</h2>
          <div className="mt-5 space-y-3">
            {validations.map((validation) => (
              <div
                key={validation.name}
                className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-on-surface">{validation.name}</div>
                    <div className="mt-1 text-xs text-on-surface-variant">{validation.url}</div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${validation.isAccessible ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-100'}`}>
                    {validation.isAccessible ? `HTTP ${validation.statusCode ?? 200}` : '使用快取'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      <GlassPanel>
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">爬取工作流</div>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">README 實作路徑</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['1', '解析當前 AIRAC', '先從入口頁找出目前生效週期，而不是把最終頁網址寫死。'],
            ['2', '進入 GEN 3.3', '沿著 ATS 聯絡章節前進，鎖定電話與 AFTN 所在位置。'],
            ['3', '正規化欄位', '輸出 FIR ICAO、設施、電話、傳真、AFTN、VHF、AIRAC 與來源網址。'],
            ['4', '安全回退', '若即時頁面失敗，明確標示快取狀態，讓值席知道資料信任度。'],
          ].map(([step, title, detail]) => (
            <div key={step} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="text-4xl font-bold tracking-[-0.08em] text-primary">{step}</div>
              <div className="mt-4 text-lg font-semibold text-on-surface">{title}</div>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{detail}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
