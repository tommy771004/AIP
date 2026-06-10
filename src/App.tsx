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
  }, []);

  const firClusters = useMemo(() => buildFirClusters(records), [records]);
  const overview = useMemo(() => buildOperationsOverview(records, validations), [records, validations]);

  if (isCallActive) {
    return <ActiveCall onEndCall={() => setIsCallActive(false)} firClusters={firClusters} />;
  }

  return (
    <div className="app-shell min-h-screen text-on-surface selection:bg-primary selection:text-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-orb ambient-orb-cyan"></div>
        <div className="ambient-orb ambient-orb-amber"></div>
        <div className="ambient-grid"></div>
      </div>

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        facilityCount={overview.facilityCount}
        healthySources={overview.healthySources}
      />

      <Container>
        {error && (
          <div className="mb-6 rounded-[22px] border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
            API 資料流目前降級，畫面將盡量使用伺服器仍可回傳的資料。錯誤：{error}
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
          <div className="panel-surface flex min-h-[520px] flex-col justify-between rounded-[32px] border border-white/10 p-8">
            <div>
              <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-primary/80">作業通道</div>
              <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.04em] text-on-surface md:text-5xl">
                安全協調模式將在完成認證中繼終端後啟用。
              </h2>
              <p className="mt-4 max-w-2xl text-base text-on-surface-variant">
                目前版本聚焦在 FIR 聯絡情報、來源健康度與緊急升級流程。下一階段可接入值席通訊、稽核紀錄與權限化作業流程。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['規劃中', '值席認證工作階段'],
                ['下一步', 'AFTN 模板產生'],
                ['後續', 'AIRAC 差異告警'],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">{label}</div>
                  <div className="mt-2 text-lg font-semibold text-on-surface">{detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
