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
    <div id="rescue-contacts-view" className="flex flex-col gap-8 w-full">
      <GlassPanel>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[13px] font-black tracking-widest text-primary uppercase">Directory</div>
            <h1 className="mt-1 text-4xl font-black text-on-surface md:text-5xl">設施通訊錄 📞</h1>
            <p className="mt-4 max-w-2xl text-lg font-bold text-slate-400">
              完整收錄所有 FIR 的通訊細節，輕輕一點就能展開救援協作！
            </p>
          </div>

          <div className="rounded-[28px] bg-primary/10 border-[3px] border-primary/20 px-8 py-5 text-[15px] font-black text-primary flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">star</span>
            <div>
               已載入 <span className="text-2xl">{filtered.length}</span> 筆設施 <br/>
               涵蓋 {availableRegions.length} 區域 🗺️
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => selectRegion('')}
            className={`rounded-[24px] border-[3px] px-6 py-3 text-[15px] font-black transition-all duration-300 ${
              selectedRegion === '' ? 'border-primary bg-primary text-white shadow-md scale-105' : 'border-slate-100 bg-white text-slate-500 hover:border-primary/50 hover:text-primary active:scale-95'
            }`}
          >
            全部區域 🌟
          </button>
          {availableRegions.map((region) => (
            <button
              key={region.code}
              onClick={() => selectRegion(region.code)}
              className={`rounded-[24px] border-[3px] px-6 py-3 text-[15px] font-black transition-all duration-300 ${
                selectedRegion === region.code
                  ? 'border-primary bg-primary text-white shadow-md scale-105'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-primary/50 hover:text-primary active:scale-95'
              }`}
            >
              {REGION_FLAGS[region.code] ?? region.code} {REGION_LABELS[region.code] ?? region.code} · {region.count}
            </button>
          ))}
        </div>
      </GlassPanel>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-[40px] border-[4px] border-dashed border-primary/30 bg-white/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-5 text-primary">
            <span className="material-symbols-outlined animate-spin text-[64px]">toys</span>
            <span className="text-2xl font-black tracking-wide">正在快樂載入中... ✨</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pagedRecords.map((record) => (
            <GlassCard key={record.id} className="flex h-full flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-black text-secondary tracking-widest uppercase">
                      {record.firIcao} · {record.regionCode}
                    </div>
                    <h3 className="mt-1 text-2xl font-black text-on-surface line-clamp-2">{record.facilityName}</h3>
                    <p className="mt-2 text-[15px] font-bold text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      {record.firName}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-[24px] bg-slate-50 border-[3px] border-slate-100 p-4 transition-colors group-hover:border-blue-100 group-hover:bg-blue-50">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-wide">設施類型</div>
                    <div className="mt-1 font-black text-on-surface text-[16px]">{FACILITY_TYPE_LABELS[record.facilityType]}</div>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 border-[3px] border-slate-100 p-4 transition-colors group-hover:border-pink-100 group-hover:bg-pink-50">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-wide">目前 AIRAC</div>
                    <div className="mt-1 font-black text-on-surface text-[16px]">{record.airacCycle}</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-[24px] bg-blue-50 px-5 py-4 border-[3px] border-blue-100 group-hover:border-blue-200">
                    <span className="text-[15px] font-black text-blue-400">AFTN</span>
                    <span className="font-black text-blue-600 text-lg">{record.aftnAddress}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[24px] bg-pink-50 px-5 py-4 border-[3px] border-pink-100 group-hover:border-pink-200">
                    <span className="text-[15px] font-black text-pink-400">電話</span>
                    <span className="font-black text-pink-600 text-lg">{record.phoneNumber}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-2">
                <ActionButton
                  onClick={onCall}
                  className="bg-primary text-white hover:bg-pink-400 text-lg"
                >
                  <span className="material-symbols-outlined text-[24px]">perm_phone_msg</span>
                  一鍵轉接 🚀
                </ActionButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-5 mt-6">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white border-[3px] border-slate-100 text-slate-500 shadow-sm hover:border-primary hover:text-primary hover:scale-110 disabled:opacity-40 disabled:hover:border-slate-100 disabled:hover:scale-100 disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all"
          >
            <span className="material-symbols-outlined text-3xl">chevron_left</span>
          </button>
          <div className="rounded-[28px] bg-white border-[3px] border-slate-100 px-8 py-4 text-[16px] font-black text-slate-400 shadow-sm">
            第 <span className="text-primary text-xl px-1">{page}</span> 頁，共 <span className="text-on-surface px-1">{totalPages}</span> 頁 🍰
          </div>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white border-[3px] border-slate-100 text-slate-500 shadow-sm hover:border-primary hover:text-primary hover:scale-110 disabled:opacity-40 disabled:hover:border-slate-100 disabled:hover:scale-100 disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all"
          >
            <span className="material-symbols-outlined text-3xl">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
