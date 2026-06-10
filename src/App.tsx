import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Navigation from './components/Navigation';
import { Container } from './components/StyledComponents';
import Dashboard from './views/Dashboard';
import SectorsMap from './views/SectorsMap';
import RescueContacts from './views/RescueContacts';
import EmergencyPanel from './views/EmergencyPanel';
import OpsNotebook from './views/OpsNotebook';
import { buildFirClusters, buildOperationsOverview } from './lib/firAnalytics';
import { ApiResponse, FirContactRecord, PaginatedContacts, SourceValidation, TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sos');
  const [emergencyRecord, setEmergencyRecord] = useState<FirContactRecord | null>(null);
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

  /** SOS：優先挑搜救協調中心（RCC），其次第一個 hot cluster 的首設施 */
  function handleTriggerSOS() {
    const rcc = records.find((record) => record.facilityType === 'RCC');
    const fallback = firClusters[0]?.facilities[0] ?? records[0] ?? null;
    setEmergencyRecord(rcc ?? fallback);
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
          <div id="error-banner" className="mb-8 flex items-center gap-4 rounded-3xl border-2 border-red-200 bg-red-50 p-5">
            <span className="material-symbols-outlined text-3xl text-red-400">error</span>
            <div className="text-[15px] font-bold text-red-500">
              連線異常：{error}
              <span className="ml-2 text-red-400">已盡可能顯示快取資料。</span>
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
            onTriggerSOS={handleTriggerSOS}
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
            onCall={(record) => setEmergencyRecord(record)}
          />
        )}
        {activeTab === 'chat' && <OpsNotebook />}
      </Container>

      {emergencyRecord && (
        <EmergencyPanel record={emergencyRecord} onClose={() => setEmergencyRecord(null)} />
      )}
    </div>
  );
}
