import React from 'react';
import { TelemetryUpdate } from '../../types';
import { Card } from '../ui/Card';
import styles from './TelemetryTable.module.css';

interface Props {
  data: TelemetryUpdate[];
}

export const TelemetryTable: React.FC<Props> = React.memo(({ data }) => {
  return (
    <Card title="Live Server Telemetry (Top 100)" className={styles.card}>
      <div 
        className={styles.tableWrapper}
        tabIndex={0}
        aria-label="Live Server Telemetry Data"
        role="region"
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Server ID</th>
              <th>Region</th>
              <th>Status</th>
              <th>CPU %</th>
              <th>Mem %</th>
              <th>Net In (Mbps)</th>
              <th>Net Out (Mbps)</th>
            </tr>
          </thead>
          <tbody>
            {data.map(server => (
              <tr key={server.id} className={styles[`row-${server.status}`]}>
                <td>{server.serverId}</td>
                <td>{server.region}</td>
                <td>
                  <span className={styles.statusBadge} data-status={server.status}>
                    {server.status}
                  </span>
                </td>
                <td>{server.cpuUsage.toFixed(1)}</td>
                <td>{server.memUsage.toFixed(1)}</td>
                <td>{server.networkIn.toFixed(0)}</td>
                <td>{server.networkOut.toFixed(0)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className={styles.empty}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No servers match the current filters.</p>
                    <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>Try adjusting your Region or Status selections.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
});
