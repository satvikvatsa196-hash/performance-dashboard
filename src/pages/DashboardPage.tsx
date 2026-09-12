import React, { useReducer } from 'react';
import { DashboardConfig, Region, ServerStatus } from '../types';
import { ControlPanel } from '../components/feature/ControlPanel';
import { SummaryMetrics } from '../components/feature/SummaryMetrics';
import { TelemetryTable } from '../components/feature/TelemetryTable';
import { MacroTrendChart } from '../components/feature/MacroTrendChart';
import { useDataWorker } from '../hooks/useDataWorker';
import styles from './DashboardPage.module.css';

type ConfigAction =
  | { type: 'SET_REGION'; payload: Region }
  | { type: 'SET_STATUS'; payload: ServerStatus }
  | { type: 'SET_DATASET_SIZE'; payload: number }
  | { type: 'SET_FULL_CONFIG'; payload: DashboardConfig };

function configReducer(state: DashboardConfig, action: ConfigAction): DashboardConfig {
  switch (action.type) {
    case 'SET_REGION':
      return { ...state, filters: { ...state.filters, region: action.payload } };
    case 'SET_STATUS':
      return { ...state, filters: { ...state.filters, status: action.payload } };
    case 'SET_DATASET_SIZE':
      return { ...state, simulation: { ...state.simulation, totalServers: action.payload } };
    case 'SET_FULL_CONFIG':
      return action.payload;
    default:
      return state;
  }
}

export const DashboardPage: React.FC = () => {
  const [config, dispatch] = useReducer(configReducer, {
    filters: { region: 'all', status: 'all' },
    sort: { field: 'cpuUsage', direction: 'desc' },
    simulation: { tickRateHz: 60, totalServers: 1000 }
  });

  const { filteredData, aggregates, chartData, fps, isLoading, error } = useDataWorker(config);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Global Cloud Telemetry</h1>
          <p className={styles.subtitle}>Web Worker Architecture</p>
        </div>
        <div className={styles.performanceInfo}>
          <span>FPS: {fps}</span>
          {isLoading && <span className={styles.loadingBadge}>Loading...</span>}
        </div>
      </header>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <main className={styles.main} style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        <ControlPanel config={config} onChange={(c) => dispatch({ type: 'SET_FULL_CONFIG', payload: c })} />
        {aggregates && <SummaryMetrics aggregates={aggregates} />}
        
        <div className={styles.visualizationGrid}>
          <MacroTrendChart dataset={chartData} />
          <TelemetryTable data={filteredData} />
        </div>
      </main>
    </div>
  );
};
