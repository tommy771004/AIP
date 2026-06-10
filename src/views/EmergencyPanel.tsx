import React from 'react';
import { CopyButton, SourceFooter } from '../components/StyledComponents';
import { FACILITY_TYPE_LABELS } from '../data/firSource';
import { FirContactRecord } from '../types';

interface EmergencyPanelProps {
  record: FirContactRecord;
  onClose: () => void;
}

const CHECKLIST = [
  '確認自身位置與所在 FIR',
  '撥打下方管制中心直通電話',
  '報告：呼號、位置、高度、緊急性質',
  '無法通話時改用 AFTN 或守聽 121.5 MHz',
];

/**
 * 高對比緊急聯絡卡。瀏覽器無法代撥市話，
 * 因此提供超大字級電話 + 一鍵複製 + 行動 checklist，所有欄位附來源可查證。
 */
export default function EmergencyPanel({ record, onClose }: EmergencyPanelProps) {
  return (
    <div id="emergency-panel-view" className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[var(--color-alert-deep)]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* 警示條頭部 */}
        <div className="hazard-stripes h-4 w-full" />
        <header className="flex items-start justify-between gap-4 bg-[var(--color-alert-deep)] px-6 py-5 text-white md:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-alert-orange)] px-4 py-1.5 text-sm font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              Emergency Contact
            </div>
            <h1 className="mt-3 text-2xl font-black md:text-3xl">{record.facilityName}</h1>
            <p className="mt-1 text-sm font-medium text-white/70">
              {record.firName}（{record.firIcao}）· {FACILITY_TYPE_LABELS[record.facilityType]}
            </p>
          </div>
          <button
            onClick={onClose}
            title="關閉緊急面板"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
          {/* 左：超大電話 + AFTN */}
          <div className="border-b-2 border-dashed border-slate-200 p-6 md:border-b-0 md:border-r-2 md:p-10">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-alert-orange)]">直通電話</div>
            <div className="mt-2 break-all font-mono text-4xl font-black leading-tight text-[var(--color-alert-deep)] md:text-5xl">
              {record.phoneNumber}
            </div>
            <div className="mt-3">
              <CopyButton value={record.phoneNumber} label="電話" className="px-4 py-2 text-sm" />
            </div>

            {record.faxNumber && (
              <div className="mt-6">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">傳真</div>
                <div className="mt-1 font-mono text-xl font-bold text-slate-600">{record.faxNumber}</div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">AFTN 地址</div>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-2xl font-black text-sky-700">{record.aftnAddress}</span>
                <CopyButton value={record.aftnAddress} label="AFTN" />
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">守聽頻率</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {record.vhfFreq.map((frequency) => (
                  <span
                    key={frequency}
                    className={`rounded-lg px-3 py-1.5 font-mono text-base font-black ${
                      frequency.includes('121.5')
                        ? 'bg-[var(--color-alert-orange)] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {frequency}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 右：行動 checklist */}
          <div className="bg-[#fff6f0] p-6 md:p-8">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-alert-orange)]">行動步驟</div>
            <ol className="mt-4 space-y-3">
              {CHECKLIST.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-alert-orange)] font-mono text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm font-bold leading-snug text-[var(--color-alert-deep)]">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-xl border-2 border-[var(--color-alert-orange)]/30 bg-white p-4 text-xs font-medium leading-relaxed text-slate-500">
              本面板資料抓取自官方 eAIP，仍以各國現行 AIP 正本為準。AIRAC 週期：
              <span className="font-mono font-bold text-slate-700"> {record.airacCycle}</span>
            </div>
          </div>
        </div>

        <footer className="px-6 pb-5 md:px-10">
          <SourceFooter record={record} />
        </footer>
      </div>
    </div>
  );
}
