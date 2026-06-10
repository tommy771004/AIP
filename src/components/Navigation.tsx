import React, { useState } from 'react';
import { TabType } from '../types';
import { Badge } from './StyledComponents';

interface NavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  facilityCount: number;
  healthySources: number;
}

export default function Navigation({ activeTab, onTabChange, facilityCount, healthySources }: NavProps) {
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  const navItems = [
    { id: 'sos', icon: 'dashboard', label: '總覽' },
    { id: 'sectors', icon: 'public', label: '區域圖' },
    { id: 'rescue', icon: 'support_agent', label: '聯絡表' },
    { id: 'chat', icon: 'chat_bubble', label: '作業簿' },
  ] as const;

  return (
    <>
      <header id="main-header" className="fixed inset-x-0 top-0 z-30 border-b-2 border-white/80 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-6 md:py-4 lg:px-8 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-12 h-12 rounded-[16px] bg-primary flex items-center justify-center text-white shadow-[0_4px_16px_rgba(255,154,171,0.4)] transform hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-2xl font-bold">flight_takeoff</span>
            </div>
            <div>
              <div className="text-[12px] font-black tracking-widest text-primary uppercase">AeroSafe</div>
              <div className="truncate text-xl font-black text-on-surface md:text-2xl">飛航情報控制台 ☁️</div>
            </div>
          </div>

          <nav id="desktop-nav" className="hidden items-center gap-2 bg-white/90 p-1.5 rounded-[28px] border-[3px] border-white shadow-sm md:flex">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-[22px] font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md scale-[1.02]' 
                    : 'text-on-surface-variant hover:bg-pink-50 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[15px]">{item.label}</span>
              </button>
            )
          })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-[24px] bg-white border-[3px] border-slate-100 shadow-sm px-5 py-2 text-right">
              <div className="text-[11px] font-black text-slate-400">設施總數 🌍</div>
              <div className="text-[15px] font-black text-on-surface">{facilityCount} 個</div>
            </div>
            <div className="rounded-[24px] border-[3px] border-blue-100 bg-blue-50 px-5 py-2 text-right">
              <div className="text-[11px] font-black text-blue-500">線上來源 ✨</div>
              <div className="text-[15px] font-black text-blue-600">{healthySources} / 連線中</div>
            </div>
            <button
              onClick={() => setIsHelperOpen(true)}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 border-[3px] border-yellow-200 text-yellow-600 shadow-sm transition-all hover:scale-110 hover:shadow-md hover:bg-yellow-200"
              title="Aero 航空小幫手"
            >
              <span className="text-2xl drop-shadow-sm transition-transform group-hover:rotate-12 group-hover:scale-110">🐾</span>
            </button>
          </div>
        </div>
      </header>

      <nav id="mobile-nav" className="fixed bottom-4 left-4 right-4 z-50 flex justify-around rounded-[32px] border-[3px] border-white bg-white/95 p-2 shadow-xl backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
             <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-full py-3 rounded-[24px] transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-white shadow-md -translate-y-1' 
                  : 'text-on-surface-variant hover:bg-pink-50 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              <span className="mt-1 text-[11px] font-bold tracking-wide">{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={() => setIsHelperOpen(true)}
          className="flex flex-col items-center justify-center w-full py-3 rounded-[24px] text-yellow-500 transition-all duration-300 hover:bg-yellow-50"
        >
          <span className="text-[24px] drop-shadow-sm">🐾</span>
          <span className="mt-1 text-[11px] font-bold tracking-wide">小幫手</span>
        </button>
      </nav>

      {isHelperOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsHelperOpen(false)}
          ></div>
          <div className="relative w-full max-w-sm rounded-[40px] border-[4px] border-white bg-white p-8 shadow-[0_20px_60px_rgba(255,154,171,0.25)] animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsHelperOpen(false)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined font-bold">close</span>
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-yellow-100 border-[4px] border-yellow-200 text-[56px] shadow-sm transform -rotate-6">
                🐾
              </div>
            </div>
            
            <div className="text-center">
              <Badge color="primary" className="mb-3">AeroSafe 設計初衷 🌸</Badge>
              <h3 className="text-2xl font-black text-on-surface mb-4">世界級的飛航保護！</h3>
              <p className="text-[15px] font-bold text-slate-500 leading-relaxed">
                我們致力於將傳統、冰冷的航空情報系統 (FIR)，轉化為溫暖、直覺又可愛的互動儀表板。
                讓每位指揮員在緊湊的任務中，也能感受到滿滿的治癒與安心！
                <br /><br />
                <span className="text-primary">天空的守護者們，今天也辛苦囉！✨</span>
              </p>
            </div>
            
            <button 
              onClick={() => setIsHelperOpen(false)}
              className="mt-8 w-full rounded-[24px] bg-primary py-4 text-lg font-black text-white shadow-[0_6px_0_rgba(220,100,120,1)] hover:bg-pink-400 active:translate-y-[6px] active:shadow-none transition-all"
            >
              收到喵！🚀
            </button>
          </div>
        </div>
      )}
    </>
  );
}
