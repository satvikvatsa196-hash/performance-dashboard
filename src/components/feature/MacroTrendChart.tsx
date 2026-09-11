import React from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartDataset } from '../../types';
import { Card } from '../ui/Card';

interface Props {
  dataset: ChartDataset;
}

export const MacroTrendChart: React.FC<Props> = ({ dataset }) => {
  const options = (!dataset || dataset.series.length === 0 || dataset.series[0].data.length === 0) 
    ? {
        title: { text: 'No Data Available', left: 'center', top: 'center', textStyle: { color: '#888' } }
      }
    : {
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
      animation: false // Disabled to support high-frequency updates later
    };

  return (
    <Card title="Global CPU & Memory Trend" className="chart-card">
      <div role="img" aria-label="Line chart showing global CPU and Memory trends over the last 60 seconds.">
        <ReactECharts
          option={options}
          style={{ height: '100%', minHeight: '300px' }}
          opts={{ renderer: 'canvas' }}
          notMerge={false} // Allow ECharts internal diffing engine to reconcile updates
        />
      </div>
    </Card>
  );
};
