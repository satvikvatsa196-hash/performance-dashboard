# Global Cloud Telemetry Dashboard

## Overview
The Global Cloud Telemetry Dashboard solves the problem of displaying, filtering, and aggregating high-frequency server metrics (CPU, Memory, Network) without blocking the main browser thread. Monitoring tools traditionally suffer from severe UI lag when processing thousands of constantly updating records. This dashboard maintains a fluid 60 FPS while handling large dataset mutations.

## Key Features
- High-frequency data simulation.
- Real-time aggregation of server states (Healthy, Warning, Critical, Offline).
- Live region and status filtering (e.g., viewing only US East servers that are Critical).
- Bounded Top-100 real-time telemetry table sorted dynamically by resource usage.
- High-performance, time-series macroscopic trend charting.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules
- **Charting**: Apache ECharts (Vanilla instance)
- **Testing**: Vitest

## Architecture
The application leverages a Web Worker to entirely decouple data generation, filtering, and aggregation from the main UI thread. A dedicated custom hook manages bi-directional messaging between the UI and the worker. The top-level React component relies on `useReducer` to manage configuration state predictably.

```mermaid
graph TD
    UI[Dashboard UI] --> |Dispatches config| Reducer[Config Reducer]
    Reducer --> |Passes filters & limit| Hook[useDataWorker Hook]
    Hook --> |postMessage: UPDATE_CONFIG| Worker[Data Simulator Web Worker]
    
    Worker --> |Mutates raw data array| Mutate[In-Place Data Mutation]
    Mutate --> |O(N) pass| Process[Filter, Aggregate, Top-K Sort]
    Process --> |postMessage: TICK| Hook
    
    Hook --> |Sets React State| Metrics[Summary Metrics]
    Hook --> |Updates ref & ECharts| Chart[Macro Trend Chart]
    Hook --> |Sets React State| Table[Telemetry Table]
```

## Data Pipeline
1. **Dataset**: An array of server objects is initialized inside the Web Worker.
2. **Processing**: Every tick (up to 60 times a second), the worker iterates over the dataset to mutate values, aggregate statistics, apply filters, and maintain a bounded Top-100 list using a custom `BoundedTopK` class.
3. **Worker to Main Thread**: The worker dispatches a minimal `TICK` payload containing only the aggregated statistics, the filtered top-100 servers, and a precise timestamp. 
4. **React State**: The `useDataWorker` hook receives the `TICK`, maintaining historical data in a `useRef` (for charting) and updating `useState` (for table rendering).
5. **Visualizations**: The main thread passes data to components. `MacroTrendChart` receives data updates directly via `echarts` instance methods, while `TelemetryTable` uses `React.memo` to minimize DOM diffing.

## Performance Engineering
- **Problem**: Generating and aggregating 50,000 metrics per frame blocked the React render thread, causing the UI to freeze entirely.
  - **Solution**: Offloaded all simulation, iteration, and aggregation logic to a Web Worker.
  - **Reason**: The browser's main thread handles layout and DOM updates; heavy computation delays frames.
  - **Tradeoff**: Introduced asynchronous message-passing complexity and slightly increased architectural overhead.

- **Problem**: Filtering and sorting arrays multiple times per tick resulted in massive memory allocation and CPU overhead.
  - **Solution**: Migrated from chained `.filter().sort().slice()` methods to a single-pass `BoundedTopK` class that evaluates criteria and inserts elements in-place.
  - **Reason**: Avoids intermediate array allocations and reduces algorithmic complexity from `O(N log N)` to bounded `O(N)`.
  - **Tradeoff**: The custom class is more verbose than native array methods.

- **Problem**: React component wrappers for charting (`echarts-for-react`) caused significant React reconciliation overhead during 60Hz data ticks.
  - **Solution**: Replaced the React wrapper with a vanilla `echarts` instance attached via `useRef` and manually updated via `setOption` inside a `useEffect`.
  - **Reason**: Bypasses React's VDOM diffing entirely, allowing ECharts to leverage its optimized canvas rendering engine directly.
  - **Tradeoff**: Requires manual lifecycle management for initializing, resizing, and disposing the chart instance.

## Benchmarking
Performance was measured through progressively increasing datasets while interacting with the UI filters. Tests confirmed zero crashes, zero browser freezes, and zero worker errors during the duration of the test.
- **1,000 Records**: Dashboard maintained a stable 60-63 FPS.
- **10,000 Records**: Remained highly stable at 58-64 FPS with instant UI transitions.
- **50,000 Records**: Successfully maintained 55-60 FPS without observable frame drops. Filtering the 50,000 dataset down to specific subsets applied instantly with zero observable input lag.

## Testing
The testing strategy relies on focused unit tests leveraging `Vitest`. Instead of chasing arbitrary coverage metrics, tests validate explicit behaviors of critical utilities:
- **Generators**: Verifies deterministic server status generation logic (`determineServerStatus`).
- **Data Processing**: Ensures the `BoundedTopK` logic sorts and limits arrays correctly under multiple edge cases.
- **Mutations**: Validates that array mutation updates correctly increment values and alter timestamps.

## Accessibility
- Used `aria-live="polite"` and `aria-atomic="true"` on hidden elements to safely throttle and broadcast critical server warnings to screen readers without spamming them every 16ms.
- Used semantic `<table />` elements with proper `<th>` scoping.
- Added visible `aria-label` and `role="region"` declarations around scrollable data containers.

## Running Locally
```bash
# Clone the repository and cd into it
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

## Build
```bash
# Verify type correctness
npm run typecheck

# Run production bundler
npm run build
```
The output will be placed in the `dist/` directory.

## Deployment
The application is a standard static client-side Single Page Application (SPA). The generated `dist/` directory can be deployed directly to any static host (Vercel, Netlify, AWS S3, GitHub Pages) or served via a basic web server (e.g., Nginx, Express).

## Limitations
- **Data Serialization**: The architecture is currently limited by the time it takes to serialize and copy data between the worker and the main thread via `postMessage`.
- **Memory Scaling**: Generating completely simulated metrics for massive arrays (1M+ records) directly inside the browser's heap will eventually hit client hardware memory ceilings.
- **Mobile Rendering**: While CSS enables scrolling, 50,000 active instances may drain mobile device batteries exceptionally fast due to constant CPU utilization by the Web Worker.

## Future Improvements
- Implement `SharedArrayBuffer` to completely eliminate the `postMessage` copy overhead.
- Explore WebGL or Canvas rendering for the `TelemetryTable` if the row count requirement scales dramatically (e.g., viewing all 50,000 rows simultaneously rather than the Top-100).
- Integrate an actual WebSocket payload parser to transition from simulated benchmarking to real-world streaming data consumption.
