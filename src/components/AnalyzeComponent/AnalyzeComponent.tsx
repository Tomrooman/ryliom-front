import React, { FC, ReactElement, useEffect, useState } from 'react';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import axios from 'axios';
import clsx from 'clsx';

import { Trades } from '../../@types/trades';
import TradesListComponent from '../TradesListComponent/TradesListComponent';
import styles from './AnalyzeComponent.module.scss';

type AnalyzeProps = unknown;

const AnalyzeComponent: FC<AnalyzeProps> = () => {
  const [tradesHistory, setTradesHistory] = useState<Trades[]>([]);
  const [pagesInfos, setPagesInfos] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  useEffect(() => {
    getTradesHistory();
    getMaxCandles();
  }, []);

  const getTradesHistory = async () => {
    const { data } = await axios.get('trades/history');
    setTradesHistory(data);
  };

  const getMaxCandles = async () => {
    const { data } = await axios.get('pages/infos');
    setPagesInfos(data);
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
      <div className={styles.analyzeDateSelection}>
        {renderChoices('Year', selectedYear, getYearChoicesFromDate, setSelectedYear)}
        {renderChoices('Month', selectedMonth, getMonthChoicesFromDateByYear, setSelectedMonth)}
        {renderChoices('Day', selectedDay, getDayChoicesFromDateByMonth, setSelectedDay)}
      </div>
      <div className={styles.tradesContainer}>
        <TradesListComponent tradesHistory={tradesHistory} />
      </div>
    </div>
  );
};

export default AnalyzeComponent;
