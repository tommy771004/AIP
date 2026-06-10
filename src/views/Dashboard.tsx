import React, { useEffect, useState } from 'react';
import { Badge, GlassCard, GlassPanel } from '../components/StyledComponents';
import { FirCluster, OperationsOverview, SourceValidation } from '../types';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  firClusters: FirCluster[];
  overview: OperationsOverview;
  validations: SourceValidation[];
  isLoading: boolean;
  lastSynced: string | null;
  onTriggerSOS: () => void;
  onRefresh: () => void;
}

const MOCK_TREND_DATA = [
  { time: '00:00', value: 5 },
  { time: '04:00', value: 8 },
  { time: '08:00', value: 35 },
  { time: '12:00', value: 50 },
  { time: '16:00', value: 25 },
  { time: '20:00', value: 12 },
  { time: '24:00', value: 7 },
];

const PIE_COLORS = ['#ff9aab', '#a0c4ff', '#b9fbc0', '#ffeaac', '#cbaacb'];
const CUTE_QUOTES = [
  "每一個平安的起降，都是最美的祝福！ ✨",
  "天空再大，我們的心永遠緊緊相連 🐾",
  "今天的雲朵像棉花糖一樣甜！☁️ 準備好起飛了嗎？",
  "隨時為您連線最棒的航空情報！🌸",
  "保持微笑，讓全世界的藍天都為你晴朗！🌟"
];

function formatTime(value: string | null) {
  if (!value) return '呼叫中...';
  return new Date(value).toLocaleString();
}

function RelativeTime({ lastSynced }: { lastSynced: string | null }) {
  const [text, setText] = useState('呼叫中...');

  useEffect(() => {
    if (!lastSynced) {
      setText('呼叫中...');
      return;
    }

    const update = () => {
      const now = Date.now();
      const synced = new Date(lastSynced).getTime();
      const diffSeconds = Math.floor((now - synced) / 1000);

      if (diffSeconds < 5) {
        setText('剛更新 🌟');
      } else if (diffSeconds < 60) {
        setText(`${diffSeconds} 秒前 ✨`);
      } else if (diffSeconds < 3600) {
        setText(`${Math.floor(diffSeconds / 60)} 分鐘前 ☁️`);
      } else {
        setText(new Date(lastSynced).toLocaleTimeString());
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  return <span className="font-extrabold text-primary">{text}</span>;
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
  const [randomQuote, setRandomQuote] = useState(CUTE_QUOTES[0]);

  useEffect(() => {
    setRandomQuote(CUTE_QUOTES[Math.floor(Math.random() * CUTE_QUOTES.length)]);
  }, [lastSynced]);

  const regionData = Object.entries(
    firClusters.reduce((acc, c) => {
      acc[c.regionCode] = (acc[c.regionCode] || 0) + c.facilityCount;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div id="dashboard-view" className="flex flex-col gap-6 w-full">
      <div className="flex animate-bounce items-center gap-3 w-fit rounded-full bg-white/80 border-[3px] border-white px-5 py-3 shadow-[0_8px_30px_rgba(255,154,171,0.2)] backdrop-blur-md">
         <span className="text-2xl">🐱</span>
         <span className="text-[15px] font-black text-primary">{randomQuote}</span>
      </div>

      <GlassPanel id="dashboard-hero" className="relative overflow-hidden w-full">
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Badge active color="primary">AIRAC {overview.latestAirac}</Badge>
            <Badge color="secondary">{overview.healthySources}/{overview.totalSources} 來源可連線</Badge>
          </div>
          <div className={`flex items-center gap-3 rounded-[28px] bg-white p-2 border-[3px] shadow-sm text-[14px] text-on-surface font-bold transition-all duration-500 ${isLoading ? 'border-pink-200 shadow-[0_0_20px_rgba(255,154,171,0.3)] bg-shimmer-pink text-pink-600' : 'border-slate-100'}`}>
            <span className="pl-4">最後同步：{isLoading ? <span>正在更新中 🐾</span> : <RelativeTime lastSynced={lastSynced} />}</span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`flex h-10 w-10 items-center justify-center rounded-[20px] transition-all duration-300 ${isLoading ? 'bg-white text-primary shadow-sm' : 'bg-pink-50 text-pink-500 hover:bg-pink-100'}`}
              title="重新同步"
            >
              <span className={`material-symbols-outlined text-[20px] font-bold ${isLoading ? 'animate-sweet-spin text-primary drop-shadow-[0_0_8px_rgba(255,154,171,0.6)]' : ''}`}>sync</span>
            </button>
          </div>
        </div>
        
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-black tracking-tight text-on-surface md:text-[3.25rem] leading-[1.15]">
              保護全球藍天 ✨ <br/><span className="text-primary mt-2 block">隨時準備緊急轉接！</span>
            </h1>
            <p className="mt-5 text-lg font-bold text-slate-500 max-w-xl">
              這是依規格完美打造的 FIR 控制台！即時連接設施網絡，輕鬆掌控飛航資料，讓救援聯絡不再迷路。
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={onTriggerSOS}
                className="group relative inline-flex items-center gap-3 rounded-[32px] bg-red-400 px-8 py-5 text-lg font-black text-white transition-all hover:-translate-y-1 hover:bg-red-500 active:translate-y-[2px] shadow-[0_8px_0_rgba(240,100,100,1)] active:shadow-none"
              >
                <div className="absolute -inset-2 rounded-[40px] bg-red-400 opacity-20 blur-xl transition duration-500 group-hover:opacity-40"></div>
                <span className="material-symbols-outlined font-bold text-2xl">emergency</span>
                啟動緊急救援轉接
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['FIR 節點', overview.firCount, '涵蓋數 🌍', 'bg-blue-50 border-blue-100 text-blue-500'],
              ['設施總數', overview.facilityCount, '聯絡端 🏢', 'bg-purple-50 border-purple-100 text-purple-500'],
              ['資料信任', overview.verifiedFacilityCount, '已驗證 ✅', 'bg-emerald-50 border-emerald-100 text-emerald-500'],
            ].map(([label, value, detail, colorClass]) => (
              <div key={String(label)} className={`rounded-[32px] border-[3px] p-6 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(255,154,171,0.25)] ${colorClass}`}>
                <div className="text-sm font-black opacity-80">{label}</div>
                <div className="mt-2 text-[56px] font-black leading-none">{value}</div>
                <div className="mt-2 text-sm font-bold opacity-80">{detail}</div>
              </div>
            ))}
            
            <div className="rounded-[32px] border-[3px] border-pink-100 bg-pink-50 p-6 shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(255,154,171,0.25)]">
              <div className="text-sm font-black text-primary">24H 更新頻率 📈</div>
              <div className="mt-2 h-[80px] w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_TREND_DATA}>
                    <Tooltip 
                      cursor={{ stroke: '#ffc2d1', strokeWidth: 2, strokeDasharray: '4 4' }}
                      contentStyle={{ backgroundColor: '#fff', border: '3px solid #ffe5ec', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', fontWeight: 'bold', color: '#4a4e69' }}
                      itemStyle={{ color: '#ff9aab', fontWeight: 'bold', fontSize: '16px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ff9aab" 
                      strokeWidth={5} 
                      dot={{ r: 5, fill: '#ff9aab', strokeWidth: 3, stroke: '#fff' }} 
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-[32px] border-[3px] border-yellow-100 bg-yellow-50 p-6 shadow-sm flex flex-col justify-between overflow-hidden sm:col-span-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(255,154,171,0.25)]">
              <div className="text-sm font-black text-yellow-600 mb-2">區域設施分佈 🌸</div>
              <div className="h-[140px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '3px solid #ffe5ec', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', fontWeight: 'bold', color: '#4a4e69' }}
                      itemStyle={{ color: '#ff9aab', fontWeight: 'bold', fontSize: '14px' }}
                    />
                    <Pie
                      data={regionData}
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <section id="status-section" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] w-full">
        <GlassPanel>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-black tracking-widest text-primary uppercase">Highlights</div>
              <h2 className="mt-1 text-2xl font-black text-on-surface">重點就緒度 🎯</h2>
            </div>
            {isLoading && <span className="material-symbols-outlined animate-sweet-spin text-primary text-4xl drop-shadow-[0_0_12px_rgba(255,154,171,0.6)]">toys</span>}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {highlightedClusters.map((cluster) => (
              <GlassCard key={cluster.firIcao} className="w-full flex justify-between flex-col">
                <div>
                  <div className="text-sm font-black text-secondary">{cluster.firIcao}</div>
                  <h3 className="mt-1 text-xl font-black text-on-surface truncate pr-2">{cluster.firName}</h3>
                </div>
                
                <div className="mt-4 mb-5">
                  <Badge
                    active={cluster.statusTone === 'hot'}
                    color={cluster.statusTone === 'stable' ? 'primary' : 'secondary'}
                  >
                    {cluster.readinessLabel}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm font-bold text-slate-500 bg-slate-50 border-2 border-slate-100 p-3 rounded-[24px]">
                  <div className="flex justify-between items-center px-2 py-1">
                    <span>設施數</span><span className="text-primary font-black text-[16px]">{cluster.facilityCount}</span>
                  </div>
                  <div className="flex justify-between items-center px-2 py-1">
                    <span>AFTN</span><span className="text-blue-500 truncate ml-2 font-black">{cluster.aftnAddresses[0] ?? '-'}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="text-[13px] font-black tracking-widest text-primary uppercase">Health Matrix</div>
          <h2 className="mt-1 text-2xl font-black text-on-surface">驗證矩陣 ✨</h2>
          <div className="mt-6 flex flex-col gap-4">
            {validations.map((validation) => (
              <div
                key={validation.name}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[28px] bg-white border-[3px] border-slate-100 p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,154,171,0.25)] hover:scale-[1.01] shadow-sm"
              >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-[20px] bg-pink-50 text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-2xl">dns</span>
                   </div>
                  <div>
                    <div className="text-[16px] font-black text-on-surface">
                      {validation.name}
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-400 truncate max-w-[180px]">{validation.url}</div>
                  </div>
                </div>
                <div className={`shrink-0 inline-flex items-center justify-center rounded-[20px] px-4 py-2 text-sm font-black border-2 ${validation.isAccessible ? 'bg-emerald-50 text-emerald-500 border-emerald-200' : 'bg-orange-50 text-orange-500 border-orange-200'}`}>
                  {validation.isAccessible ? `連線成功 🌸` : '使用快取 🍁'}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[13px] font-black tracking-widest text-primary uppercase">Daily Log</div>
              <h2 className="mt-1 text-2xl font-black text-on-surface">今日飛行日誌 📖</h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { id: 1, time: '08:30', title: `系統完成 AIRAC ${overview.latestAirac} 週期資料同步` },
              { id: 2, time: '10:15', title: `${overview.healthySources} 個資料來源連線確認，訊號穩定 ✨` },
              { id: 3, time: '11:42', title: `涵蓋全球 ${overview.firCount} 個飛航情報區，準備就緒！` },
              { id: 4, time: '12:00', title: `已成功驗證 ${overview.verifiedFacilityCount} 個管制設施通訊通道` }
            ].map((log) => (
              <div key={log.id} className="flex items-center gap-4 rounded-[24px] bg-gradient-to-r from-pink-50/50 to-white border-2 border-pink-100/50 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(255,154,171,0.15)] hover:border-pink-200">
                <div className="flex -mt-0.5 items-center justify-center text-yellow-400 drop-shadow-sm">
                  <span className="material-symbols-outlined fill-current text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-[12px] bg-white border-2 border-slate-100 px-3 py-1 font-mono text-[13px] font-black text-slate-400 shadow-sm">{log.time}</span>
                  <span className="text-[15px] font-bold text-on-surface">{log.title}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </div>
  );
}
