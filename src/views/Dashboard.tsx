import React, { useEffect, useState } from 'react';
import { SourceFooter } from '../components/StyledComponents';
import { FirCluster, OperationsOverview, SourceValidation } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  firClusters: FirCluster[];
  overview: OperationsOverview;
  validations: SourceValidation[];
  isLoading: boolean;
  lastSynced: string | null;
  onTriggerSOS: () => void;
  onRefresh: () => void;
}

const PIE_COLORS = ['#ff9aab', '#a0c4ff', '#b9fbc0', '#ffeaac', '#cbaacb', '#7fb5b5'];

function RelativeTime({ lastSynced }: { lastSynced: string | null }) {
  const [text, setText] = useState('同步中…');

  useEffect(() => {
    if (!lastSynced) {
      setText('同步中…');
      return;
    }

    const update = () => {
      const diffSeconds = Math.floor((Date.now() - new Date(lastSynced).getTime()) / 1000);
      if (diffSeconds < 5) setText('剛更新');
      else if (diffSeconds < 60) setText(`${diffSeconds} 秒前`);
      else if (diffSeconds < 3600) setText(`${Math.floor(diffSeconds / 60)} 分鐘前`);
      else setText(new Date(lastSynced).toLocaleTimeString());
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  return <span className="font-bold text-primary">{text}</span>;
}

interface FeedEvent {
  at: string;
  icon: string;
  tone: 'ok' | 'warn' | 'info';
  text: string;
}

/** 事件流全部由真實資料推導：同步時間、各來源驗證結果、AIRAC 週期 */
function buildEventFeed(
  overview: OperationsOverview,
  validations: SourceValidation[],
  lastSynced: string | null
): FeedEvent[] {
  const events: FeedEvent[] = [];

  if (lastSynced) {
    events.push({
      at: lastSynced,
      icon: 'sync',
      tone: 'info',
      text: `完成資料同步：${overview.facilityCount} 個設施、${overview.firCount} 個 FIR`,
    });
  }

  validations.forEach((validation) => {
    events.push({
      at: validation.checkedAt,
      icon: validation.isAccessible ? 'cloud_done' : 'cloud_off',
      tone: validation.isAccessible ? 'ok' : 'warn',
      text: validation.isAccessible
        ? `${validation.name} 連線正常（HTTP ${validation.statusCode ?? '—'}）`
        : `${validation.name} 無法連線，改用快取`,
    });
  });

  return events
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, 8);
}

export default function Dashboard({
  firClusters,
  overview,
  validations,
  isLoading,
  lastSynced,
  onTriggerSOS,
  onRefresh,
}: DashboardProps) {
  const highlightedClusters = firClusters.slice(0, 3);
  const events = buildEventFeed(overview, validations, lastSynced);
  const healthyRatio = validations.length > 0
    ? Math.round((overview.healthySources / validations.length) * 100)
    : 0;

  const regionData = Object.entries(
    firClusters.reduce((acc, cluster) => {
      acc[cluster.regionCode] = (acc[cluster.regionCode] || 0) + cluster.facilityCount;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  return (
    <div id="dashboard-view" className="grid w-full auto-rows-[minmax(0,auto)] grid-cols-2 gap-5 lg:grid-cols-6">

      {/* 主格：標題 + SOS */}
      <section className="col-span-2 row-span-2 flex flex-col justify-between rounded-[40px] bg-gradient-to-br from-pink-50 via-white to-amber-50 p-8 shadow-[0_8px_30px_rgba(255,154,171,0.12)] lg:col-span-3">
        <div>
          <div className="sticker inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            AIRAC {overview.latestAirac}
          </div>
          <h1 className="mt-6 text-4xl font-black leading-[1.15] tracking-tight text-on-surface md:text-5xl">
            守護全球藍天
            <span className="mt-2 block text-primary">緊急聯絡隨時就緒</span>
          </h1>
          <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-slate-500">
            匯集各國官方 eAIP 的 FIR 管制中心聯絡資料，每筆都附原始來源可查證。
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onTriggerSOS}
            className="group relative inline-flex items-center gap-3 rounded-[28px] bg-red-400 px-7 py-4 text-lg font-black text-white shadow-[0_8px_0_rgba(240,100,100,1)] transition-all hover:-translate-y-1 hover:bg-red-500 active:translate-y-[2px] active:shadow-none"
          >
            <span className="material-symbols-outlined text-2xl">emergency</span>
            開啟緊急聯絡面板
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            最後同步 <RelativeTime lastSynced={lastSynced} />
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="重新同步"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-pink-400 shadow-sm transition-colors hover:bg-pink-50 disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-sweet-spin' : ''}`}>sync</span>
            </button>
          </div>
        </div>
      </section>

      {/* 數字大字報 ×3 */}
      {[
        { label: 'FIR 節點', value: overview.firCount, hint: '個飛航情報區', cls: 'bg-blue-50 text-blue-500' },
        { label: '設施聯絡端', value: overview.facilityCount, hint: '筆通訊資料', cls: 'bg-purple-50 text-purple-500' },
        { label: '即時解析', value: overview.verifiedFacilityCount, hint: '筆來自來源解析', cls: 'bg-emerald-50 text-emerald-600' },
      ].map((stat) => (
        <section key={stat.label} className={`flex flex-col justify-between rounded-[28px] p-6 ${stat.cls}`}>
          <div className="text-sm font-bold opacity-75">{stat.label}</div>
          <div className="mt-1 text-[52px] font-black leading-none">{stat.value}</div>
          <div className="mt-2 text-xs font-medium opacity-70">{stat.hint}</div>
        </section>
      ))}

      {/* 來源健康度（真資料，取代假趨勢圖） */}
      <section className="col-span-2 rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:col-span-1 lg:row-span-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold text-slate-500">來源健康度</h2>
          <span className="text-2xl font-black text-on-surface">{healthyRatio}%</span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {validations.map((validation) => (
            <div key={validation.name} title={`${validation.name}${validation.statusCode ? `（HTTP ${validation.statusCode}）` : ''}`} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${validation.isAccessible ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="truncate text-xs font-medium text-slate-500">{validation.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 區域分佈圓餅（真資料） */}
      <section className="col-span-2 rounded-[28px] bg-amber-50/70 p-6 lg:col-span-2">
        <h2 className="text-sm font-bold text-amber-700">區域設施分佈</h2>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #ffe5ec', borderRadius: '16px', fontWeight: 'bold', color: '#4a4e69' }}
              />
              <Pie data={regionData} innerRadius={38} outerRadius={62} paddingAngle={6} dataKey="value" stroke="none" cornerRadius={6}>
                {regionData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 重點 FIR ×3 */}
      {highlightedClusters.map((cluster) => {
        const lead = cluster.facilities[0];
        return (
          <section key={cluster.firIcao} className="col-span-2 flex flex-col justify-between rounded-[28px] border-2 border-slate-100 bg-white p-6 transition-shadow hover:shadow-[0_12px_40px_rgba(255,154,171,0.18)] lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold tracking-widest text-secondary">{cluster.firIcao}</div>
                <h3 className="mt-1 text-xl font-black text-on-surface">{cluster.firName}</h3>
              </div>
              <span className={`sticker shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                cluster.statusTone === 'hot'
                  ? 'bg-red-50 text-red-500'
                  : cluster.statusTone === 'watch'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
              }`}>
                {cluster.readinessLabel}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm font-medium text-slate-500">
              <span>{cluster.facilityCount} 設施</span>
              <span className="font-mono text-blue-500">{cluster.aftnAddresses[0] ?? '—'}</span>
            </div>
            {lead && <SourceFooter record={lead} className="mt-4" />}
          </section>
        );
      })}

      {/* 事件流（真資料，取代假日誌） */}
      <section className="col-span-2 rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:col-span-6">
        <h2 className="text-sm font-bold text-slate-500">同步事件流</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {events.length === 0 && (
            <div className="text-sm font-medium text-slate-400">尚無事件——等待第一次同步完成。</div>
          )}
          {events.map((event) => (
            <div key={`${event.at}-${event.text}`} className="flex items-center gap-3 rounded-2xl bg-slate-50/70 px-4 py-3">
              <span className={`material-symbols-outlined text-[20px] ${
                event.tone === 'ok' ? 'text-emerald-500' : event.tone === 'warn' ? 'text-amber-500' : 'text-blue-400'
              }`}>
                {event.icon}
              </span>
              <span className="font-mono text-xs text-slate-400">
                {new Date(event.at).toLocaleTimeString()}
              </span>
              <span className="min-w-0 truncate text-sm font-medium text-on-surface">{event.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
