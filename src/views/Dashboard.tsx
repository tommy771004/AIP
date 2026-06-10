import React, { useEffect, useState } from 'react';
import { GlassPanel } from '../components/StyledComponents';
import { DashboardData } from '../types';
import { MOCK_DASHBOARD } from '../data/firSource';

interface DashboardProps {
  onTriggerSOS: () => void;
}

export default function Dashboard({ onTriggerSOS }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate async network request
    setTimeout(() => {
      setData(MOCK_DASHBOARD);
      setLastUpdated(new Date());
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div className="flex flex-col gap-6 pt-6">
      {/* Status Panel */}
      <GlassPanel>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">目前區域</h2>
              {loading && <span className="material-symbols-outlined text-sm animate-spin text-primary">sync</span>}
            </div>
            <div className="text-[24px] md:text-[32px] font-bold text-on-surface flex items-center gap-2">
              {loading ? '載入中...' : data?.currentSectorName}
              {!loading && data && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary-container squircle-inset">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                </span>
              )}
            </div>
            {lastUpdated && !loading && (
              <div className="text-[12px] text-on-surface-variant mt-2 opacity-80">
                最後更新: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-bold tracking-widest text-primary bg-primary-container px-3 py-1 rounded-full mb-2 squircle-inset uppercase">
              {loading ? '...' : data?.connectionStatus}
            </span>
            <div className="text-[14px] font-medium text-on-surface-variant flex items-center gap-1">
              {!loading && <span className="w-2 h-2 rounded-full bg-secondary pulse-glow"></span>}
              {loading ? '...' : data?.monitoringStatus}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* SOS Trigger Cluster */}
      <section className="flex flex-col items-center justify-center py-8">
        <div className="relative group cursor-pointer w-full max-w-sm mx-auto flex justify-center items-center p-10">
          <div className="absolute inset-0 bg-error-container rounded-[40px] opacity-20 pulse-glow transform scale-95 group-hover:scale-100 transition-transform duration-500"></div>
          <button 
            onClick={onTriggerSOS}
            className="w-48 h-48 rounded-[40px] bg-error flex flex-col items-center justify-center relative z-10 border-4 border-error-container/30 shadow-[_-8px_-8px_20px_rgba(255,255,255,0.9),_8px_8px_20px_rgba(186,26,26,0.2),_inset_2px_2px_0px_rgba(255,255,255,0.5)] active:shadow-[inset_8px_8px_20px_rgba(186,26,26,0.4),_inset_-8px_-8px_20px_rgba(255,255,255,0.2)] active:scale-95 active:translate-y-1 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-on-error text-[64px] mb-2" style={{fontVariationSettings: "'FILL' 1"}}>emergency</span>
            <span className="text-[32px] font-bold text-on-error tracking-widest uppercase">SOS</span>
          </button>
        </div>
        <p className="text-[14px] font-medium text-on-surface-variant text-center mt-4 px-8">
          長按 3 秒鐘將緊急情況廣播至{data?.currentSectorName || '飛航情報區管制中心'}。
        </p>
      </section>

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-2 gap-4">
        {[
          { label: '航管直通', icon: 'headset_mic', bg: 'bg-tertiary-container', fg: 'text-on-tertiary-container' },
          { label: '救援單位', icon: 'medical_services', bg: 'bg-secondary-container', fg: 'text-on-secondary-container' },
          { label: '航空氣象', icon: 'cloud', bg: 'bg-surface-container-high', fg: 'text-on-surface-variant' },
          { label: '系統狀態', icon: 'speed', bg: 'bg-surface-container-high', fg: 'text-on-surface-variant' },
        ].map((item) => (
          <button key={item.label} className="glass-panel p-5 rounded-2xl squircle-shadow flex flex-col items-center justify-center gap-3 active:squircle-inset active:scale-95 transition-all">
            <div className={`w-14 h-14 rounded-full ${item.bg} flex items-center justify-center squircle-inset`}>
              <span className={`material-symbols-outlined text-3xl ${item.fg}`}>{item.icon}</span>
            </div>
            <span className="text-[20px] font-semibold text-on-surface">{item.label}</span>
          </button>
        ))}
      </section>
    </div>
  );
}
