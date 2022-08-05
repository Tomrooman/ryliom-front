import React, { FC, useEffect, useState } from 'react';

import axios from 'axios';
import { ColorType } from 'lightweight-charts';

import { Candle } from '../../@types/candle';
import { MacdData } from '../../@types/macd';
import ChartComponent from '../ChartComponent/ChartComponent';

// import style from './TradesComponent.module.css';

const AnalyzeComponent: FC = () => {
  const [chartsData, setChartsData] = useState<
    { time: number; open: number; high: number; low: number; close: number }[]
  >([]);
  const [macdData, setMacdData] = useState<{ macdBlue: number[]; macdSignalRed: number[] }>();
  const [rsiData, setRsiData] = useState<number[]>();

  useEffect(() => {
    getCandles();
  }, []);

  useEffect(() => {
    if (chartsData.length) {
      getMACD();
      getRSI();
    }
  }, [chartsData]);

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

  const getMACD = async () => {
    const { data }: { data: MacdData } = await axios.get('/macd');
    setMacdData({ macdBlue: data.macdBlue, macdSignalRed: data.macdSignalRed });
  };

  const getRSI = async () => {
    const { data }: { data: number[] } = await axios.get('/rsi');
    setRsiData(data);
  };

  if (chartsData.length && macdData?.macdBlue.length && macdData.macdSignalRed.length && rsiData?.length) {
    return (
      <>
        <ChartComponent
          type="candle"
          height={400}
          chartsOptions={{
            timeScale: {
              timeVisible: true,
              minBarSpacing: 0.2,
            },
          }}
          seriesOptions={[
            {
              upColor: '#26a69a',
              downColor: '#ef5350',
              borderVisible: false,
              wickUpColor: '#26a69a',
              wickDownColor: '#ef5350',
            },
          ]}
          data={[chartsData]}
        />
        <ChartComponent
          type="line"
          height={150}
          chartsOptions={{
            timeScale: {
              timeVisible: true,
              minBarSpacing: 0.2,
            },
            layout: {
              background: { type: ColorType.Solid, color: 'white' },
              textColor: 'black',
            },
          }}
          seriesOptions={[
            {
              backgroundColor: 'white',
              lineColor: '#3B55FE',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
            {
              backgroundColor: 'white',
              lineColor: '#D63413',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
          ]}
          data={[
            macdData.macdBlue.map((d, i) => ({
              time: chartsData[i + 19].time,
              value: d,
            })),
            macdData.macdSignalRed.map((d, i) => ({
              time: chartsData[i + 19].time,
              value: d,
            })),
          ]}
        />
        <ChartComponent
          type="line"
          height={150}
          chartsOptions={{
            timeScale: {
              timeVisible: true,
              minBarSpacing: 0.2,
            },
            layout: {
              background: { type: ColorType.Solid, color: 'white' },
              textColor: 'black',
            },
          }}
          seriesOptions={[
            {
              backgroundColor: 'white',
              lineColor: '#3B55FE',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
          ]}
          data={[
            rsiData.map((d, i) => ({
              time: chartsData[i + 12].time,
              value: d,
            })),
          ]}
        />
      </>
    );
  }
  return <></>;
};

export default AnalyzeComponent;
