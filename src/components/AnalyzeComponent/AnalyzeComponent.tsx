import React, { FC, useEffect, useState } from 'react';

import axios from 'axios';
import { ColorType, SeriesMarker, Time } from 'lightweight-charts';

import { Candle } from '../../@types/candle';
import { MacdData } from '../../@types/macd';
import { Trades } from '../../@types/trades';
import ChartComponent from '../ChartComponent/ChartComponent';
import style from './AnalyzeComponent.module.css';

const sellProfit = '#e91e63';
const sellLoss = 'black';
const buyProfit = '#2AB849';
const buyLoss = 'black';

const AnalyzeComponent: FC = () => {
  const [chartsData, setChartsData] = useState<
    { time: number; open: number; high: number; low: number; close: number }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [pagesInfos, setPagesInfos] = useState<string[]>([]);
  const [markers, setMarkers] = useState<SeriesMarker<Time>[]>();
  const [macdData, setMacdData] = useState<{ macdBlue: number[]; macdSignalRed: number[] }>();
  const [rsiData, setRsiData] = useState<number[]>();

  useEffect(() => {
    getMaxCandles();
  }, []);

  useEffect(() => {
    if (currentPage) {
      getCandles();
      setCurrentDate(
        pagesInfos[currentPage - 1].substring(
          pagesInfos[currentPage - 1].indexOf('BTCUSD') + 6,
          pagesInfos[currentPage - 1].indexOf('BTCUSD') + 16,
        ),
      );
    }
  }, [currentPage]);

  useEffect(() => {
    if (chartsData.length) {
      getMACD();
      getRSI();
      getTradesForCurrentDate();
    }
  }, [chartsData]);

  const getTradeMarkerColor = (trade: Trades) => {
    if (trade.type === 'sell') {
      return trade.profit > 0 ? sellProfit : sellLoss;
    }
    return trade.profit > 0 ? buyProfit : buyLoss;
  };

  const getTradeMarkerPosition = (trade: Trades) => {
    if (trade.type === 'sell') {
      return trade.profit > 0 ? 'belowBar' : 'aboveBar';
    }
    return trade.profit > 0 ? 'aboveBar' : 'belowBar';
  };

  const getTradesForCurrentDate = async () => {
    const { data } = await axios.get(`trades/date/${currentDate}`);
    // console.log('data : ', data);
    const formattedMarkers: SeriesMarker<Time>[] = [];
    data.forEach((trade: Trades, index: number) => {
      formattedMarkers.push({
        time: trade.inAt,
        position: trade.type === 'sell' ? 'aboveBar' : 'belowBar',
        color: getTradeMarkerColor(trade),
        shape: trade.type === 'sell' ? 'arrowDown' : 'arrowUp',
        text: `${trade.type === 'sell' ? 'Sell' : 'Buy'} @ ${index}`,
      });
      if (trade.outAt) {
        formattedMarkers.push({
          time: trade.outAt,
          position: getTradeMarkerPosition(trade),
          color: getTradeMarkerColor(trade),
          shape: 'circle',
          text: `Close trade @ ${index}`,
        });
      }
    });
    setMarkers(formattedMarkers);
  };

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
    setCurrentPage(1);
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
          <p>{currentDate}</p>
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
          markers={markers}
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
          markers={markers}
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
          markers={markers}
        />
      </>
    );
  }
  return <></>;
};

export default AnalyzeComponent;
