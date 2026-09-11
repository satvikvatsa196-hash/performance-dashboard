import { Region, ServerStatus, TelemetryUpdate } from '../types';

// Simple seeded PRNG for deterministic data generation
class PRNG {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextRange(min: number, max: number) {
    return min + this.next() * (max - min);
  }
}

const REGIONS: Region[] = ['us-east', 'us-west', 'eu-central', 'ap-south'];

export const DatasetSizes = {
  small: 100,
  medium: 1000,
  large: 10000,
  stress: 50000,
  extreme: 100000
};

export function generateInitialDataset(size: number, seed: number = 12345): TelemetryUpdate[] {
  const prng = new PRNG(seed);
  const dataset: TelemetryUpdate[] = new Array(size);

  for (let i = 0; i < size; i++) {
    const region = REGIONS[Math.floor(prng.next() * REGIONS.length)];
    const cpuUsage = prng.nextRange(5, 95);
    const memUsage = prng.nextRange(10, 90);
    
    let status: ServerStatus = 'healthy';
    if (cpuUsage > 90 || memUsage > 90) status = 'critical';
    else if (cpuUsage > 75 || memUsage > 80) status = 'warning';

    // Simulate 1% offline
    if (prng.next() < 0.01) status = 'offline';

    dataset[i] = {
      id: `metric-${i}`,
      serverId: `srv-${region}-${1000 + i}`,
      region,
      cpuUsage: status === 'offline' ? 0 : cpuUsage,
      memUsage: status === 'offline' ? 0 : memUsage,
      networkIn: status === 'offline' ? 0 : prng.nextRange(10, 1000),
      networkOut: status === 'offline' ? 0 : prng.nextRange(10, 1000),
      timestamp: Date.now(),
      status
    };
  }

  return dataset;
}

export function simulateTick(currentData: TelemetryUpdate[], seed: number = 54321): void {
  const prng = new PRNG(seed + (Date.now() % 10000)); // semi-deterministic for ticks
  const now = Date.now();
  
  for (let i = 0; i < currentData.length; i++) {
    const server = currentData[i];
    
    // Only ~10% of servers update significantly per tick to simulate realistic load
    // This allows testing how the UI diffs unchanged data vs changed data.
    if (prng.next() > 0.1) continue;

    if (server.status === 'offline') {
      // 5% chance to recover
      if (prng.next() < 0.05) server.status = 'healthy';
      continue;
    }

    // Random walk for CPU and Mem
    server.cpuUsage = Math.max(0, Math.min(100, server.cpuUsage + prng.nextRange(-5, 5)));
    server.memUsage = Math.max(0, Math.min(100, server.memUsage + prng.nextRange(-2, 2)));
    server.networkIn = Math.max(0, server.networkIn + prng.nextRange(-50, 50));
    server.networkOut = Math.max(0, server.networkOut + prng.nextRange(-50, 50));
    server.timestamp = now;

    if (server.cpuUsage > 90 || server.memUsage > 90) {
      server.status = 'critical';
    } else if (server.cpuUsage > 75 || server.memUsage > 80) {
      server.status = 'warning';
    } else {
      server.status = 'healthy';
    }

    // 0.1% chance to go offline suddenly
    if (prng.next() < 0.001) {
      server.status = 'offline';
      server.cpuUsage = 0;
      server.memUsage = 0;
      server.networkIn = 0;
      server.networkOut = 0;
    }
  }
}
