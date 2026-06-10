import { ActiveIncident, FacilityType, RegionMapConfig } from '../types';

export const REGION_LABELS: Record<string, string> = {
  TW: '台灣',
  JP: '日本',
  AU: '澳洲',
  UK: '英國',
  US: '美國',
  SG: '新加坡',
  HK: '香港',
  CA: '加拿大',
  BR: '巴西',
  EU: '歐洲',
};

export const REGION_FLAGS: Record<string, string> = {
  TW: 'TW',
  JP: 'JP',
  AU: 'AU',
  UK: 'UK',
  US: 'US',
  SG: 'SG',
  HK: 'HK',
  CA: 'CA',
  BR: 'BR',
  EU: 'EU',
};

export const REGION_MAP_CONFIG: Record<string, RegionMapConfig> = {
  TW: {
    top: '28%',
    left: '55%',
    shortName: 'Taipei',
    accentClass: 'from-sky-300 via-cyan-300 to-teal-200',
    haloClass: 'bg-cyan-400/30',
  },
  JP: {
    top: '20%',
    left: '68%',
    shortName: 'Japan',
    accentClass: 'from-amber-200 via-orange-300 to-rose-300',
    haloClass: 'bg-orange-400/25',
  },
  AU: {
    top: '64%',
    left: '66%',
    shortName: 'Australia',
    accentClass: 'from-emerald-200 via-teal-300 to-cyan-300',
    haloClass: 'bg-emerald-400/25',
  },
  UK: {
    top: '24%',
    left: '24%',
    shortName: 'London',
    accentClass: 'from-violet-200 via-fuchsia-200 to-pink-300',
    haloClass: 'bg-fuchsia-400/25',
  },
  US: {
    top: '42%',
    left: '10%',
    shortName: 'FAA',
    accentClass: 'from-lime-200 via-emerald-300 to-teal-300',
    haloClass: 'bg-lime-400/20',
  },
  SG: {
    top: '46%',
    left: '61%',
    shortName: '新加坡',
    accentClass: 'from-cyan-200 via-sky-300 to-blue-300',
    haloClass: 'bg-sky-400/25',
  },
  HK: {
    top: '34%',
    left: '58%',
    shortName: '香港',
    accentClass: 'from-rose-200 via-orange-300 to-amber-300',
    haloClass: 'bg-rose-400/25',
  },
  CA: {
    top: '18%',
    left: '8%',
    shortName: '加拿大',
    accentClass: 'from-indigo-200 via-sky-200 to-cyan-200',
    haloClass: 'bg-indigo-400/25',
  },
  BR: {
    top: '68%',
    left: '26%',
    shortName: '巴西',
    accentClass: 'from-emerald-200 via-lime-300 to-amber-300',
    haloClass: 'bg-emerald-400/25',
  },
  EU: {
    top: '18%',
    left: '31%',
    shortName: '歐洲',
    accentClass: 'from-fuchsia-200 via-violet-200 to-indigo-300',
    haloClass: 'bg-violet-400/25',
  },
};

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  ACC: '區域管制中心',
  ARTCC: '航路交通管制中心',
  APP: '進場管制',
  FIC: '飛航情報中心',
  RCC: '搜救協調中心',
  MED: '醫療協調',
  AFIS: '飛航情報服務',
  TWR: '塔台',
  'TWR/APP': '塔台／進場',
};

export const SOURCE_STATUS_LABELS = {
  live: '即時',
  cache: '快取',
} as const;

export const MOCK_INCIDENT: ActiveIncident = {
  id: 'INC-2026-0610',
  etaMinutes: 4,
  operator: {
    id: 'OP-001',
    name: '林怡君',
    role: '飛航情報協調席主管',
  },
};
