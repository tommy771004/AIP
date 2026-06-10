import React, { useMemo, useState } from 'react';
import { CopyButton, SourceFooter } from '../components/StyledComponents';
import { FACILITY_TYPE_LABELS, REGION_LABELS } from '../data/firSource';
import { FacilityType, FirContactRecord } from '../types';

interface RescueContactsProps {
  records: FirContactRecord[];
  isLoading: boolean;
  onCall: (record: FirContactRecord) => void;
}

const PAGE_SIZE = 6;

/** 索引卡側邊色標籤：依設施類型分色 */
const TAB_COLORS: Record<FacilityType, string> = {
  ACC: 'bg-sky-400',
  ARTCC: 'bg-indigo-400',
  APP: 'bg-violet-400',
  FIC: 'bg-cyan-400',
  RCC: 'bg-rose-400',
  MED: 'bg-emerald-400',
  AFIS: 'bg-teal-400',
  TWR: 'bg-amber-400',
  'TWR/APP': 'bg-orange-400',
  COM: 'bg-slate-400',
  NOF: 'bg-fuchsia-400',
};

export default function RescueContacts({ records, isLoading, onCall }: RescueContactsProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [page, setPage] = useState(1);

  const availableRegions = useMemo(() => {
    const counts = new Map<string, number>();
    records.forEach((record) => counts.set(record.regionCode, (counts.get(record.regionCode) ?? 0) + 1));
    return Array.from(counts.entries()).map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count);
  }, [records]);

  const filtered = useMemo(() => {
    if (!selectedRegion) return records;
    return records.filter((record) => record.regionCode === selectedRegion);
  }, [records, selectedRegion]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function selectRegion(code: string) {
    setSelectedRegion(code);
    setPage(1);
  }

  return (
    <div id="rescue-contacts-view" className="flex w-full flex-col gap-6">

      {/* 索引盒頂部：抽屜標籤列 */}
      <header className="rounded-t-[20px] rounded-b-md border-2 border-b-4 border-[#d8e8e8] bg-[#f2f9f9] px-6 pb-5 pt-6 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--color-rolodex-tab)]">Contact Index</div>
            <h1 className="mt-1 text-3xl font-black text-on-surface md:text-4xl">設施通訊錄</h1>
          </div>
          <div className="text-sm font-medium text-slate-400">
            {filtered.length} 筆設施 · {availableRegions.length} 個區域
          </div>
        </div>

        {/* 區域索引標籤（仿索引卡突出tab） */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          <button
            onClick={() => selectRegion('')}
            className={`rounded-t-xl border-2 border-b-0 px-4 py-2 text-sm font-bold transition-colors ${
              selectedRegion === ''
                ? 'border-[var(--color-rolodex-tab)] bg-white text-[var(--color-rolodex-tab)]'
                : 'border-transparent bg-[#dcecec] text-slate-500 hover:bg-white'
            }`}
          >
            全部
          </button>
          {availableRegions.map((region) => (
            <button
              key={region.code}
              onClick={() => selectRegion(region.code)}
              className={`rounded-t-xl border-2 border-b-0 px-4 py-2 text-sm font-bold transition-colors ${
                selectedRegion === region.code
                  ? 'border-[var(--color-rolodex-tab)] bg-white text-[var(--color-rolodex-tab)]'
                  : 'border-transparent bg-[#dcecec] text-slate-500 hover:bg-white'
              }`}
            >
              {REGION_LABELS[region.code] ?? region.code}
              <span className="ml-1.5 text-xs opacity-60">{region.count}</span>
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-rolodex-tab)]/40 bg-white/60">
          <div className="flex flex-col items-center gap-3 text-[var(--color-rolodex-tab)]">
            <span className="material-symbols-outlined animate-spin text-5xl">cached</span>
            <span className="text-lg font-bold">翻找名片盒中…</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--color-rolodex-tab)]/40 bg-white/60 px-6 text-center">
          <span className="material-symbols-outlined text-5xl text-[var(--color-rolodex-tab)]/60">cloud_off</span>
          <p className="text-lg font-bold text-slate-500">目前沒有即時解析成功的設施資料</p>
          <p className="max-w-md text-sm font-medium text-slate-400">
            本系統只顯示當下實際從官方 eAIP 抓取的資料，不提供快取。請稍後重新同步，或查看總覽的來源健康度。
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pagedRecords.map((record, index) => (
            <article
              key={record.id}
              className={`index-card relative flex h-full flex-col justify-between overflow-hidden rounded-xl border-2 border-[#e2eded] pl-6 pr-5 py-5 shadow-[0_4px_16px_rgba(127,181,181,0.15)] transition-transform hover:-translate-y-1 ${
                index % 2 === 0 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]'
              }`}
            >
              {/* 側邊色標籤 */}
              <span className={`absolute inset-y-0 left-0 w-2 ${TAB_COLORS[record.facilityType]}`} />

              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold tracking-widest text-[var(--color-rolodex-tab)]">
                      {record.firIcao} · {REGION_LABELS[record.regionCode] ?? record.regionCode}
                    </div>
                    <h3 className="mt-1 text-lg font-black leading-snug text-on-surface">{record.facilityName}</h3>
                    <p className="mt-0.5 text-sm font-medium text-slate-400">
                      {record.firName} · {FACILITY_TYPE_LABELS[record.facilityType]}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="shrink-0 font-bold text-slate-400">電話</dt>
                    <dd className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-mono font-bold text-on-surface">{record.phoneNumber}</span>
                      <CopyButton value={record.phoneNumber} label="電話" />
                    </dd>
                  </div>
                  {record.faxNumber && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="shrink-0 font-bold text-slate-400">傳真</dt>
                      <dd className="font-mono font-bold text-on-surface">{record.faxNumber}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <dt className="shrink-0 font-bold text-slate-400">AFTN</dt>
                    <dd className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-600">{record.aftnAddress}</span>
                      <CopyButton value={record.aftnAddress} label="AFTN" />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="shrink-0 font-bold text-slate-400">頻率</dt>
                    <dd className="truncate font-mono text-xs font-bold text-slate-500">{record.vhfFreq.join(' / ')}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => onCall(record)}
                  className="w-full rounded-xl bg-[var(--color-rolodex-tab)] py-3 text-sm font-black text-white transition-colors hover:bg-teal-500 active:scale-[0.98]"
                >
                  開啟緊急聯絡卡
                </button>
                <SourceFooter record={record} className="mt-4" />
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <nav className="mt-2 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#d8e8e8] bg-white text-slate-500 transition-colors hover:border-[var(--color-rolodex-tab)] hover:text-[var(--color-rolodex-tab)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="text-sm font-bold text-slate-500">
            第 {page} / {totalPages} 頁
          </span>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#d8e8e8] bg-white text-slate-500 transition-colors hover:border-[var(--color-rolodex-tab)] hover:text-[var(--color-rolodex-tab)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </nav>
      )}
    </div>
  );
}
