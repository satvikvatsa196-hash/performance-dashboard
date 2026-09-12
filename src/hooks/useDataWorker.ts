import { useState, useEffect, useRef } from 'react';
import { DashboardConfig, TelemetryUpdate, TelemetryAggregates, ChartDataset, WorkerMessage, WorkerCommand } from '../types';

export function useDataWorker(config: DashboardConfig) {
  const [filteredData, setFilteredData] = useState<TelemetryUpdate[]>([]);
  const [aggregates, setAggregates] = useState<TelemetryAggregates | null>(null);
  const [chartData, setChartData] = useState<ChartDataset>({ series: [] });
  const [fps, setFps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const prevTotalServers = useRef(config.simulation.totalServers);
  const historyRef = useRef<{ timestamp: number; cpu: number; mem: number }[]>([]);
  const frameCountRef = useRef(0);
  const lastRenderTimeRef = useRef<number>(Date.now());
  const isReadyRef = useRef(false);

  // 1. Initialize Worker
  useEffect(() => {
    // Vite built-in worker import syntax
    const worker = new Worker(new URL('../workers/dataSimulator.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;
      switch (msg.type) {
        case 'READY':
          setIsLoading(false);
          isReadyRef.current = true;
          worker.postMessage({ type: 'START' } as WorkerCommand);
          break;
        case 'ERROR':
          setError(msg.payload.message);
          setIsLoading(false);
          break;
        case 'TICK': {
          if (!isReadyRef.current) return;
          
          const currentAggs = msg.payload.aggregates;
          const tickTime = msg.payload.timestamp;
          const now = Date.now();
          
          // Maintain historical buffer on main thread purely for chart UI
          historyRef.current.push({
            timestamp: tickTime,
            cpu: currentAggs.averageCpu,
            mem: currentAggs.averageMemory
          });

          if (historyRef.current.length > 60) {
            historyRef.current.shift();
          }

          setFilteredData(msg.payload.visibleServers);
          setAggregates(currentAggs);
          setChartData({ 
            series: [
              { name: 'Avg CPU', color: '#f59e0b', data: historyRef.current.map(h => ({ timestamp: h.timestamp, value: h.cpu })) },
              { name: 'Avg Memory', color: '#3b82f6', data: historyRef.current.map(h => ({ timestamp: h.timestamp, value: h.mem })) }
            ] 
          });

          frameCountRef.current++;
          if (now - lastRenderTimeRef.current > 1000) {
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
            lastRenderTimeRef.current = now;
          }
          break;
        }
      }
    };

    setIsLoading(true);
    worker.postMessage({ type: 'INIT', payload: config });

    return () => {
      worker.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Sync Config Changes directly to Worker
  useEffect(() => {
    if (workerRef.current && isReadyRef.current) {
      if (prevTotalServers.current !== config.simulation.totalServers) {
         setIsLoading(true); // Show loading when array size changes
         prevTotalServers.current = config.simulation.totalServers;
      }
      workerRef.current.postMessage({ type: 'UPDATE_CONFIG', payload: config });
    }
  }, [config]);

  // 3. Wipe chart history immediately when filters change to prevent mismatches
  useEffect(() => {
    historyRef.current = [];
  }, [config.filters, config.simulation.totalServers]);

  return { filteredData, aggregates, chartData, fps, isLoading, error };
}
