import React, { useMemo, useState } from 'react';
import { SourceFooter } from '../components/StyledComponents';
import { REGION_LABELS, REGION_MAP_CONFIG } from '../data/firSource';
import { buildRegionSummaries } from '../lib/firAnalytics';
import { FirCluster } from '../types';

interface SectorsMapProps {
  firClusters: FirCluster[];
  isLoading: boolean;
}

export default function SectorsMap({ firClusters, isLoading }: SectorsMapProps) {
  const [selectedFir, setSelectedFir] = useState<string | null>(firClusters[0]?.firIcao ?? null);

  const regionSummaries = useMemo(
    () => buildRegionSummaries(firClusters.flatMap((cluster) => cluster.facilities)),
    [firClusters]
  );

  const activeCluster = firClusters.find((cluster) => cluster.firIcao === selectedFir) ?? firClusters[0];
  const leadFacility = activeCluster?.facilities[0];

  return (
    <div id="sectors-map-view" className="grid w-full gap-6 xl:grid-cols-[360px_1fr]">

      {/* 側欄：航班看板式清單 */}
      <aside className="texture-paper h-fit rounded-[20px] border-2 border-[#e3d5bb] p-6 shadow-[0_6px_24px_rgba(79,109,122,0.12)]">
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#cdbb98] pb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-poster-stamp)]">Flight Information Regions</div>
            <h2 className="mt-1 font-mono text-2xl font-bold uppercase tracking-wide text-[var(--color-poster-ink)]">航區看板</h2>
          </div>
          {isLoading && <span className="material-symbols-outlined animate-spin text-2xl text-[var(--color-poster-stamp)]">flight</span>}
        </div>

        <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {!isLoading && firClusters.length === 0 && (
            <p className="px-2 py-6 text-center font-mono text-sm font-bold text-[#8a7a5c]">
              暫無即時航區資料
            </p>
          )}
          {firClusters.map((cluster) => {
            const isActive = cluster.firIcao === activeCluster?.firIcao;
            return (
              <button
                key={cluster.firIcao}
                onClick={() => setSelectedFir(cluster.firIcao)}
                className={`group flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left font-mono transition-all ${
                  isActive
                    ? 'bg-[var(--color-poster-ink)] text-[#faf3e3] shadow-md'
                    : 'text-[var(--color-poster-ink)] hover:bg-[#f0e6cf]'
                }`}
              >
                <div className="min-w-0">
                  <span className={`text-sm font-bold tracking-widest ${isActive ? 'text-[#ffd9a0]' : 'text-[var(--color-poster-stamp)]'}`}>
                    {cluster.firIcao}
                  </span>
                  <div className="truncate text-base font-bold uppercase tracking-wide">{cluster.firName}</div>
                </div>
                <span className="shrink-0 text-xs opacity-70">{cluster.facilityCount} 站</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 主圖：復古海報地圖 */}
      <section className="texture-paper relative overflow-hidden rounded-[20px] border-2 border-[#e3d5bb] p-6 shadow-[0_6px_24px_rgba(79,109,122,0.12)] md:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed border-[#cdbb98] pb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-poster-stamp)]">World Coverage · Est. 2026</div>
            <h2 className="mt-1 font-mono text-3xl font-bold uppercase tracking-wide text-[var(--color-poster-ink)]">全球航線海報</h2>
          </div>
          {activeCluster && (
            <div className="stamp-edge rotate-2 rounded-lg bg-white px-4 py-2 font-mono text-sm font-bold text-[var(--color-poster-stamp)]">
              FOCUS · {activeCluster.firIcao}
            </div>
          )}
        </div>

        <div className="relative min-h-[460px] overflow-x-auto rounded-xl">
          <div className="relative min-h-[460px] min-w-[760px]">
            {/* 航線（裝飾） */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-50">
              <path d="M120 200 Q300 60 560 110 T740 230" stroke="#c96f4a" strokeWidth="2.5" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
              <path d="M100 300 Q280 390 470 340 T700 260" stroke="#4f6d7a" strokeWidth="2.5" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
            </svg>

            {/* 郵票式區域卡 */}
            {regionSummaries.map((summary, index) => {
              const config = REGION_MAP_CONFIG[summary.regionCode] ?? REGION_MAP_CONFIG.TW;
              const relatedClusters = firClusters.filter((cluster) => cluster.regionCode === summary.regionCode);
              const isActive = relatedClusters.some((cluster) => cluster.firIcao === activeCluster?.firIcao);
              const rotation = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3'][index % 4];

              return (
                <button
                  key={summary.regionCode}
                  onClick={() => setSelectedFir(relatedClusters[0]?.firIcao ?? null)}
                  className={`absolute text-left transition-transform duration-300 hover:z-20 hover:scale-110 ${rotation}`}
                  style={{ top: config.top, left: config.left }}
                >
                  <div className={`stamp-edge min-w-[130px] rounded-lg p-3 transition-colors ${
                    isActive ? 'bg-[#fff3da]' : 'bg-white/95'
                  }`}>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-poster-stamp)]">
                      {REGION_LABELS[summary.regionCode] ?? summary.regionCode}
                    </div>
                    <div className="font-mono text-lg font-bold uppercase text-[var(--color-poster-ink)]">{config.shortName}</div>
                    <div className="mt-1 text-[11px] font-medium text-[#8a7a5c]">
                      {summary.facilityCount} 設施 · {summary.liveCount} 即時
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 登機證式詳情 */}
        {activeCluster && (
          <div className="mt-6 grid gap-0 overflow-hidden rounded-xl border-2 border-[#e3d5bb] bg-white md:grid-cols-[1fr_auto_280px]">
            <div className="p-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-poster-stamp)]">Boarding Information</div>
              <div className="mt-2 font-mono text-3xl font-bold uppercase text-[var(--color-poster-ink)]">
                {activeCluster.firName}
                <span className="ml-3 text-xl text-[#b6a888]">{activeCluster.firIcao}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeCluster.frequencies.map((frequency) => (
                  <span key={frequency} className="rounded-md border border-[#e3d5bb] bg-[#faf3e3] px-3 py-1.5 font-mono text-sm font-bold text-[var(--color-poster-ink)]">
                    {frequency}
                  </span>
                ))}
              </div>
              {leadFacility && <SourceFooter record={leadFacility} className="mt-5 border-[#e3d5bb]" />}
            </div>
            <div className="hidden border-l-2 border-dashed border-[#cdbb98] md:block" />
            <div className="flex flex-col justify-center gap-2 bg-[#faf3e3] p-6 font-mono text-sm text-[var(--color-poster-ink)]">
              <div className="flex justify-between"><span className="opacity-60">AIRAC</span><span className="font-bold">{activeCluster.airacCycle}</span></div>
              <div className="flex justify-between"><span className="opacity-60">設施</span><span className="font-bold">{activeCluster.facilityCount}</span></div>
              <div className="flex justify-between"><span className="opacity-60">即時解析</span><span className="font-bold">{activeCluster.verifiedFacilities}</span></div>
              <div className="flex justify-between"><span className="opacity-60">AFTN</span><span className="font-bold">{activeCluster.aftnAddresses[0] ?? '—'}</span></div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
