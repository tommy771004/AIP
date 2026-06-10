import React, { useEffect, useState, useCallback } from 'react';
import { GlassCard, ActionButton, Badge } from '../components/StyledComponents';
import axios from 'axios';

interface RescueContactsProps {
  onCall: () => void;
}

interface FirContact {
  id: string;
  region: string;
  regionCode: string;
  facilityName: string;
  type: string;
  frequencies: string[];
  telephone: string;
  telefax?: string;
  aftn: string;
  source: string;
  sourceUrl: string;
  sourceVerified: boolean;
  airacDate?: string;
}

interface RegionInfo {
  code: string;
  name: string;
  count: number;
}

interface ApiResponse {
  success: boolean;
  data: FirContact[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableRegions: RegionInfo[];
}

const REGION_FLAGS: Record<string, string> = {
  TW: '🇹🇼',
  JP: '🇯🇵',
  AU: '🇦🇺',
  UK: '🇬🇧',
  US: '🇺🇸',
};

export default function RescueContacts({ onCall }: RescueContactsProps) {
  const [contacts, setContacts] = useState<FirContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableRegions, setAvailableRegions] = useState<RegionInfo[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 6;

  const fetchContacts = useCallback((regionCode: string, currentPage: number) => {
    setIsLoading(true);
    const params: Record<string, string | number> = { page: currentPage, pageSize: PAGE_SIZE };
    if (regionCode) params.regionCode = regionCode;

    axios.get<ApiResponse>('/api/contacts', { params })
      .then(res => {
        if (res.data.success) {
          setContacts(res.data.data);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
          if (res.data.availableRegions?.length > 0) {
            setAvailableRegions(res.data.availableRegions);
          }
        }
      })
      .catch(err => console.error("Failed to fetch contacts:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchContacts(selectedRegion, page);
  }, [selectedRegion, page, fetchContacts]);

  const handleRegionChange = (code: string) => {
    setSelectedRegion(code);
    setPage(1);
  };

  const getUiConfig = (type: string, index: number) => {
    if (type === 'RCC') {
      return {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGLxrSSSQ1LdNN7vHh8Wd6_NW1VA44f4_c3hUXFy-lpA5ihbhoATp_Jamaqd11VAVpE3qPNx-4eS-v9xaWGmJpgGSSvukFPZJbpzXA_KXd8EW3pVzaCgL8--Q9NxO2XOHrMeLpPt5IFM3YYxziZ-kqLVKK-QhEDnG1fxY5wwrsYMwuKKqnnjL8B5P7uoNpP641GXI9bEwDXzSkdJ3KiPRksAKb1l_8pxW-Idtr34Lkh3oajoegVET-aEVK_Y7MgceyyER52vLxC1oJ",
        status: "待命中", statusColor: "secondary", active: true,
        btnLabel: "直撥專線", btnIcon: "call", btnClass: "bg-surface text-secondary", offset: "md:mt-4", bgImg: "bg-tertiary-container"
      };
    } else if (type === 'MED') {
      return {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKav4-Af3U3K5U2Z8o_4dMSONWcIiwO4B80JePe6LfDnLa4GPV1evEj45SBU1-UKrvMfs7mB0by6fTuCUJasctolVpBEk2UhMM0jXQdwjTe_Cohinc_rGzrEYoPKILACQi42EsMz8e1a1HVIDtsFvKKJkN57Uv0FN00TbRPkY3eVWTeVnqkSPkufhcd6LRMuQ_SNdbS3JgAt9EfO_-H9VfQ6JwPv3hDYefv5rrCN4g686_CpgP4PqeK2PXuMrcnyjZOeUXVp-2FyUl",
        status: "活動中", statusColor: "secondary", active: true,
        btnLabel: "醫療專線", btnIcon: "emergency", btnClass: "bg-secondary text-on-secondary", offset: "", bgImg: "bg-primary-container"
      };
    } else if (['ACC', 'TWR', 'ARTCC', 'TWR/APP', 'APP', 'FIC', 'AFIS'].includes(type)) {
      return {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaLTSyZe7bIDDymdNJeuafp91CwrWKBA9iDtjBdgU3JahEOeXVKa_CtlanGrsBuzscFy7GEyw9uAwd_K13GD3EszQk9R-LXMg1EIvLTBMh_0waGdrY_38e-27i1qMTIlflI4VPjhCowfSYjdfm_Y36LWB2vHtH18X0R6zYaM1_B4yuab7Xsh_aIVJmySPaPj_BdBysq0hBAfbKs2a-9PI-5kM2ed0d0pbS83yDuU4JHAb9AFyAfFTsb9Q3djz5uxetRG1Fu4-mORq5",
        status: "監控中", statusColor: "primary", active: true,
        btnLabel: "呼叫航管", btnIcon: "headset_mic", btnClass: "bg-surface text-primary",
        offset: index % 2 === 0 ? "md:mt-8" : "md:mt-4", bgImg: "bg-tertiary-container"
      };
    } else {
      return {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaLTSyZe7bIDDymdNJeuafp91CwrWKBA9iDtjBdgU3JahEOeXVKa_CtlanGrsBuzscFy7GEyw9uAwd_K13GD3EszQk9R-LXMg1EIvLTBMh_0waGdrY_38e-27i1qMTIlflI4VPjhCowfSYjdfm_Y36LWB2vHtH18X0R6zYaM1_B4yuab7Xsh_aIVJmySPaPj_BdBysq0hBAfbKs2a-9PI-5kM2ed0d0pbS83yDuU4JHAb9AFyAfFTsb9Q3djz5uxetRG1Fu4-mORq5",
        status: "待命", statusColor: "primary", active: false,
        btnLabel: "聯絡", btnIcon: "radar", btnClass: "bg-surface text-primary",
        offset: index % 2 === 0 ? "md:mt-8" : "md:mt-4", bgImg: "bg-tertiary-container"
      };
    }
  };

  return (
    <div className="pt-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] md:text-[32px] font-bold text-on-surface mb-1">緊急聯絡人</h1>
        <p className="text-[16px] font-medium text-on-surface-variant">
          來自全球 eAIP 與 NASR 來源的即時資料。
          {total > 0 && <span className="ml-2 text-secondary">找到 {total} 筆聯絡資訊</span>}
        </p>
      </div>

      {/* Region Filter */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => handleRegionChange('')}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold border-2 transition-all ${
            selectedRegion === ''
              ? 'bg-primary text-on-primary border-primary shadow-md'
              : 'bg-surface text-on-surface border-outline/30 hover:border-primary/50'
          }`}
        >
          所有區域
        </button>
        {availableRegions.map(r => (
          <button
            key={r.code}
            onClick={() => handleRegionChange(r.code)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold border-2 transition-all flex items-center gap-1.5 ${
              selectedRegion === r.code
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-surface text-on-surface border-outline/30 hover:border-primary/50'
            }`}
          >
            <span>{REGION_FLAGS[r.code] ?? '🌐'}</span>
            <span>{r.code}</span>
            <span className={`text-[11px] rounded-full px-1.5 py-0.5 ${
              selectedRegion === r.code ? 'bg-on-primary/20' : 'bg-surface-container-high'
            }`}>{r.count}</span>
          </button>
        ))}
      </div>

      {/* Contact Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-outline gap-4">
          <span className="material-symbols-outlined text-[48px] animate-spin">refresh</span>
          <p className="text-lg">正在從來源爬取資料...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-outline gap-3">
          <span className="material-symbols-outlined text-[48px]">search_off</span>
          <p className="text-lg">在此區域找不到聯絡資訊。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {contacts.map((contact, index) => {
            const config = getUiConfig(contact.type, index);
            return (
              <GlassCard
                key={contact.id}
                className={`flex flex-col items-center text-center relative transition-transform hover:-translate-y-1 duration-300 ${config.offset}`}
              >
                <div className="absolute top-4 right-4">
                  <Badge active={config.active} color={config.statusColor as any}>{config.status}</Badge>
                </div>

                {/* Source verified indicator */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      contact.sourceVerified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                    title={contact.sourceVerified ? `來源已驗證: ${contact.sourceUrl}` : `來源離線 — 使用快取`}
                  >
                    {contact.sourceVerified ? '✓ 即時' : '⚠ 快取'}
                  </span>
                </div>

                <div className={`w-24 h-24 rounded-full mb-4 mt-2 shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)] border-4 border-surface overflow-hidden ${config.bgImg} relative`}>
                  <img src={config.image} alt={contact.facilityName} className="w-full h-full object-cover" />
                  {/* Region flag overlay */}
                  <div className="absolute bottom-0 right-0 text-[16px] leading-none">
                    {REGION_FLAGS[contact.regionCode] ?? ''}
                  </div>
                </div>

                <h3 className="text-[18px] font-semibold text-on-surface mb-0.5 px-2">
                  {contact.facilityName}
                </h3>
                <p className="text-[13px] font-medium text-secondary tracking-wide mb-1 uppercase">
                  {contact.region}
                </p>

                <div className="text-[13px] font-medium text-on-surface-variant mb-4 flex flex-col gap-1 items-center">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">call</span>
                    {contact.telephone}
                  </span>
                  {contact.telefax && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">fax</span>
                      {contact.telefax}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">settings_input_antenna</span>
                    {contact.aftn}
                  </span>
                  {contact.frequencies.length > 0 && (
                    <span className="flex items-center gap-1 text-[12px] text-tertiary">
                      <span className="material-symbols-outlined text-[14px]">radio</span>
                      {contact.frequencies[0]}
                      {contact.frequencies.length > 1 && ` +${contact.frequencies.length - 1}`}
                    </span>
                  )}
                </div>

                <ActionButton onClick={onCall} className={config.btnClass}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{config.btnIcon}</span>
                  <span>{config.btnLabel}</span>
                </ActionButton>

                <div className="w-full text-center mt-3 border-t border-outline/20 pt-2">
                  <a
                    href={contact.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-tertiary hover:text-primary transition-colors truncate block px-2"
                    title={contact.sourceUrl}
                  >
                    {contact.source}
                  </a>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-full squircle-shadow bg-surface flex items-center justify-center text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-on-primary active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-full text-[14px] font-semibold transition-all active:scale-95 ${
                p === page
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'squircle-shadow bg-surface text-on-surface hover:bg-surface-container'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-full squircle-shadow bg-surface flex items-center justify-center text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-on-primary active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>

          <span className="text-[13px] text-on-surface-variant ml-2">
            第 {page} / {totalPages} 頁 (共 {total} 筆)
          </span>
        </div>
      )}
    </div>
  );
}
