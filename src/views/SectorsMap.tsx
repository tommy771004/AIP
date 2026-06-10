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
    <div id="sectors-map-view" className="grid gap-6 xl:grid-cols-[380px_1fr] w-full">
      <GlassPanel className="h-fit flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-black tracking-widest text-primary uppercase">Coverage</div>
            <h2 className="mt-1 text-3xl font-black text-on-surface">控制矩陣 🗺️</h2>
          </div>
          {isLoading && <span className="material-symbols-outlined animate-spin text-primary text-4xl">toys</span>}
        </div>

        <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-2">
          {firClusters.map((cluster) => {
            const isActive = cluster.firIcao === activeCluster?.firIcao;
            return (
              <button
                key={cluster.firIcao}
                onClick={() => setSelectedFir(cluster.firIcao)}
                className={`w-full rounded-[32px] border-[3px] px-6 py-5 text-left transition-all duration-300 ${
                  isActive
                    ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-primary/40 hover:-translate-y-1 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className={`text-sm font-black ${isActive ? 'text-primary' : 'text-secondary'}`}>{cluster.firIcao}</div>
                    <div className="mt-1 text-xl font-black text-on-surface leading-tight">{cluster.firName}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-[16px] bg-slate-50 px-4 py-2 text-xs font-black text-slate-500 border-[2px] border-slate-100">
                    {cluster.facilityCount} 設施
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="overflow-hidden flex flex-col">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[13px] font-black tracking-widest text-primary uppercase">Signal Map</div>
            <h2 className="mt-1 text-4xl font-black text-on-surface">全球中繼站 📡</h2>
          </div>
          {activeCluster && (
            <div className="rounded-[24px] bg-blue-50 border-[3px] border-blue-100 px-6 py-3 text-sm font-bold text-blue-600 shadow-sm">
              當前焦點：<span className="text-xl font-black ml-2 text-blue-700">{activeCluster.firName}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative min-h-[480px] overflow-x-auto overflow-y-hidden rounded-[40px] border-[4px] border-slate-100 bg-[#fffdfd] shadow-inner xl:min-h-[560px]">
            <div className="relative min-w-[760px] min-h-[480px] w-full h-full xl:min-h-[560px]">
              
              {/* Cute Abstract Map Background elements */}
              <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-pink-100/60 rounded-full blur-3xl mix-blend-multiply"></div>
              <div className="absolute top-[50%] right-[30%] w-80 h-80 bg-blue-100/60 rounded-full blur-3xl mix-blend-multiply"></div>
              <div className="absolute bottom-[10%] left-[40%] w-72 h-72 bg-yellow-100/60 rounded-full blur-3xl mix-blend-multiply"></div>

              {regionSummaries.map((summary) => {
                const config = REGION_MAP_CONFIG[summary.regionCode] ?? REGION_MAP_CONFIG.TW;
                const relatedClusters = firClusters.filter((cluster) => cluster.regionCode === summary.regionCode);
                const active = relatedClusters.some((cluster) => cluster.firIcao === activeCluster?.firIcao);

                return (
                  <button
                    key={summary.regionCode}
                    onClick={() => setSelectedFir(relatedClusters[0]?.firIcao ?? null)}
                    className="absolute text-left transition-all duration-500 hover:scale-[1.15] hover:z-20 cursor-pointer"
                    style={{ top: config.top, left: config.left }}
                  >
                    <div className={`relative min-w-[170px] rounded-[32px] border-[4px] p-4 shadow-xl transition-all ${
                        active ? 'border-primary bg-white scale-110 shadow-[0_16px_40px_rgba(255,154,171,0.3)]' : 'border-white bg-white/90 backdrop-blur-md opacity-95 hover:border-pink-200'
                    }`}>
                      <div className="flex items-center gap-4">
                         <div className={`flex h-12 w-12 items-center justify-center rounded-[20px] text-2xl font-black ${active ? 'bg-primary text-white scale-110' : 'bg-pink-50 text-pink-500'}`}>
                            {summary.regionCode.slice(0,1)}
                         </div>
                         <div>
                            <div className="text-sm font-black text-slate-400">{REGION_LABELS[summary.regionCode] ?? summary.regionCode}</div>
                            <div className="text-xl font-black text-on-surface">{config.shortName}</div>
                         </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Softer Bouncy SVG Connectors */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60">
                <path d="M180 210 Q300 80 580 120 T720 220" stroke="#ff9aab" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="10 16" />
                <path d="M140 310 Q260 400 450 360 T660 280" stroke="#a0c4ff" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="10 16" />
                <path d="M680 240 Q740 340 650 400 T560 420" stroke="#b9fbc0" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="10 16" />
              </svg>
            </div>
          </div>

          {activeCluster && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[40px] bg-white border-[3px] border-slate-100 p-8 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-colors">
                 <div className="text-[13px] font-black uppercase tracking-widest text-primary">目前檢視 FIR</div>
                 <div className="text-[40px] leading-tight font-black text-on-surface mt-2">{activeCluster.firName} <br/><span className="text-3xl text-slate-300">({activeCluster.firIcao})</span></div>
              </div>

              <div className="rounded-[40px] bg-white border-[3px] border-slate-100 p-8 shadow-sm flex flex-col justify-center hover:border-blue-200 transition-colors">
                <div className="text-[13px] font-black uppercase tracking-widest text-blue-500 mb-4">通訊頻率 📻</div>
                <div className="flex flex-wrap gap-3">
                  {activeCluster.frequencies.map((frequency) => (
                    <span key={frequency} className="rounded-[20px] bg-blue-50 border-[3px] border-blue-100 text-blue-600 px-5 py-3 font-black text-xl hover:scale-105 transition-transform cursor-default">
                      {frequency}
                    </span>
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
