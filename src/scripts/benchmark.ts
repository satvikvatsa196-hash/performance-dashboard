import { generateInitialDataset } from '../data/generator';
import { processDashboardData } from '../utils/dataProcessing';
import { Region, ServerStatus } from '../types';

const SIZES = [1000, 10000, 50000, 100000];

function runBenchmark() {
  console.log('--- DASHBOARD PERFORMANCE BASELINE (OPTIMIZED) ---');
  
  for (const size of SIZES) {
    console.log(`\nDataset Size: ${size.toLocaleString()} records`);
    
    // 1. Generation (Cold start)
    let start = performance.now();
    const data = generateInitialDataset(size);
    const genTime = performance.now() - start;
    
    const filters = { region: 'us-east' as Region, status: 'all' as ServerStatus };
    const sortParams = { field: 'cpuUsage' as const, direction: 'desc' as const };

    // Optimized Single-Pass Pipeline
    start = performance.now();
    processDashboardData(data, filters, sortParams, 100);
    const pipelineTime = performance.now() - start;

    console.log(`- Generation:       ${genTime.toFixed(2)} ms`);
    console.log(`- Data Processing:  ${pipelineTime.toFixed(2)} ms`);
  }
}

runBenchmark();
