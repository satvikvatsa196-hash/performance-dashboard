import React from 'react';
import { TelemetryUpdate } from '../../types';
import { Card } from '../ui/Card';
import styles from './TelemetryTable.module.css';

interface Props {
  data: TelemetryUpdate[];
}

export const TelemetryTable: React.FC<Props> = ({ data }) => {
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
                <td colSpan={7} className={styles.empty}>No servers match the current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
