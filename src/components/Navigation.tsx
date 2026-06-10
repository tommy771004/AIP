import React from 'react';
import { TabType } from '../types';

interface NavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  facilityCount: number;
  healthySources: number;
}

export default function Navigation({ activeTab, onTabChange, facilityCount, healthySources }: NavProps) {
  const navItems = [
    { id: 'sos', icon: 'dashboard', label: '總覽' },
    { id: 'sectors', icon: 'globe_asia', label: '區域圖' },
    { id: 'rescue', icon: 'support_agent', label: '聯絡表' },
    { id: 'chat', icon: 'forum', label: '作業簿' },
  ] as const;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-background/70 px-4 py-4 backdrop-blur-2xl md:px-8 md:py-5 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.34em] text-primary/80">全球 FIR 作業台</div>
            <div className="truncate text-xl font-bold tracking-[-0.04em] text-on-surface md:text-3xl">AeroSafe 飛航情報控制台</div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  isActive 
                    ? 'bg-white text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.18)]' 
                    : 'text-on-surface-variant hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="text-[11px] font-bold tracking-[0.22em] uppercase">{item.label}</span>
              </button>
            )
          })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
              <div className="text-[10px] uppercase tracking-[0.26em] text-on-surface-variant">設施筆數</div>
              <div className="text-sm font-semibold text-on-surface">{facilityCount}</div>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-right">
              <div className="text-[10px] uppercase tracking-[0.26em] text-emerald-200/80">可連來源</div>
              <div className="text-sm font-semibold text-emerald-100">{healthySources}</div>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-white/10 bg-slate-950/90 px-3 pb-5 pt-3 backdrop-blur-2xl md:hidden">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
             <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-slate-950 px-4 py-2 -translate-y-1' 
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  );
}
