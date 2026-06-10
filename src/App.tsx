import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Navigation from './components/Navigation';
import { Container } from './components/StyledComponents';
import Dashboard from './views/Dashboard';
import SectorsMap from './views/SectorsMap';
import RescueContacts from './views/RescueContacts';
import ActiveCall from './views/ActiveCall';
import { buildFirClusters, buildOperationsOverview } from './lib/firAnalytics';
import { ApiResponse, FirContactRecord, PaginatedContacts, SourceValidation, TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sos');
  const [isCallActive, setIsCallActive] = useState(false);
  const [records, setRecords] = useState<FirContactRecord[]>([]);
  const [validations, setValidations] = useState<SourceValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [contactsResponse, sourcesResponse] = await Promise.all([
          axios.get<ApiResponse<PaginatedContacts>>('/api/contacts', { params: { pageSize: 100 } }),
          axios.get<ApiResponse<SourceValidation[]>>('/api/sources/validate'),
        ]);

        if (cancelled) return;

        setRecords(contactsResponse.data.data.data);
        setValidations(sourcesResponse.data.data);
        setLastSynced(new Date().toISOString());
      } catch (requestError: any) {
        if (!cancelled) {
          setError(requestError.message ?? '無法載入 FIR 情報資料流。');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const firClusters = useMemo(() => buildFirClusters(records), [records]);
  const overview = useMemo(() => buildOperationsOverview(records, validations), [records, validations]);

  if (isCallActive) {
    return <ActiveCall onEndCall={() => setIsCallActive(false)} firClusters={firClusters} />;
  }

  return (
    <div className="app-shell min-h-screen text-on-surface selection:bg-primary/30 selection:text-primary">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-orb ambient-orb-pink"></div>
        <div className="ambient-orb ambient-orb-blue"></div>
        <div className="ambient-orb ambient-orb-yellow"></div>
      </div>

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        facilityCount={overview.facilityCount}
        healthySources={overview.healthySources}
      />

      <Container id="app-container">
        {error && (
          <div id="error-banner" className="mb-8 rounded-[32px] border-[3px] border-red-200 bg-red-50 p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
               <span className="material-symbols-outlined text-3xl font-bold">error</span>
            </div>
            <div className="text-[16px] font-black text-red-500">
              連線異常：{error} ⚡ <br className="md:hidden"/><span className="text-red-400">我們會盡力顯示快取資料！</span>
            </div>
          </div>
        )}

        {activeTab === 'sos' && (
          <Dashboard
            firClusters={firClusters}
            overview={overview}
            validations={validations}
            isLoading={isLoading}
            lastSynced={lastSynced}
            onTriggerSOS={() => setIsCallActive(true)}
            onRefresh={handleRefresh}
          />
        )}
        {activeTab === 'sectors' && (
          <SectorsMap firClusters={firClusters} isLoading={isLoading} />
        )}
        {activeTab === 'rescue' && (
          <RescueContacts
            records={records}
            isLoading={isLoading}
            onCall={() => setIsCallActive(true)}
          />
        )}
        {activeTab === 'chat' && (
          <div id="chat-view" className="flex flex-1 min-h-[600px] flex-col justify-center items-center rounded-[48px] border-[4px] border-white bg-white/60 backdrop-blur-xl p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
            <div className="w-32 h-32 mb-8 rounded-[40px] bg-pink-100 border-4 border-pink-200 flex items-center justify-center shadow-inner transform rotate-6">
              <span className="material-symbols-outlined text-6xl text-pink-500 font-bold">construction</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-on-surface">施工中喵 🐾</h2>
            <p className="mt-6 max-w-lg text-[18px] text-slate-500 font-bold leading-relaxed">
              作業通道正在重新裝潢中，請先使用其他可愛的儀表板功能吧！<br/><br/>未來我們會加入更多酷炫又甜美的通訊功能！✨
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
