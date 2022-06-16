import { ColorType, createChart } from 'lightweight-charts';
import moment from 'moment';

import React, { FC, useEffect, useRef, useState } from 'react';

import axios from 'axios';

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
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });
    chart.timeScale().fitContent();

    const newSeries = chart.addAreaSeries({ lineColor, topColor: areaTopColor, bottomColor: areaBottomColor });
    newSeries.setData(data);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      chart.remove();
    };
  }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  return <div ref={chartContainerRef} />;
};

const initialData = [
  { time: '2018-12-22', value: 32.51 },
  { time: '2018-12-23', value: 31.11 },
  { time: '2018-12-24', value: 27.02 },
  { time: '2018-12-25', value: 27.32 },
  { time: '2018-12-26', value: 25.17 },
  { time: '2018-12-27', value: 28.89 },
  { time: '2018-12-28', value: 25.46 },
  { time: '2018-12-29', value: 23.92 },
  { time: '2018-12-30', value: 22.68 },
  { time: '2018-12-31', value: 22.67 },
];

type AppProps = {};
export const TradesComponent: FC<AppProps> = () => {
  const [chartsData, setChartsData] = useState<
    [string, string | number, string | number, string | number, string | number][]
  >([]);

  useEffect(() => {
    // getCandles();
  }, []);

  const getCandles = async () => {
    const { data }: { data: Candle[] } = await axios.get('/candles');
    console.log('candle data : ', data);
    setChartsData(
      data.map((d) => [
        moment(Number(d.start_at) * 1000).format('DD/MM/YYYY HH:mm:ss'),
        Number(d.low),
        Number(d.open),
        Number(d.close),
        Number(d.high),
      ]),
    );
  };

  return (
    <ChartComponent
      colors={{
        backgroundColor: 'white',
        lineColor: '#2962FF',
        textColor: 'black',
        areaTopColor: '#2962FF',
        areaBottomColor: 'rgba(41, 98, 255, 0.28)',
      }}
      data={initialData}
    ></ChartComponent>
  );
};
