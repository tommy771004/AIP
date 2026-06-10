import {
  FirCluster,
  FirContactRecord,
  OperationsOverview,
  RegionSummary,
  SourceValidation,
} from '../types';

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function getStatusTone(facilities: FirContactRecord[], verifiedCount: number): FirCluster['statusTone'] {
  const hasEmergencyNode = facilities.some((facility) =>
    facility.facilityType === 'RCC' || facility.vhfFreq.some((freq) => freq.includes('121.5'))
  );

  if (hasEmergencyNode) return 'hot';
  if (verifiedCount < facilities.length) return 'watch';
  return 'stable';
}

function getReadinessLabel(tone: FirCluster['statusTone']) {
  if (tone === 'hot') return '可立即轉接';
  if (tone === 'watch') return '需檢查來源';
  return '例行涵蓋中';
}

export function buildFirClusters(records: FirContactRecord[]): FirCluster[] {
  const groups = new Map<string, FirContactRecord[]>();

  records.forEach((record) => {
    const key = `${record.firIcao}-${record.regionCode}`;
    const existing = groups.get(key) ?? [];
    existing.push(record);
    groups.set(key, existing);
  });

  return Array.from(groups.values())
    .map((facilities) => {
      const [seed] = facilities;
      const verifiedFacilities = facilities.filter((facility) => facility.sourceVerified).length;
      const statusTone = getStatusTone(facilities, verifiedFacilities);

      return {
        firIcao: seed.firIcao,
        firName: seed.firName,
        regionCode: seed.regionCode,
        airacCycle: seed.airacCycle,
        facilityCount: facilities.length,
        facilities,
        aftnAddresses: uniqueSorted(facilities.map((facility) => facility.aftnAddress)),
        frequencies: uniqueSorted(facilities.flatMap((facility) => facility.vhfFreq)),
        sourceCount: new Set(facilities.map((facility) => facility.sourceName)).size,
        verifiedFacilities,
        statusTone,
        readinessLabel: getReadinessLabel(statusTone),
      };
    })
    .sort((left, right) => {
      const toneWeight = { hot: 0, watch: 1, stable: 2 };
      if (toneWeight[left.statusTone] !== toneWeight[right.statusTone]) {
        return toneWeight[left.statusTone] - toneWeight[right.statusTone];
      }
      return left.firName.localeCompare(right.firName);
    });
}

export function buildOperationsOverview(
  records: FirContactRecord[],
  validations: SourceValidation[]
): OperationsOverview {
  const firCount = new Set(records.map((record) => record.firIcao)).size;
  const verifiedFacilityCount = records.filter((record) => record.sourceVerified).length;
  const latestAirac = records
    .map((record) => record.airacCycle)
    .sort((left, right) => right.localeCompare(left))[0] ?? '尚無資料';

  return {
    firCount,
    facilityCount: records.length,
    verifiedFacilityCount,
    healthySources: validations.filter((validation) => validation.isAccessible).length,
    totalSources: validations.length,
    latestAirac,
  };
}

export function buildRegionSummaries(records: FirContactRecord[]): RegionSummary[] {
  const groups = new Map<string, RegionSummary>();

  records.forEach((record) => {
    const current = groups.get(record.regionCode);
    if (current) {
      current.facilityCount += 1;
      current.liveCount += record.sourceVerified ? 1 : 0;
      if (!current.firNames.includes(record.firName)) {
        current.firNames.push(record.firName);
      }
      return;
    }

    groups.set(record.regionCode, {
      regionCode: record.regionCode,
      firNames: [record.firName],
      facilityCount: 1,
      liveCount: record.sourceVerified ? 1 : 0,
    });
  });

  return Array.from(groups.values()).sort((left, right) => right.facilityCount - left.facilityCount);
}
