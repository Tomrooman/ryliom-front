import React, { FC, useEffect, useRef } from 'react';

import { CrosshairMode, ISeriesApi, PriceLineOptions, SeriesMarker, Time, createChart } from 'lightweight-charts';

import { PivotPoint } from 'types/pivotPoint';

type ChartsProps = {
  data: any[][];
  height: number;
  chartsOptions: any;
  seriesOptions: any[];
  markers?: SeriesMarker<Time>[];
  pivotPoint?: PivotPoint;
};

const ChartComponent: FC<ChartsProps> = (props) => {
  const { data, height, chartsOptions, seriesOptions, markers, pivotPoint } = props;
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
      if (serieOptions.type === 'candle') {
        series = chart.addCandlestickSeries(serieOptions);
      } else if (serieOptions.type === 'line') {
        series = chart.addAreaSeries(serieOptions);
      } else if (serieOptions.type === 'histogram') {
        series = chart.addHistogramSeries(serieOptions);
      }
      series?.setData(data[index]);
      if (markers && series && index === 0) {
        series.setMarkers(markers);
      }
      if (pivotPoint && series && index === seriesOptions.length - 1) {
        createPivotPoint(series, pivotPoint);
      }
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      chart.remove();
    };
  }, [data, height, seriesOptions, chartsOptions]);

  const createPivotPoint = (
    series: ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | ISeriesApi<'Histogram'>,
    pivotPointData: PivotPoint,
  ) => {
    const lineWidth = 2;
    Object.keys(pivotPointData).forEach((key: string) => {
      const minPriceLine: PriceLineOptions = {
        price: pivotPointData[key],
        color: '#ef5350',
        lineWidth,
        lineStyle: 2, // LineStyle.Dashed
        axisLabelVisible: true,
        lineVisible: true,
        title: key,
      };
      series.createPriceLine(minPriceLine);
    });
  };

  return <div ref={chartContainerRef} />;
};

export default ChartComponent;
