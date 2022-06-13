import React, { FC } from 'react';

import { Chart } from 'react-google-charts';

const data = [
  ['day', 'a', 'b', 'c', 'd'],
  ['Mon', 20, 28, 38, 45],
  ['Tue', 31, 38, 55, 66],
  ['Wed', 50, 55, 77, 80],
  ['Thu', 50, 77, 66, 77],
  ['Fri', 15, 66, 22, 68],
];

const options = {
  legend: 'none',
};

// eslint-disable-next-line @typescript-eslint/ban-types
type AppProps = {};

const TradesComponent: FC<AppProps> = () => {
  return <Chart chartType="CandlestickChart" width="100%" height="400px" data={data} options={options} />;
};

export default TradesComponent;
