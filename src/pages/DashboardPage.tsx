import React, { useState } from 'react';
import { DashboardConfig } from '../types';
import { ControlPanel } from '../components/feature/ControlPanel';
import { SummaryMetrics } from '../components/feature/SummaryMetrics';
import { TelemetryTable } from '../components/feature/TelemetryTable';
import { MacroTrendChart } from '../components/feature/MacroTrendChart';
import { useDataWorker } from '../hooks/useDataWorker';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const [config, setConfig] = useState<DashboardConfig>({
    filters: { region: 'all', status: 'all' },
    sort: { field: 'cpuUsage', direction: 'desc' },
    simulation: { tickRateHz: 60, totalServers: 1000 } // Web worker easily handles 60Hz
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

      <main className={styles.main}>
        <ControlPanel config={config} onChange={setConfig} />
        {aggregates && <SummaryMetrics aggregates={aggregates} />}
        
        <div className={styles.visualizationGrid}>
          <MacroTrendChart dataset={chartData} />
          <TelemetryTable data={filteredData} />
        </div>
      </main>
    </div>
  );
};
