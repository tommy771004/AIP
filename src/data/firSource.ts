import { FIRData, SectorStatus, DashboardData, ActiveIncident, MapUIPosition } from '../types';

export const firDataList: FIRData[] = [
  {
    regionCode: 'taipei',
    centerName: '台北飛航情報區',
    tel: '+886 2 2514 1234',
    fax: '+886 2 2514 5678',
    aftn: 'RCTPZQZX',
    lastUpdated: new Date().toISOString()
  },
  {
    regionCode: 'fukuoka',
    centerName: '福岡飛航情報區',
    tel: '+81 92 123 4567',
    fax: '+81 92 123 4568',
    aftn: 'RJDCHQXO',
    lastUpdated: new Date().toISOString()
  },
  {
    regionCode: 'manila',
    centerName: '馬尼拉飛航情報區',
    tel: '+63 2 8123 4567',
    fax: '+63 2 8123 4568',
    aftn: 'RPHIYNYX',
    lastUpdated: new Date().toISOString()
  }
];

export const getFirDataByCode = (code: string) => firDataList.find(f => f.regionCode === code);

export const FIR_UI_CONFIG: Record<string, MapUIPosition> = {
  taipei: {
    top: '30%', left: '45%', align: 'scale-120 z-40',
    color: 'bg-primary text-on-primary',
    shape: 'rounded-[40%_60%_70%_30%/40%_50%_60%_50%] w-32 h-24',
    shortName: '台北'
  },
  fukuoka: {
    top: '15%', left: '65%', align: 'scale-120 z-40',
    color: 'bg-surface-variant text-on-surface-variant',
    shape: 'rounded-[50%_50%_30%_70%/60%_40%_60%_40%] w-28 h-28 border-2 border-white/50',
    shortName: '福岡'
  },
  manila: {
    top: '60%', left: '40%', align: 'scale-120 z-40',
    color: 'bg-tertiary-container text-on-tertiary-container',
    shape: 'rounded-[60%_40%_50%_50%/40%_60%_40%_60%] w-36 h-28 border-2 border-white/50',
    shortName: '馬尼拉'
  }
};

export const MOCK_SECTORS: SectorStatus[] = [
  {
    id: 'taipei',
    name: '台北飛航情報區',
    statusText: '活動中 • 3 個區域',
    isEmergency: true,
    activeTracks: 3,
    frequency: 'VHF 121.5 MHz'
  },
  {
    id: 'fukuoka',
    name: '福岡飛航情報區',
    statusText: '待命 • 0 個警報',
    isEmergency: false,
    activeTracks: 0,
    frequency: '無異常'
  },
  {
    id: 'manila',
    name: '馬尼拉飛航情報區',
    statusText: '監控中 • 1 個建議',
    isEmergency: false,
    activeTracks: 1,
    frequency: '注意'
  }
];

export const MOCK_DASHBOARD: DashboardData = {
  currentSectorName: '台北飛航情報區',
  connectionStatus: '安全連線',
  monitoringStatus: '全面監控中'
};

export const MOCK_INCIDENT: ActiveIncident = {
    id: 'INC-2026-0610',
    etaMinutes: 4,
    operator: {
      id: 'OP-001',
      name: 'Sarah J.',
      role: '飛航情報區協調員',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKGLI-xTR7-0uldhivkkxbAXGYfP_OSMPt7bKKsvLBv_1Qs8AtgNLqFnIN4uh0H_ksHmlAdOKIPPqMtC9xXytB6puaAgQogFt3RqJJieImreJ32TlVSFMdzpInYlf1XYiUqOPNSrUtnLNVqnZal9G28pcSRSKKXs7v9KsIY4xpGOybkb4I1zo9eH6_wi4hzN7FGlQSAsg6FCYq4c5P0A-QVq0yzKpJ57OiFTO0Je5x_fU5zPqirN78Yo0jeac88RTpe9FEMOh1fIpO'
    }
};
