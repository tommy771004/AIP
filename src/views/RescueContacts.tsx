import React, { useMemo, useState } from 'react';
import { ActionButton, Badge, GlassCard, GlassPanel } from '../components/StyledComponents';
import { FACILITY_TYPE_LABELS, REGION_FLAGS, REGION_LABELS, SOURCE_STATUS_LABELS } from '../data/firSource';
import { FirContactRecord } from '../types';

interface RescueContactsProps {
  records: FirContactRecord[];
  isLoading: boolean;
  onCall: () => void;
}

const PAGE_SIZE = 6;

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
    <div className="flex flex-col gap-6">
      <GlassPanel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">直連聯絡表</div>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-on-surface md:text-5xl">依 FIR 與設施整理的作業聯絡資料</h1>
            <p className="mt-3 max-w-2xl text-base text-on-surface-variant">
              每張卡片都直接對應 README schema：FIR ICAO、設施類型、電話、傳真、AFTN、VHF、AIRAC 週期與來源信任狀態。
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-on-surface-variant">
            顯示 <span className="font-semibold text-on-surface">{filtered.length}</span> 筆資料，涵蓋{' '}
            <span className="font-semibold text-on-surface">{availableRegions.length}</span> 個區域
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => selectRegion('')}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              selectedRegion === '' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-on-surface-variant'
            }`}
          >
            全部區域
          </button>
          {availableRegions.map((region) => (
            <button
              key={region.code}
              onClick={() => selectRegion(region.code)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                selectedRegion === region.code
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-white/10 bg-white/5 text-on-surface-variant'
              }`}
            >
              {REGION_FLAGS[region.code] ?? region.code} {REGION_LABELS[region.code] ?? region.code} · {region.count}
            </button>
          ))}
        </div>
      </GlassPanel>

      {isLoading ? (
        <div className="panel-surface flex min-h-[320px] items-center justify-center rounded-[28px] border border-white/10">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            正在同步來源資料...
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {pagedRecords.map((record) => (
            <GlassCard key={record.id} className="flex h-full flex-col justify-between bg-white/[0.03]">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">
                      {record.firIcao} · {record.regionCode}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-on-surface">{record.facilityName}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">{record.firName}</p>
                  </div>
                  <Badge active={record.sourceVerified} color={record.sourceVerified ? 'primary' : 'secondary'}>
                    {SOURCE_STATUS_LABELS[record.sourceStatus]}
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">類型</div>
                    <div className="mt-2 font-semibold text-on-surface">{FACILITY_TYPE_LABELS[record.facilityType]}</div>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">AIRAC</div>
                    <div className="mt-2 font-semibold text-on-surface">{record.airacCycle}</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-on-surface-variant">
                  <div className="flex items-center justify-between gap-3">
                    <span>電話</span>
                    <span className="text-right font-semibold text-on-surface">{record.phoneNumber}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>傳真</span>
                    <span className="text-right font-semibold text-on-surface">{record.faxNumber ?? '無'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>AFTN</span>
                    <span className="text-right font-semibold text-on-surface">{record.aftnAddress}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {record.vhfFreq.map((frequency) => (
                    <span key={frequency} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-on-surface">
                      {frequency}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <ActionButton
                  onClick={onCall}
                  className="bg-white text-slate-950 hover:bg-primary"
                >
                  <span className="material-symbols-outlined">call</span>
                  <span>轉接聯絡</span>
                </ActionButton>
                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block truncate text-xs text-on-surface-variant transition hover:text-primary"
                  title={record.sourceName}
                >
                  {record.sourceName}
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-on-surface disabled:opacity-40"
          >
            上一頁
          </button>
          <div className="text-sm text-on-surface-variant">
            第 <span className="font-semibold text-on-surface">{page}</span> / {totalPages} 頁
          </div>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-on-surface disabled:opacity-40"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
