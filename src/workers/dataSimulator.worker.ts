import { WorkerCommand, WorkerMessage } from '../types/WorkerMessages';
import { TelemetryUpdate, DashboardConfig } from '../types';
import { generateInitialDataset, simulateTick } from '../data/generator';
import { processDashboardData } from '../utils/dataProcessing';

let config: DashboardConfig | null = null;
let rawData: TelemetryUpdate[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;

function broadcast(message: WorkerMessage) {
  self.postMessage(message);
}

function handleTick() {
  if (!config || rawData.length === 0) return;

  try {
    // 1. Mutate dataset on background thread
    simulateTick(rawData);

    // 2. Process data entirely off main thread
    // Only returning top 100 to avoid serialization cost over postMessage
    const { filtered, aggregates } = processDashboardData(
      rawData, 
      config.filters, 
      config.sort, 
      100
    );

    // 3. Dispatch tiny payload back to main thread
    broadcast({
      type: 'TICK',
      payload: {
        aggregates,
        visibleServers: filtered,
        totalFilteredServers: filtered.length
      }
    });
  } catch (error) {
    broadcast({ type: 'ERROR', payload: { message: error instanceof Error ? error.message : 'Unknown error during tick' }});
  }
}

function startLoop() {
  if (intervalId !== null) clearInterval(intervalId);
  if (!config) return;
  
  const ms = 1000 / config.simulation.tickRateHz;
  intervalId = setInterval(handleTick, ms);
}

function stopLoop() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const command = e.data;

  switch (command.type) {
    case 'INIT':
      config = command.payload;
      rawData = generateInitialDataset(config.simulation.totalServers);
      broadcast({ type: 'READY' });
      break;

    case 'UPDATE_CONFIG': {
      if (!config) return;
      const oldServers = config.simulation.totalServers;
      config = { ...config, ...command.payload };
      
      // Regenerate array only if user changed dataset size
      if (oldServers !== config.simulation.totalServers) {
        rawData = generateInitialDataset(config.simulation.totalServers);
        broadcast({ type: 'READY' });
      }
      
      // Update interval immediately if tick rate changed
      if (intervalId !== null) {
        startLoop();
      }
      break;
    }

    case 'START':
      startLoop();
      break;

    case 'STOP':
      stopLoop();
      break;
  }
};
