import { describe, it, expect } from 'vitest';
import { processDashboardData } from './dataProcessing';
import { TelemetryUpdate } from '../types';

describe('processDashboardData (Single-Pass Optimized)', () => {
  const mockData: TelemetryUpdate[] = [
    { id: '1', serverId: 's1', region: 'us-east', cpuUsage: 50, memUsage: 50, networkIn: 100, networkOut: 100, timestamp: 0, status: 'healthy' },
    { id: '2', serverId: 's2', region: 'us-west', cpuUsage: 95, memUsage: 60, networkIn: 200, networkOut: 200, timestamp: 0, status: 'critical' },
    { id: '3', serverId: 's3', region: 'eu-central', cpuUsage: 80, memUsage: 85, networkIn: 50, networkOut: 50, timestamp: 0, status: 'warning' },
    { id: '4', serverId: 's4', region: 'us-east', cpuUsage: 0, memUsage: 0, networkIn: 0, networkOut: 0, timestamp: 0, status: 'offline' }
  ];

  it('filters by region correctly and aggregates based on filter', () => {
    const { filtered, aggregates } = processDashboardData(mockData, { region: 'us-east', status: 'all' }, { field: 'cpuUsage', direction: 'desc' }, 10);
    expect(filtered.length).toBe(2);
    expect(filtered[0].serverId).toBe('s1'); // cpu 50
    expect(filtered[1].serverId).toBe('s4'); // cpu 0
    expect(aggregates.totalServers).toBe(2);
    expect(aggregates.averageCpu).toBe(25); // (50 + 0) / 2
  });

  it('sorts bounded top-K correctly ascending', () => {
    const { filtered } = processDashboardData(mockData, { region: 'all', status: 'all' }, { field: 'cpuUsage', direction: 'asc' }, 2);
    // Should get lowest 2 CPU usages
    expect(filtered.length).toBe(2);
    expect(filtered[0].cpuUsage).toBe(0); // s4
    expect(filtered[1].cpuUsage).toBe(50); // s1
  });

  it('sorts bounded top-K correctly descending', () => {
    const { filtered } = processDashboardData(mockData, { region: 'all', status: 'all' }, { field: 'cpuUsage', direction: 'desc' }, 2);
    // Should get highest 2 CPU usages
    expect(filtered.length).toBe(2);
    expect(filtered[0].cpuUsage).toBe(95); // s2
    expect(filtered[1].cpuUsage).toBe(80); // s3
  });

  it('handles empty data', () => {
    const { filtered, aggregates } = processDashboardData([], { region: 'all', status: 'all' }, { field: 'cpuUsage', direction: 'desc' }, 10);
    expect(filtered.length).toBe(0);
    expect(aggregates.totalServers).toBe(0);
    expect(aggregates.averageCpu).toBe(0);
  });
});
