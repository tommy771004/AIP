import React, { useEffect, useMemo, useState } from 'react';
import { MOCK_INCIDENT } from '../data/firSource';
import { FirCluster } from '../types';

interface ActiveCallProps {
  onEndCall: () => void;
  firClusters: FirCluster[];
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function ActiveCall({ onEndCall, firClusters }: ActiveCallProps) {
  const [duration, setDuration] = useState(0);
  const activeCluster = useMemo(() => firClusters[0], [firClusters]);

  useEffect(() => {
    const interval = setInterval(() => setDuration((current) => current + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="active-call-view" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-pink-50 px-4 py-10 selection:bg-red-200 selection:text-red-800">
      
      {/* Cute Bouncy Pulsing Backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-300/30 rounded-full blur-[100px] animate-ping duration-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-300/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="relative z-10 w-full max-w-5xl rounded-[48px] border-[4px] border-white bg-white/90 p-8 shadow-[0_32px_100px_rgba(255,100,140,0.15)] backdrop-blur-2xl md:p-14">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-3 rounded-[24px] border-[3px] border-red-200 bg-red-50 px-6 py-3 text-[15px] font-black tracking-widest text-red-500 shadow-sm w-fit">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
              緊急轉接進行中 🚨
            </div>
            <h1 className="mt-8 text-[40px] font-black tracking-tight text-slate-800 md:text-[56px] leading-[1.1]">
              救援通道已接通！<br/><span className="text-red-400">正在追蹤 FIR 📡</span>
            </h1>
            <p className="mt-6 text-[18px] font-bold text-slate-400">
              值席人員已進入連線狀態，請保持通話。我們正在同步當地最近的管制中心。
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="rounded-[40px] bg-red-50 border-[4px] border-red-100 p-8 flex flex-col justify-center items-center text-center shadow-inner">
                <div className="text-[15px] font-black text-red-400 tracking-widest uppercase mb-2">通話時長</div>
                <div className="text-[56px] font-black text-red-500 leading-none">{formatDuration(duration)}</div>
              </div>
              <div className="rounded-[40px] bg-blue-50 border-[4px] border-blue-100 p-8 flex flex-col justify-center items-center text-center shadow-inner">
                <div className="text-[15px] font-black text-blue-400 tracking-widest uppercase mb-2">預估抵達</div>
                <div className="text-[56px] font-black text-blue-500 leading-none">{MOCK_INCIDENT.etaMinutes} <span className="text-2xl">M</span></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="rounded-[40px] bg-white border-[4px] border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#ffe5ec] text-[36px] font-black text-primary shadow-sm transform -rotate-6">
                  {MOCK_INCIDENT.operator.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800">{MOCK_INCIDENT.operator.name}</div>
                  <div className="mt-1 text-[16px] font-black text-slate-400">{MOCK_INCIDENT.operator.role} 🦸‍♀️</div>
                </div>
              </div>
            </div>

            <div className="rounded-[40px] bg-white border-[4px] border-slate-100 p-8 shadow-sm">
              <div className="text-[15px] font-black text-primary mb-5 uppercase tracking-widest">通訊目標</div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center rounded-[24px] bg-slate-50 p-4 border-2 border-slate-100">
                     <span className="text-[15px] font-black text-slate-400">聯絡設施</span>
                     <span className="text-[18px] font-black text-slate-700 truncate max-w-[140px] pr-2">{activeCluster?.facilities[0]?.facilityName ?? '等待中'}</span>
                  </div>
                  <div className="flex justify-between items-center rounded-[24px] bg-slate-50 p-4 border-2 border-slate-100">
                     <span className="text-[15px] font-black text-slate-400">直通電話</span>
                     <span className="text-[18px] font-black text-slate-700">{activeCluster?.facilities[0]?.phoneNumber ?? '等待中'}</span>
                  </div>
               </div>
            </div>

            <button
              onClick={onEndCall}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-[40px] bg-slate-800 px-6 py-6 text-[22px] font-black tracking-wide text-white shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all hover:bg-slate-700 hover:-translate-y-2 active:scale-95 active:translate-y-0 active:shadow-none"
            >
              <span className="material-symbols-outlined text-[32px]">call_end</span>
              掛斷結束 🛑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
