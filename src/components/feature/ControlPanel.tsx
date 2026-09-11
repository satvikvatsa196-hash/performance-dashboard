import React from 'react';
import { Card } from '../ui/Card';
import { DashboardConfig, Region, ServerStatus } from '../../types';
import styles from './ControlPanel.module.css';

interface Props {
  config: DashboardConfig;
  onChange: (newConfig: DashboardConfig) => void;
}

export const ControlPanel: React.FC<Props> = React.memo(({ config, onChange }) => {
  return (
    <Card title="Controls" className={styles.panel}>
      <div className={styles.grid}>
        <div className={styles.group}>
          <label htmlFor="region-filter">Region Filter</label>
          <select 
            id="region-filter"
            value={config.filters.region}
            onChange={e => onChange({ ...config, filters: { ...config.filters, region: e.target.value as Region } })}
          >
            <option value="all">All Regions</option>
            <option value="us-east">US East</option>
            <option value="us-west">US West</option>
            <option value="eu-central">EU Central</option>
            <option value="ap-south">AP South</option>
          </select>
        </div>
        
        <div className={styles.group}>
          <label htmlFor="status-filter">Status Filter</label>
          <select
            id="status-filter"
            value={config.filters.status}
            onChange={e => onChange({ ...config, filters: { ...config.filters, status: e.target.value as ServerStatus } })}
          >
            <option value="all">All Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className={styles.group}>
          <label htmlFor="dataset-size">Dataset Size</label>
          <select
            id="dataset-size"
            value={config.simulation.totalServers}
            onChange={e => onChange({ ...config, simulation: { ...config.simulation, totalServers: Number(e.target.value) } })}
          >
            <option value={100}>Small (100)</option>
            <option value={1000}>Medium (1,000)</option>
            <option value={10000}>Large (10,000)</option>
            <option value={50000}>Stress (50,000)</option>
          </select>
        </div>
      </div>
    </Card>
  );
});
