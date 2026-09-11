export type ServerStatus = 'healthy' | 'warning' | 'critical' | 'offline';
export type Region = 'us-east' | 'us-west' | 'eu-central' | 'ap-south';

export interface TelemetryUpdate {
  id: string;
  serverId: string;
  region: Region;
  cpuUsage: number;
  memUsage: number;
  networkIn: number;
  networkOut: number;
  timestamp: number;
  status: ServerStatus;
}

export interface TelemetryAggregates {
  averageCpu: number;
  averageMemory: number;
  totalServers: number;
  offlineServers: number;
  criticalServers: number;
  warningServers: number;
  totalNetworkIn: number;
  totalNetworkOut: number;
}
