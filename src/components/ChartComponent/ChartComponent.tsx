import React, { FC, useEffect, useRef } from 'react';

import { CrosshairMode, createChart } from 'lightweight-charts';

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
  }, [data, type, seriesOptions, chartsOptions]);

  return <div ref={chartContainerRef} />;
};

export default ChartComponent;
