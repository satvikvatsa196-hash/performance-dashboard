import { DashboardConfig } from './Config';
import { TelemetryAggregates, TelemetryUpdate } from './Telemetry';

// Worker Requests (Main Thread -> Worker)
export interface WorkerCommandInit {
  type: 'INIT';
  payload: DashboardConfig;
}

export interface WorkerCommandUpdateConfig {
  type: 'UPDATE_CONFIG';
  payload: Partial<DashboardConfig>;
}

export interface WorkerCommandStart {
  type: 'START';
}

export interface WorkerCommandStop {
  type: 'STOP';
}

export type WorkerCommand = 
  | WorkerCommandInit 
  | WorkerCommandUpdateConfig 
  | WorkerCommandStart 
  | WorkerCommandStop;

// Worker Responses (Worker -> Main Thread)
export interface WorkerMessageTick {
  type: 'TICK';
  payload: {
    aggregates: TelemetryAggregates;
    // Sliced view for the virtualized table
    visibleServers: TelemetryUpdate[];
    totalFilteredServers: number;
    timestamp: number;
  };
}

export interface WorkerMessageError {
  type: 'ERROR';
  payload: {
    message: string;
  };
}

export interface WorkerMessageReady {
  type: 'READY';
}

export type WorkerMessage = 
  | WorkerMessageTick 
  | WorkerMessageError 
  | WorkerMessageReady;
