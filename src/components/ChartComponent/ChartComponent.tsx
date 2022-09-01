import React, { FC, useEffect, useRef } from 'react';

import { CrosshairMode, SeriesMarker, Time, createChart } from 'lightweight-charts';

type ChartsProps = {
  data: any[][];
  type: string;
  height: number;
  chartsOptions: any;
  seriesOptions: any[];
};

const ChartComponent: FC<ChartsProps> = (props) => {
  const { data, type, height, chartsOptions, seriesOptions } = props;
  const chartContainerRef: any = useRef();
  useEffect(() => {
    const handleResize = (): void => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    const chart = createChart(chartContainerRef.current, {
      ...chartsOptions,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      width: chartContainerRef.current.clientWidth,
      height,
    });
    chart.timeScale().fitContent();
    seriesOptions.forEach((serieOptions, index) => {
      let series;
      if (type === 'candle') {
        series = chart.addCandlestickSeries(serieOptions);
        const markers: SeriesMarker<Time>[] = [];
        markers.push({
          time: data[0][3].time,
          position: 'aboveBar',
          color: '#e91e63',
          shape: 'arrowDown',
          text: 'Sell @ 12',
        });
        markers.push({
          time: data[0][8].time,
          position: 'belowBar',
          color: 'green',
          shape: 'arrowUp',
          text: 'Buy @ 14',
        });
        series.setMarkers(markers);
      } else if (type === 'line') {
        series = chart.addAreaSeries(serieOptions);
      }
      series?.setData(data[index]);
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      chart.remove();
    };
  }, [data, type, height, seriesOptions, chartsOptions]);

  return <div ref={chartContainerRef} />;
};

export default ChartComponent;
