export type TabType = 'sectors' | 'sos' | 'rescue' | 'chat';

export type FacilityType = 'ACC' | 'ARTCC' | 'APP' | 'FIC' | 'RCC' | 'MED' | 'AFIS' | 'TWR' | 'TWR/APP' | 'COM' | 'NOF';

export interface FirContactRecord {
  id: string;
  firIcao: string;
  firName: string;
  facilityName: string;
  facilityType: FacilityType;
  phoneNumber: string;
  faxNumber?: string;
  aftnAddress: string;
  vhfFreq: string[];
  airacCycle: string;
  sourceUrl: string;
  sourceName: string;
  regionCode: string;
  sourceVerified: boolean;
  sourceStatus: 'live' | 'cache';
  lastValidatedAt: string;
}

export interface RegionInfo {
  code: string;
  name: string;
  count: number;
}

export interface PaginatedContacts {
  data: FirContactRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableRegions: RegionInfo[];
}

export interface SourceValidation {
  name: string;
  url: string;
  isAccessible: boolean;
  statusCode?: number;
  error?: string;
  checkedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface FirCluster {
  firIcao: string;
  firName: string;
  regionCode: string;
  airacCycle: string;
  facilityCount: number;
  facilities: FirContactRecord[];
  aftnAddresses: string[];
  frequencies: string[];
  sourceCount: number;
  verifiedFacilities: number;
  statusTone: 'hot' | 'watch' | 'stable';
  readinessLabel: string;
}

export interface OperationsOverview {
  firCount: number;
  facilityCount: number;
  verifiedFacilityCount: number;
  healthySources: number;
  totalSources: number;
  latestAirac: string;
}

export interface RegionSummary {
  regionCode: string;
  firNames: string[];
  facilityCount: number;
  liveCount: number;
}

export interface RegionMapConfig {
  top: string;
  left: string;
  shortName: string;
  accentClass: string;
  haloClass: string;
}
