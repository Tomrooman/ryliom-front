import React, { FC, ReactElement, useEffect, useState } from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { ColorType, SeriesMarker, Time } from 'lightweight-charts';

import axios from '../../api/axios';
import TradesAPI from '../../api/tradesApi';
import ChartComponent from '../ChartComponent/ChartComponent';
import styles from './TradesChartsComponent.module.scss';

import { BollingerBands } from 'types/bollinger';
import { Candle } from 'types/candle';
import { MacdData } from 'types/macd';
import { PivotPoint } from 'types/pivotPoint';
// import { StochasticData } from 'types/stochastic';
import { Trades } from 'types/trades';

const SYMBOL = 'BTCUSDT';
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
  const [rsiData, setRsiData] = useState<{ time: number; value: number }[]>([]);
  // const [stoch, setStochData] = useState<StochasticData[]>([]);
  const [pivotPointData, setPivotPointData] = useState<PivotPoint>();
  const [vwma, setVwmaData] = useState<{ time: number; value: number }[]>([]);
  const [bollinger, setBollinger] = useState<BollingerBands[]>([]);
  // const [vwma100, setVwmaData100] = useState<{ time: number; value: number }[]>([]);
  // const [emaData, setEmaData] = useState<{ time: number; value: number }[]>([]);
  const [emaSignalData, setEmaSignalData] = useState<{ time: number; value: number }[]>([]);

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
      // getMACD();
      getRSI();
      // getStochData();
      // getPivotPoint();
      // getEMA();
      getEMA50();
      // getVwma();
      // getVwma100();
      getBollingerBands();
      getTradesForCurrentDate();
    }
  }, [chartsData]);

  const getDateFromPagesInfo = (pageInfos: string) =>
    pageInfos.substring(pageInfos.indexOf('BTCUSDT-1m-') + 11, pageInfos.indexOf('.json'));

  const getTradeMarkerColor = (trade: Trades) => {
    if (trade.type === 'Sell') {
      return trade.profit > 0 ? sellProfit : sellLoss;
    }
    return trade.profit > 0 ? buyProfit : buyLoss;
  };

  const getTradeMarkerPosition = (trade: Trades) => (trade.type === 'Sell' ? 'belowBar' : 'aboveBar');

  const getTradesForCurrentDate = async () => {
    const trades = await TradesAPI.getTradesByDate(currentDate);
    const formattedMarkers: SeriesMarker<Time>[] = [];
    trades.forEach((trade: Trades, index: number) => {
      formattedMarkers.push({
        time: trade.inAt,
        position: trade.type === 'Sell' ? 'aboveBar' : 'belowBar',
        color: getTradeMarkerColor(trade),
        shape: trade.type === 'Sell' ? 'arrowDown' : 'arrowUp',
        text: `${trade.type === 'Sell' ? 'Sell' : 'Buy'} @ ${index}`,
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

  // const getMACD = async () => {
  //   const { data }: { data: MacdData } = await axios.get(`/macd/${currentPage}`);
  //   setMacdData({ macdBlue: data.macdBlue, macdSignalRed: data.macdSignalRed, macdHistogram: data.macdHistogram });
  // };

  // const getVwma = async () => {
  //   const { data }: { data: { time: number; value: number }[] } = await axios.get(`/vwma/${currentPage}/50`);
  //   setVwmaData(data);
  // };

  const getBollingerBands = async () => {
    const { data }: { data: BollingerBands[] } = await axios.get(`/bollinger/${currentPage}`);
    setBollinger(data);
  };

  // const getVwma100 = async () => {
  //   const { data }: { data: { time: number; value: number }[] } = await axios.get(`/vwma/${currentPage}/100`);
  //   setVwmaData100(data);
  // };

  // const getStochData = async () => {
  //   const { data }: { data: StochasticData[] } = await axios.get(`/stochastic/${currentPage}`);
  //   setStochData(data);
  // };

  const getRSI = async () => {
    console.log('call rsi');
    const { data }: { data: { time: number; value: number }[] } = await axios.get(`/rsi/${currentPage}`);
    console.log('get rsi : ', data.length, chartsData.length);
    setRsiData(data);
  };

  // const getPivotPoint = async () => {
  //   const { data } = await axios.get(`/pivotPoint/${currentDate}/${SYMBOL}`);
  //   if (data) {
  //     setPivotPointData(data);
  //   }
  // };

  // const getEMA = async () => {
  //   const { data } = await axios.get(`/ema/${currentDate}`);
  //   if (data) {
  //     setEmaData(data);
  //   }
  // };

  const getEMA50 = async () => {
    const { data } = await axios.get(`/ema/${currentDate}/50`);
    if (data) {
      setEmaSignalData(data);
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

  if (chartsData.length) {
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
              lineColor: 'blue',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
            {
              type: 'line',
              backgroundColor: 'white',
              lineColor: 'blue',
              textColor: 'gray',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
            {
              type: 'line',
              backgroundColor: 'white',
              lineColor: 'blue',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
            {
              type: 'line',
              backgroundColor: 'white',
              lineColor: 'black',
              textColor: 'black',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
          ]}
          data={[
            chartsData,
            // vwma.map((d) => ({
            //   time: d.time,
            //   value: d.value,
            // })),
            bollinger.map((d) => ({
              time: d.time,
              value: d.upper,
            })),
            bollinger.map((d) => ({
              time: d.time,
              value: d.middle,
            })),
            bollinger.map((d) => ({
              time: d.time,
              value: d.lower,
            })),
            // vwma100.map((d) => ({
            //   time: d.time,
            //   value: d.value,
            // })),
            // emaData.map((d) => ({
            //   time: d.time,
            //   value: d.value,
            // })),
            emaSignalData.map((d) => ({
              time: d.time,
              value: d.value,
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
            // {
            //   type: 'histogram',
            // },
          ]}
          data={[
            rsiData.map((d, i) => ({
              time: chartsData[i + 11].time,
              value: d.value,
            })),
            // macdData.macdHistogram.map((d, i) => ({
            //   time: chartsData[i + 19].time,
            //   value: d,
            // })),
            // rsiData.map((d) => ({
            //   time: d.time,
            //   value: d.value,
            // })),
          ]}
          markers={markers}
        />
        {/* <ChartComponent
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
              lineColor: 'blue',
              textColor: 'yellow',
              topColor: 'rgba(0, 0, 0, 0)',
              bottomColor: 'rgba(0, 0, 0, 0)',
            },
            // {
            //   type: 'line',
            //   backgroundColor: 'white',
            //   lineColor: 'red',
            //   textColor: 'red',
            //   topColor: 'rgba(0, 0, 0, 0)',
            //   bottomColor: 'rgba(0, 0, 0, 0)',
            // },
          ]}
          data={[
            vwma.map((s) => ({
              time: s.time,
              value: s.value,
            })),
            // stoch.map((s) => ({
            //   time: s.time,
            //   value: s.k,
            // })),
            // stoch.map((s) => ({
            //   time: s.time,
            //   value: s.d,
            // })),
          ]}
          markers={markers}
        /> */}
      </>
    );
  }
  return <></>;
};

export default TradesChartsComponent;
