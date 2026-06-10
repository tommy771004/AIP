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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_24%),radial-gradient(circle_at_bottom,rgba(125,211,252,0.18),transparent_24%),#050b15] px-4 py-10 text-on-surface">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '42px 42px' }}></div>
      <div className="relative z-10 w-full max-w-5xl rounded-[36px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_28px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
              緊急轉接進行中
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-[-0.06em] text-white md:text-6xl">
              救援通道已接通，正在追蹤目前選定的 FIR。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              值席人員已確認語音鏈路、主要 AFTN 轉送路徑與緊急頻率。請保持通話，直到任務交接完成。
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">計時</div>
                <div className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white">{formatDuration(duration)}</div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">預估抵達</div>
                <div className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white">{MOCK_INCIDENT.etaMinutes} 分鐘</div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">FIR</div>
                <div className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white">{activeCluster?.firIcao ?? '待定'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-slate-950">
                  {MOCK_INCIDENT.operator.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-xl font-semibold text-white">{MOCK_INCIDENT.operator.name}</div>
                  <div className="mt-1 text-sm text-slate-300">{MOCK_INCIDENT.operator.role}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">目前轉接內容</div>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span>設施</span>
                  <span className="font-semibold text-white">{activeCluster?.facilities[0]?.facilityName ?? '等待中'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>電話</span>
                  <span className="font-semibold text-white">{activeCluster?.facilities[0]?.phoneNumber ?? '等待中'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>AFTN</span>
                  <span className="font-semibold text-white">{activeCluster?.aftnAddresses[0] ?? '等待中'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onEndCall}
              className="flex w-full items-center justify-center gap-3 rounded-[28px] bg-secondary px-6 py-5 text-base font-bold uppercase tracking-[0.24em] text-on-secondary shadow-[0_18px_54px_rgba(249,115,22,0.35)] transition hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined">call_end</span>
              結束轉接
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
