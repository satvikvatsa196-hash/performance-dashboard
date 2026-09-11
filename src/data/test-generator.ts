import { generateInitialDataset, simulateTick, DatasetSizes } from './generator';

function testSize(name: string, size: number) {
  console.log(`\n--- Testing ${name} dataset (${size.toLocaleString()} records) ---`);
  
  // Test Initial Generation
  const startGen = performance.now();
  const dataset = generateInitialDataset(size);
  const endGen = performance.now();
  console.log(`Initial Generation: ${(endGen - startGen).toFixed(2)} ms`);
  
  // Test Mutating Tick
  const startTick = performance.now();
  simulateTick(dataset);
  const endTick = performance.now();
  console.log(`Simulate 1 Tick: ${(endTick - startTick).toFixed(2)} ms`);
  
  // Test 60 Ticks (1 second of 60Hz updates)
  const start60 = performance.now();
  for(let i = 0; i < 60; i++) {
    simulateTick(dataset, i);
  }
  const end60 = performance.now();
  console.log(`Simulate 60 Ticks (1 sec real-time): ${(end60 - start60).toFixed(2)} ms`);
}

testSize('Small', DatasetSizes.small);
testSize('Medium', DatasetSizes.medium);
testSize('Large', DatasetSizes.large);
testSize('Stress', DatasetSizes.stress);
testSize('Extreme', DatasetSizes.extreme);
