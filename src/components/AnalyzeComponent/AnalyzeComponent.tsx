import React, { FC, ReactElement, useEffect, useState } from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { Trades } from '../../@types/trades';
import axios from '../../api/axios';
import TradesAPI from '../../api/tradesApi';
import TradesListComponent from '../TradesListComponent/TradesListComponent';
import utils from '../utils/utils';
import styles from './AnalyzeComponent.module.scss';

type Stats = {
  totalTrades: number;
  win: StatsDetails;
  lose: StatsDetails;
  profit: number;
};

type StatsDetails = {
  count: number;
  percentage: number;
  profit: number;
};

type AnalyzeProps = unknown;

const AnalyzeComponent: FC<AnalyzeProps> = () => {
  const [tradesHistory, setTradesHistory] = useState<Trades[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trades[]>([]);
  const [pagesInfos, setPagesInfos] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [stats, setStats] = useState<Stats>();

  useEffect(() => {
    getTradesHistory();
    getMaxCandles();
  }, []);

  const getTradesHistory = async () => {
    const data = await TradesAPI.getTradesHistory();
    setTradesHistory(data);
  };

  const getMaxCandles = async () => {
    const { data } = await axios.get('pages/infos');
    setPagesInfos(data);
  };

  useEffect(() => {
    const winTrades = filteredTrades.filter((trade) => trade.profit > 0);
    const loseTrades = filteredTrades.filter((trade) => trade.profit <= 0);
    const winProfit = utils.formatNumber(winTrades.reduce((total, trade) => trade.profit + total, 0));
    const loseProfit = utils.formatNumber(loseTrades.reduce((total, trade) => trade.profit + total, 0));
    setStats({
      totalTrades: filteredTrades.length,
      win: {
        count: winTrades.length,
        percentage: utils.formatNumber((100 * winTrades.length) / filteredTrades.length),
        profit: winProfit,
      },
      lose: {
        count: loseTrades.length,
        percentage: utils.formatNumber((100 * loseTrades.length) / filteredTrades.length),
        profit: loseProfit,
      },
      profit: utils.formatNumber(winProfit + loseProfit),
    });
  }, [filteredTrades]);

  const applyDateFilter = () => {
    const filtered = tradesHistory.filter((trade) => {
      if (trade.inAt && trade.outAt) {
        const year = selectedYear === 'all' ? '' : selectedYear;
        const month = selectedMonth === 'all' ? '' : selectedMonth;
        const day = selectedDay === 'all' ? '' : selectedDay;
        const inSplitted = trade.inAt.split('-');
        const outSplitted = trade.outAt.split('-');
        return (
          (inSplitted[0].indexOf(year) !== -1 &&
            inSplitted[1].indexOf(month) !== -1 &&
            inSplitted[2].indexOf(day) !== -1) ||
          (outSplitted[0].indexOf(year) !== -1 &&
            outSplitted[1].indexOf(month) !== -1 &&
            outSplitted[2].indexOf(day) !== -1)
        );
      }
      return false;
    });
    setFilteredTrades(filtered);
  };

  const getDateFromPagesInfo = (pageInfos: string) =>
    pageInfos.substring(pageInfos.indexOf('BTCUSD') + 6, pageInfos.indexOf('BTCUSD') + 16);

  const getYearChoicesFromDate = (): ReactElement[] => {
    let yearChoices = pagesInfos.map((pageInfo: string) => getDateFromPagesInfo(pageInfo).split('-')[0]);
    yearChoices = [...new Set(yearChoices)];
    return yearChoices.map((year: string) => (
      <MenuItem key={year} value={year}>
        {year}
      </MenuItem>
    ));
  };

  const getMonthChoicesFromDateByYear = (): ReactElement[] => {
    let monthForYear = pagesInfos.filter((pageInfos) => getDateFromPagesInfo(pageInfos).split('-')[0] === selectedYear);
    monthForYear = [...new Set(monthForYear.map((pageInfos: string) => getDateFromPagesInfo(pageInfos).split('-')[1]))];
    if (selectedYear !== 'all') {
      return monthForYear.map((month: string) => (
        <MenuItem key={month} value={month}>
          {month}
        </MenuItem>
      ));
    }
    return [];
  };

  const getDayChoicesFromDateByMonth = (): ReactElement[] => {
    let dayForYear = pagesInfos.filter(
      (pageInfos) =>
        getDateFromPagesInfo(pageInfos).split('-')[0] === selectedYear &&
        getDateFromPagesInfo(pageInfos).split('-')[1] === selectedMonth,
    );
    dayForYear = [...new Set(dayForYear.map((pageInfos: string) => getDateFromPagesInfo(pageInfos).split('-')[2]))];
    if (selectedYear !== 'all' && selectedMonth !== 'all') {
      return dayForYear.map((day: string) => (
        <MenuItem key={day} value={day}>
          {day}
        </MenuItem>
      ));
    }
    return [];
  };

  const renderChoices = (
    type: 'Year' | 'Month' | 'Day',
    value: string,
    selectChoices: () => ReactElement[],
    selectCallback: (v: string) => void,
  ): ReactElement => (
    <div>
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id={type}>{type}</InputLabel>
        <Select
          labelId={type}
          id={type}
          value={value}
          label={type}
          onChange={(event: SelectChangeEvent) => selectCallback(event.target.value)}
        >
          <MenuItem key="all" value="all">
            Tous
          </MenuItem>
          {selectChoices()}
        </Select>
      </FormControl>
    </div>
  );

  return (
    <div className={styles.analyzeContainer}>
      <div className={styles.analyzeDateContainer}>
        <h2>Analyze</h2>
        <div className={styles.analyzeDateSelection}>
          {renderChoices('Year', selectedYear, getYearChoicesFromDate, setSelectedYear)}
          {renderChoices('Month', selectedMonth, getMonthChoicesFromDateByYear, setSelectedMonth)}
          {renderChoices('Day', selectedDay, getDayChoicesFromDateByMonth, setSelectedDay)}
          <Button variant="outlined" onClick={applyDateFilter}>
            Confirmer
          </Button>
        </div>
      </div>
      {stats?.totalTrades ? (
        <div className={styles.statisticsContainer}>
          <div className={styles.statistics}>
            <div className={styles.statisticsLeft}>
              <p>Trade(s) gagnant(s): {stats.win.count}</p>
              <p>Percentage: {stats.win.percentage}</p>
              <p>Profit: {stats.win.profit}</p>
            </div>
            <div className={styles.statisticsMiddle}>
              <p>Trades: {stats.totalTrades}</p>
              <p>Profit: {stats.profit}</p>
            </div>
            <div className={styles.statisticsRight}>
              <p>Trade(s) perdant(s): {stats.lose.count}</p>
              <p>Percentage: {stats.lose.percentage}</p>
              <p>Perte: {stats.lose.profit}</p>
            </div>
          </div>
        </div>
      ) : null}
      <div className={styles.tradesContainer}>
        <TradesListComponent tradesHistory={filteredTrades} />
      </div>
    </div>
  );
};

export default AnalyzeComponent;
