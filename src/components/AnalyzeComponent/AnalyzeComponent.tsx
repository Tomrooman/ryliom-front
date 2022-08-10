import React, { FC, useEffect, useState } from 'react';

import axios from 'axios';
import { ColorType } from 'lightweight-charts';

import { Candle } from '../../@types/candle';
import { MacdData } from '../../@types/macd';
import ChartComponent from '../ChartComponent/ChartComponent';
import style from './AnalyzeComponent.module.css';

const AnalyzeComponent: FC = () => {
  const [chartsData, setChartsData] = useState<
    { time: number; open: number; high: number; low: number; close: number }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagesInfos, setPagesInfos] = useState<string[]>([]);
  const [macdData, setMacdData] = useState<{ macdBlue: number[]; macdSignalRed: number[] }>();
  const [rsiData, setRsiData] = useState<number[]>();

  useEffect(() => {
    getMaxCandles();
  }, []);

  useEffect(() => {
    getCandles();
  }, [currentPage]);

  useEffect(() => {
    if (chartsData.length) {
      getMACD();
      getRSI();
    }
  }, [chartsData]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagesInfos[currentPage]) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getMaxCandles = async () => {
    const { data } = await axios.get('pages/infos');
    setPagesInfos(data);
  };

  const getCandles = async () => {
    const { data }: { data: Candle[] } = await axios.get(`/candles/${currentPage}`);
    const formattedData = data.map((d) => ({
      time: Number(d.start_at),
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),
    }));
    setChartsData(formattedData);
  };

  const getMACD = async () => {
    const { data }: { data: MacdData } = await axios.get(`/macd/${currentPage}`);
    setMacdData({ macdBlue: data.macdBlue, macdSignalRed: data.macdSignalRed });
  };

  const getRSI = async () => {
    const { data }: { data: number[] } = await axios.get(`/rsi/${currentPage}`);
    setRsiData(data);
  };

  if (chartsData.length && macdData?.macdBlue.length && macdData.macdSignalRed.length && rsiData?.length) {
    return (
      <>
        <div className={style.pageInfos}>
          <button type="button" onClick={handlePrevPage}>
            Prev
          </button>
          {currentPage} / {pagesInfos.length}
          <button type="button" onClick={handleNextPage}>
            Next
          </button>
          <p>{pagesInfos[currentPage - 1]}</p>
        </div>
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
