import { TelemetryUpdate, TelemetryAggregates, FilterState, SortState } from '../types';

export function processDashboardData(
  data: readonly TelemetryUpdate[],
  filter: FilterState,
  sort: SortState,
  limit: number = 100
): {
  filtered: TelemetryUpdate[];
  aggregates: TelemetryAggregates;
} {
  const len = data.length;
  let sumCpu = 0;
  let sumMem = 0;
  let offlineServers = 0;
  let criticalServers = 0;
  let warningServers = 0;
  let totalNetworkIn = 0;
  let totalNetworkOut = 0;
  let totalFiltered = 0;
  
  // Maintain a bounded array for Top K elements
  const topK: TelemetryUpdate[] = [];

  const filterRegion = filter.region;
  const filterStatus = filter.status;
  const checkRegion = filterRegion !== 'all';
  const checkStatus = filterStatus !== 'all';
  const sortField = sort.field;
  const isAsc = sort.direction === 'asc';

  for (let i = 0; i < len; i++) {
    const item = data[i];
    
    // 1. Filter
    if (checkRegion && item.region !== filterRegion) continue;
    if (checkStatus && item.status !== filterStatus) continue;

    // 2. Aggregate
    totalFiltered++;
    sumCpu += item.cpuUsage;
    sumMem += item.memUsage;
    totalNetworkIn += item.networkIn;
    totalNetworkOut += item.networkOut;
    
    const status = item.status;
    if (status === 'offline') offlineServers++;
    else if (status === 'critical') criticalServers++;
    else if (status === 'warning') warningServers++;

    // 3. Top-K Sorting (Bounded Insertion)
    const val = item[sortField];
    
    if (topK.length === limit) {
      const worstInTopK = topK[limit - 1][sortField];
      // Skip if this item doesn't beat the worst item in our bounded list
      if (isAsc ? val >= worstInTopK : val <= worstInTopK) {
        continue;
      }
    }

    // Insert into sorted position
    let insertIdx = topK.length;
    while (insertIdx > 0) {
      const cmp = topK[insertIdx - 1][sortField];
      if (isAsc ? val >= cmp : val <= cmp) {
        break;
      }
      insertIdx--;
    }

    topK.splice(insertIdx, 0, item);
    if (topK.length > limit) {
      topK.pop(); // Keep array bounded to exactly `limit`
    }
  }

  const aggregates: TelemetryAggregates = {
    averageCpu: totalFiltered > 0 ? sumCpu / totalFiltered : 0,
    averageMemory: totalFiltered > 0 ? sumMem / totalFiltered : 0,
    totalServers: totalFiltered,
    offlineServers,
    criticalServers,
    warningServers,
    totalNetworkIn,
    totalNetworkOut
  };

  return { filtered: topK, aggregates };
}
