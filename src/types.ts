export type TabType = 'sectors' | 'sos' | 'rescue' | 'chat';

export interface FIRData {
  regionCode: string;
  centerName: string;
  tel: string;
  fax: string;
  aftn: string;
  lastUpdated: string;
}

export interface SectorStatus {
  id: string;
  name: string;
  statusText: string;
  isEmergency: boolean;
  activeTracks: number;
  frequency: string;
}

export interface OperatorDetails {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface ActiveIncident {
  id: string;
  etaMinutes: number;
  operator: OperatorDetails;
}

export interface DashboardData {
  currentSectorName: string;
  connectionStatus: string;
  monitoringStatus: string;
}

export interface MapUIPosition {
  top: string;
  left: string;
  align: string;
  color: string;
  shape: string;
  shortName: string;
}
