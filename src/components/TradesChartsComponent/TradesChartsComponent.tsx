import React, { FC, ReactElement, useEffect, useState } from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import axios from 'axios';
import { ColorType, SeriesMarker, Time } from 'lightweight-charts';

import ChartComponent from '../ChartComponent/ChartComponent';
import styles from './TradesChartsComponent.module.scss';

import { Candle } from 'types/candle';
import { MacdData } from 'types/macd';
import { PivotPoint } from 'types/pivotPoint';
import { Trades } from 'types/trades';

const sellProfit = '#e91e63';
const sellLoss = 'black';
const buyProfit = '#2AB849';
const buyLoss = 'black';

const TradesChartsComponent: FC = () => {
  const [chartsData, setChartsData] = useState<
    { time: number; open: number; high: number; low: number; close: number }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const [pagesInfos, setPagesInfos] = useState<string[]>([]);
  const [markers, setMarkers] = useState<SeriesMarker<Time>[]>();
  const [macdData, setMacdData] = useState<{ macdBlue: number[]; macdSignalRed: number[]; macdHistogram: number[] }>();
  const [rsiData, setRsiData] = useState<number[]>();
  const [pivotPointData, setPivotPointData] = useState<PivotPoint>();
  const [emaData, setEmaData] = useState<number[]>([]);

  useEffect(() => {
    getMaxCandles();
  }, []);

  useEffect(() => {
    if (currentPage) {
      getCandles();
      setCurrentDate(getDateFromPagesInfo(pagesInfos[currentPage - 1]));
    }
  }, [currentPage]);

  useEffect(() => {
    if (chartsData.length) {
      getMACD();
      getRSI();
      getPivotPoint();
      getEMA();
      getTradesForCurrentDate();
    }
  }, [chartsData]);

  const getDateFromPagesInfo = (pageInfos: string) =>
    pageInfos.substring(pageInfos.indexOf('BTCUSD') + 6, pageInfos.indexOf('BTCUSD') + 16);

  const getTradeMarkerColor = (trade: Trades) => {
    if (trade.type === 'sell') {
      return trade.profit > 0 ? sellProfit : sellLoss;
    }
    return trade.profit > 0 ? buyProfit : buyLoss;
  };

  const getTradeMarkerPosition = (trade: Trades) => (trade.type === 'sell' ? 'belowBar' : 'aboveBar');

  const getTradesForCurrentDate = async () => {
    const { data } = await axios.get(`trades/date/${currentDate}`);
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
    setMacdData({ macdBlue: data.macdBlue, macdSignalRed: data.macdSignalRed, macdHistogram: data.macdHistogram });
  };

  const getRSI = async () => {
    const { data }: { data: number[] } = await axios.get(`/rsi/${currentPage}`);
    setRsiData(data);
  };

  const getPivotPoint = async () => {
    const { data } = await axios.get(`/pivotPoint/${currentDate}`);
    if (data) {
      setPivotPointData(data);
    }
  };

  const getEMA = async () => {
    const { data } = await axios.get(`/ema/${currentDate}`);
    if (data) {
      setEmaData(data);
    }
  };

  const renderAllDatesList = (): ReactElement => (
    <div>
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id="date">Date</InputLabel>
        <Select
          labelId="date"
          id="date"
          value={String(currentPage)}
          label="Date"
          onChange={(event: SelectChangeEvent) => setCurrentPage(Number(event.target.value))}
        >
          {pagesInfos.map((pageInfos: string, index: number) => (
            <MenuItem key={pageInfos} value={index + 1}>
              {getDateFromPagesInfo(pageInfos)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );

  if (chartsData.length && macdData?.macdBlue.length && macdData.macdSignalRed.length && rsiData?.length) {
    return (
      <>
        <div className={styles.pageInfos}>
          <Button size="small" variant="contained" onClick={handlePrevPage}>
            Prev
          </Button>
          <span className={styles.pagePosition}>
            {currentPage} / {pagesInfos.length}
          </span>
          <Button size="small" variant="contained" onClick={handleNextPage}>
            Next
          </Button>
          {/* <p>{currentDate}</p> */}
          {renderAllDatesList()}
        </div>
        <ChartComponent
          height={400}
          chartsOptions={{
            timeScale: {
              timeVisible: true,
              minBarSpacing: 0.2,
            },
          }}
          seriesOptions={[
            {
              type: 'candle',
              upColor: '#26a69a',
              downColor: '#ef5350',
              borderVisible: false,
              wickUpColor: '#26a69a',
              wickDownColor: '#ef5350',
            },
            {
              type: 'line',
              backgroundColor: 'white',
              lineColor: 'purple',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
          ]}
          data={[
            chartsData,
            emaData.map((d, i) => ({
              time: chartsData[i].time,
              value: d,
            })),
          ]}
          markers={markers}
          pivotPoint={pivotPointData}
        />
        <ChartComponent
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
              type: 'line',
              backgroundColor: 'white',
              lineColor: '#3B55FE',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
            {
              type: 'line',
              backgroundColor: 'white',
              lineColor: '#D63413',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
            {
              type: 'histogram',
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
            macdData.macdHistogram.map((d, i) => ({
              time: chartsData[i + 19].time,
              value: d,
            })),
          ]}
          markers={markers}
        />
        <ChartComponent
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
              type: 'line',
              backgroundColor: 'white',
              lineColor: '#3B55FE',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
          ]}
          data={[
            rsiData.map((d, i) => ({
              time: chartsData[i + 13].time,
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

export default TradesChartsComponent;
