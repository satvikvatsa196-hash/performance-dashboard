export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color: string;
}

export interface ChartDataset {
  series: ChartSeries[];
}
