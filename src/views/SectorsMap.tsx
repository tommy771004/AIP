import React, { useEffect, useState } from 'react';
import { GlassPanel } from '../components/StyledComponents';
import { SectorStatus } from '../types';
import { MOCK_SECTORS, FIR_UI_CONFIG } from '../data/firSource';

export default function SectorsMap() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [sectors, setSectors] = useState<SectorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSectors(MOCK_SECTORS);
      setLastUpdated(new Date());
      setLoading(false);
    }, 400);
  }, []);

  const toggleRegion = (regionText: string) => {
    setActiveRegion(activeRegion === regionText ? null : regionText);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pt-6 h-full pb-4">
      {/* Context Panel */}
      <aside className="w-full md:w-1/3 flex flex-col gap-6 z-10 shrink-0">
        <GlassPanel className="!p-6 !rounded-xl relative">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-[20px] font-semibold text-primary">即時監控</h2>
            {loading ? (
               <span className="material-symbols-outlined text-sm animate-spin text-primary">sync</span>
            ) : (
               <div className="flex space-x-1 items-center">
                 <span className="w-2 h-2 rounded-full bg-secondary pulse-glow"></span>
               </div>
            )}
          </div>
          <p className="text-[14px] font-medium text-on-surface-variant mb-4 flex flex-col gap-1">
            <span>選擇飛航情報區 (FIR) 以檢視活動區域和目前的求救訊號。</span>
            {lastUpdated && !loading && (
              <span className="text-[11px] opacity-70">更新於: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-3 rounded-full bg-surface-container-low border-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:ring-2 focus:ring-secondary/50 text-[14px] font-medium outline-none transition-shadow" 
              placeholder="搜尋區域..." 
            />
          </div>

          <div className="flex flex-col gap-3">
            {sectors.map(sector => (
              <button key={sector.id} className="rounded-3xl border-2 border-white/50 shadow-sm bg-surface flex items-center p-3 hover:bg-surface-container transition-colors active:scale-95" onClick={() => toggleRegion(sector.id)}>
                <div className={`w-10 h-10 rounded-full ${sector.isEmergency ? 'bg-tertiary-container text-primary' : 'bg-surface-container-high text-tertiary'} flex items-center justify-center mr-3`}>
                  <span className="material-symbols-outlined">{sector.isEmergency ? 'flight_takeoff' : 'radar'}</span>
                </div>
                <div className="text-left flex-grow">
                  <div className="text-[20px] font-semibold text-on-surface">{sector.name}</div>
                  <div className="text-[14px] font-medium text-on-surface-variant">{sector.statusText}</div>
                </div>
                {sector.isEmergency && <div className="w-3 h-3 rounded-full bg-secondary-container pulse-glow mr-2"></div>}
              </button>
            ))}
            {loading && sectors.length === 0 && <div className="text-[14px] text-on-surface-variant text-center py-4">資料同步中...</div>}
          </div>
        </GlassPanel>

        <div className="mt-auto pt-6 hidden md:block">
          <button className="w-full bg-secondary text-on-secondary rounded-xl py-4 px-6 text-[20px] font-semibold shadow-[0_8px_20px_rgba(172,53,9,0.3)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">emergency_share</span>
            宣告全球緊急情況
          </button>
        </div>
      </aside>

      {/* Map Area */}
      <section className="w-full h-[512px] md:h-auto min-h-[400px] relative rounded-3xl border-2 border-white/50 shadow-sm bg-primary-container/20 overflow-hidden flex items-center justify-center self-stretch flex-grow">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(#bbc8d0 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
        
        <div className="relative w-full h-full max-w-2xl max-h-[600px]">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ strokeDasharray: "4 4" }}>
            <path d="M 45% 30% Q 55% 22% 65% 15%" fill="none" stroke="#bbc8d0" strokeWidth="2"></path>
            <path d="M 45% 30% Q 42% 45% 40% 60%" fill="none" stroke="#bbc8d0" strokeWidth="2"></path>
          </svg>

          {sectors.map((sector) => {
            const uiConfig = FIR_UI_CONFIG[sector.id] || FIR_UI_CONFIG['taipei'];

            return (
              <div key={`map-${sector.id}`} className="absolute group cursor-pointer blob-anim" style={{ top: uiConfig.top, left: uiConfig.left }} onClick={() => toggleRegion(sector.id)}>
                <div className={`${uiConfig.shape} ${uiConfig.color} shadow-lg flex flex-col items-center justify-center transition-all duration-500 hover:scale-110 z-20 relative ${activeRegion === sector.id ? uiConfig.align : 'z-10'}`}>
                  <span className={`text-[20px] font-bold z-10 relative`}>{uiConfig.shortName}</span>
                  {sector.isEmergency && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full border-2 border-surface flex items-center justify-center pulse-glow z-20">
                      <span className="material-symbols-outlined text-[12px] text-on-secondary" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                    </div>
                  )}
                </div>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 glass-panel !p-3 rounded-xl transition-all duration-300 z-30 flex flex-col gap-1 ${activeRegion === sector.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <div className={`text-[12px] ${sector.isEmergency ? 'text-secondary' : 'text-tertiary'} font-bold uppercase tracking-wider`}>{sector.frequency}</div>
                  <div className="text-[14px] font-medium text-on-surface">{sector.activeTracks > 0 ? `${sector.activeTracks} 個活動軌跡` : (sector.isEmergency ? '活動軌跡' : sector.statusText.split(' • ')[0])}</div>
                  {sector.isEmergency && (
                    <button className="mt-2 w-full bg-primary-container text-on-primary-container py-1 rounded-lg text-[14px] font-medium hover:bg-primary hover:text-on-primary transition-colors">鎖定區域</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Tools */}
        <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-20">
          <button className="w-12 h-12 rounded-3xl squircle-shadow bg-surface flex items-center justify-center text-primary active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="w-12 h-12 rounded-3xl squircle-shadow bg-surface flex items-center justify-center text-primary active:scale-95 transition-all">
            <span className="material-symbols-outlined">remove</span>
          </button>
          <button className="w-12 h-12 rounded-3xl squircle-shadow bg-surface flex items-center justify-center text-primary active:scale-95 transition-all mt-3">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </section>
    </div>
  );
}
