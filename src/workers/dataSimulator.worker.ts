import { WorkerCommand, WorkerMessage } from '../types/WorkerMessages';
import { TelemetryUpdate, DashboardConfig } from '../types';
import { generateInitialDataset, simulateTick } from '../data/generator';
import { processDashboardData } from '../utils/dataProcessing';

let config: DashboardConfig | null = null;
let rawData: TelemetryUpdate[] = [];
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let isRunning = false;

function broadcast(message: WorkerMessage) {
  self.postMessage(message);
}

function handleTick() {
  if (!config || rawData.length === 0 || !isRunning) return;

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
        totalFilteredServers: filtered.length,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    broadcast({ type: 'ERROR', payload: { message: error instanceof Error ? error.message : 'Unknown error during tick' }});
  }

  if (isRunning && config) {
    const ms = 1000 / config.simulation.tickRateHz;
    timeoutId = setTimeout(handleTick, ms);
  }
}

function startLoop() {
  if (isRunning) return;
  isRunning = true;
  if (!config) return;
  
  handleTick();
}

function stopLoop() {
  isRunning = false;
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
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
      
      // Restart loop if it was already running to apply new tick rate
      if (isRunning) {
        stopLoop();
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
