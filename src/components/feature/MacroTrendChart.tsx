import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ChartDataset } from '../../types';
import { Card } from '../ui/Card';

interface Props {
  dataset: ChartDataset;
}

export const MacroTrendChart: React.FC<Props> = ({ dataset }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
      
      const handleResize = () => chartInstance.current?.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
        chartInstance.current = null;
      };
    }
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !dataset || dataset.series.length === 0 || dataset.series[0].data.length === 0) return;

    chartInstance.current.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(25, 25, 25, 0.9)',
        borderColor: '#333',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: dataset.series.map(s => s.name),
        textStyle: { color: '#a0a0a0' },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLabel: { color: '#a0a0a0' },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: '#a0a0a0', formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#333' } }
      },
      series: dataset.series.map(s => ({
        name: s.name,
        type: 'line',
        showSymbol: false,
        lineStyle: { width: 2, color: s.color },
        itemStyle: { color: s.color },
        data: s.data.map(p => [p.timestamp, p.value])
      })),
      animation: false
    });
  }, [dataset]);

  const isEmpty = !dataset || dataset.series.length === 0 || dataset.series[0].data.length === 0;

  return (
    <Card title="Global CPU & Memory Trend" className="chart-card">
      <div role="img" aria-label="Line chart showing global CPU and Memory trends over the last 60 seconds." style={{ height: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isEmpty && <div style={{ color: '#888' }}>No Data Available</div>}
        <div ref={chartRef} style={{ width: '100%', height: '100%', display: isEmpty ? 'none' : 'block' }} />
      </div>
    </Card>
  );
};
