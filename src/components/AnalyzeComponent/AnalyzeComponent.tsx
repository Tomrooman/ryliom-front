import React, { FC, useEffect, useState } from 'react';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import axios from 'axios';

import { Trades } from '../../@types/trades';
import TradesListComponent from '../TradesListComponent/TradesListComponent';
import styles from './AnalyzeComponent.module.scss';

type AnalyzeProps = unknown;

const AnalyzeComponent: FC<AnalyzeProps> = () => {
  const [tradesHistory, setTradesHistory] = useState<Trades[]>([]);

  useEffect(() => {
    getTradesHistory();
  }, []);

  const getTradesHistory = async () => {
    const { data } = await axios.get('trades/history');
    setTradesHistory(data);
  };

  const handleSelectYear = (year: number) => {
    console.log('select year : ', year);
  };

  return (
    <div className={styles.analyzeContainer}>
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id="date">Year</InputLabel>
        <Select
          labelId="date"
          id="date"
          value=""
          label="Date"
          onChange={(event: SelectChangeEvent) => handleSelectYear(Number(event.target.value))}
        >
          <MenuItem key="test" value="test">
            tom
          </MenuItem>
        </Select>
      </FormControl>
      <div className={styles.tradesContainer}>
        <TradesListComponent tradesHistory={tradesHistory} />
      </div>
    </div>
  );
};

export default AnalyzeComponent;
