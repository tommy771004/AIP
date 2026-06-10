import React, { useMemo, useState } from 'react';
import { GlassPanel } from '../components/StyledComponents';
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

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <GlassPanel className="h-fit">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">FIR 涵蓋</div>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">區域控制矩陣</h2>
          </div>
          {isLoading && <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>}
        </div>

        <div className="mt-6 space-y-3">
          {firClusters.map((cluster) => {
            const isActive = cluster.firIcao === activeCluster?.firIcao;
            return (
              <button
                key={cluster.firIcao}
                onClick={() => setSelectedFir(cluster.firIcao)}
                className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                  isActive
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">{cluster.firIcao}</div>
                    <div className="mt-1 text-lg font-semibold text-on-surface">{cluster.firName}</div>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${cluster.statusTone === 'hot' ? 'bg-secondary' : cluster.statusTone === 'watch' ? 'bg-amber-300' : 'bg-emerald-300'}`}></div>
                </div>
                <div className="mt-3 text-sm text-on-surface-variant">
                  {cluster.facilityCount} 筆設施 · {cluster.frequencies.slice(0, 2).join(' / ')}
                </div>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="overflow-hidden">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">訊號地圖</div>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-on-surface">全球中繼抽象視圖</h2>
          </div>
          {activeCluster && (
            <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-on-surface-variant">
              目前焦點：<span className="font-semibold text-on-surface">{activeCluster.firName}</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="relative min-h-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,23,39,0.9),rgba(7,17,31,0.96))]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.12),transparent_24%),radial-gradient(circle_at_70%_70%,rgba(249,115,22,0.12),transparent_22%)]"></div>
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>

            {regionSummaries.map((summary) => {
              const config = REGION_MAP_CONFIG[summary.regionCode] ?? REGION_MAP_CONFIG.TW;
              const relatedClusters = firClusters.filter((cluster) => cluster.regionCode === summary.regionCode);
              const active = relatedClusters.some((cluster) => cluster.firIcao === activeCluster?.firIcao);

              return (
                <button
                  key={summary.regionCode}
                  onClick={() => setSelectedFir(relatedClusters[0]?.firIcao ?? null)}
                  className="absolute text-left transition hover:scale-105"
                  style={{ top: config.top, left: config.left }}
                >
                  <div className={`absolute -inset-6 rounded-full blur-2xl ${config.haloClass} ${active ? 'opacity-100' : 'opacity-60'}`}></div>
                  <div className={`relative min-w-[148px] rounded-[26px] border border-white/10 bg-gradient-to-br ${config.accentClass} p-[1px] shadow-[0_18px_50px_rgba(0,0,0,0.3)]`}>
                    <div className={`rounded-[25px] bg-slate-950/85 px-5 py-4 ${active ? 'ring-1 ring-white/25' : ''}`}>
                      <div className="text-[11px] uppercase tracking-[0.26em] text-white/60">{REGION_LABELS[summary.regionCode] ?? summary.regionCode}</div>
                      <div className="mt-1 text-lg font-semibold text-white">{config.shortName}</div>
                      <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                        <span>{summary.facilityCount} 筆設施</span>
                        <span>{summary.liveCount} 筆即時</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-45">
              <path d="M180 210 C300 120 580 120 720 220" stroke="rgba(125,211,252,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="6 8" />
              <path d="M140 310 C260 360 450 360 660 280" stroke="rgba(249,115,22,0.45)" strokeWidth="1.5" fill="none" strokeDasharray="6 8" />
              <path d="M680 240 C710 320 650 390 560 420" stroke="rgba(74,222,128,0.4)" strokeWidth="1.5" fill="none" strokeDasharray="6 8" />
            </svg>
          </div>

          {activeCluster && (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-[11px] uppercase tracking-[0.26em] text-primary/80">{activeCluster.firIcao}</div>
                <div className="mt-2 text-2xl font-bold tracking-[-0.04em] text-on-surface">{activeCluster.firName}</div>
                <div className="mt-2 text-sm text-on-surface-variant">{activeCluster.readinessLabel}</div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-[11px] uppercase tracking-[0.26em] text-on-surface-variant">頻率</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeCluster.frequencies.map((frequency) => (
                    <span key={frequency} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-on-surface">
                      {frequency}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-[11px] uppercase tracking-[0.26em] text-on-surface-variant">設施</div>
                <div className="mt-4 space-y-3">
                  {activeCluster.facilities.map((facility) => (
                    <div key={facility.id} className="rounded-[18px] border border-white/10 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-on-surface">{facility.facilityName}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-on-surface-variant">{facility.facilityType}</div>
                        </div>
                        <div className="text-right text-xs text-on-surface-variant">
                          <div>{facility.aftnAddress}</div>
                          <div className="mt-1 text-on-surface">{facility.phoneNumber}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
