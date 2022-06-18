import React, { FC, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { ColorType, createChart } from 'lightweight-charts';

import { Candle } from '../../@types/candle';
import style from './TradesComponent.module.css';

type ChartsProps = {
  data: any;
  colors: {
    backgroundColor: string;
    lineColor: string;
    textColor: string;
    areaTopColor: string;
    areaBottomColor: string;
  };
};

export const ChartComponent: FC<ChartsProps> = (props) => {
  const {
    data,
    colors: { backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor },
  } = props;
  const chartContainerRef: any = useRef();

  useEffect(() => {
    // const handleResize = () => {
    //   chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    // };

    const chart = createChart(chartContainerRef.current, {
      // layout: {
      //   background: { type: ColorType.Solid, color: backgroundColor },
      //   textColor,
      // },
      timeScale: {
        timeVisible: true,
        minBarSpacing: 0.2,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });
    chart.timeScale().fitContent();

    // const newSeries = chart.addAreaSeries({ lineColor, topColor: areaTopColor, bottomColor: areaBottomColor });
    const newSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    newSeries.setData(data);

    // window.addEventListener('resize', handleResize);

    return () => {
      // window.removeEventListener('resize', handleResize);

      chart.remove();
    };
  }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  return <div ref={chartContainerRef} />;
};

export const TradesComponent: FC = () => {
  const [chartsData, setChartsData] = useState<
    { time: number; open: number; high: number; low: number; close: number }[]
  >([]);

  useEffect(() => {
    getCandles();
  }, []);

  const getCandles = async () => {
    const { data }: { data: Candle[] } = await axios.get('/candles');
    const formattedData = data.map((d) => {
      return {
        time: Number(d.start_at),
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
      };
    });
    setChartsData(formattedData);
  };

  if (chartsData.length) {
    return (
      <ChartComponent
        colors={{
          backgroundColor: 'white',
          lineColor: '#2962FF',
          textColor: 'black',
          areaTopColor: '#2962FF',
          areaBottomColor: 'rgba(41, 98, 255, 0.28)',
        }}
        data={chartsData}
      />
    );
  }
  return <></>;
};
