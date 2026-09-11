import { Region, ServerStatus } from './Telemetry';

export type SortField = 'cpuUsage' | 'memUsage' | 'networkIn' | 'networkOut' | 'serverId';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface FilterState {
  region: Region | 'all';
  status: ServerStatus | 'all';
}

export interface SimulationState {
  tickRateHz: number;
  totalServers: number;
}

export interface DashboardConfig {
  filters: FilterState;
  sort: SortState;
  simulation: SimulationState;
}
