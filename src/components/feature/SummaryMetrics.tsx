import React, { useEffect, useState } from 'react';
import { TelemetryAggregates } from '../../types';
import { StatCard } from '../ui/StatCard';
import styles from './SummaryMetrics.module.css';

interface Props {
  aggregates: TelemetryAggregates;
}

export const SummaryMetrics: React.FC<Props> = ({ aggregates }) => {
  const [announcement, setAnnouncement] = useState('');

  // Throttle screen reader announcements to avoid spamming at 60Hz
  useEffect(() => {
    const interval = setInterval(() => {
      if (aggregates.criticalServers > 0) {
        setAnnouncement(`Warning: ${aggregates.criticalServers} critical servers require attention.`);
      } else {
        setAnnouncement('All servers operating normally.');
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [aggregates.criticalServers]);

  return (
    <div className={styles.grid}>
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="visually-hidden" 
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {announcement}
      </div>
      <StatCard title="Total Servers" value={aggregates.totalServers.toLocaleString()} />
      <StatCard 
        title="Avg CPU" 
        value={`${aggregates.averageCpu.toFixed(1)}%`} 
        colorHint={aggregates.averageCpu > 80 ? 'critical' : aggregates.averageCpu > 60 ? 'warning' : 'healthy'}
      />
      <StatCard 
        title="Avg Memory" 
        value={`${aggregates.averageMemory.toFixed(1)}%`}
        colorHint={aggregates.averageMemory > 80 ? 'critical' : aggregates.averageMemory > 60 ? 'warning' : 'healthy'} 
      />
      <StatCard title="Critical" value={aggregates.criticalServers.toLocaleString()} colorHint="critical" />
      <StatCard title="Offline" value={aggregates.offlineServers.toLocaleString()} colorHint="offline" />
    </div>
  );
};
