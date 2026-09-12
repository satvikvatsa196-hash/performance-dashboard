import { TelemetryUpdate, TelemetryAggregates, FilterState, SortState } from '../types';

class BoundedTopK {
  private items: TelemetryUpdate[] = [];
  
  constructor(private limit: number, private sortField: keyof TelemetryUpdate, private isAsc: boolean) {}

  insert(item: TelemetryUpdate) {
    const val = item[this.sortField];
    
    if (this.items.length === this.limit) {
      const worstInTopK = this.items[this.limit - 1][this.sortField];
      if (this.isAsc ? val >= worstInTopK : val <= worstInTopK) {
        return;
      }
    }

    let insertIdx = this.items.length;
    while (insertIdx > 0) {
      const cmp = this.items[insertIdx - 1][this.sortField];
      if (this.isAsc ? val >= cmp : val <= cmp) {
        break;
      }
      insertIdx--;
    }

    this.items.splice(insertIdx, 0, item);
    if (this.items.length > this.limit) {
      this.items.pop();
    }
  }

  getItems() {
    return this.items;
  }
}

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
  const topK = new BoundedTopK(limit, sort.field, sort.direction === 'asc');

  const filterRegion = filter.region;
  const filterStatus = filter.status;
  const checkRegion = filterRegion !== 'all';
  const checkStatus = filterStatus !== 'all';

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
    topK.insert(item);
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

  return { filtered: topK.getItems(), aggregates };
}
