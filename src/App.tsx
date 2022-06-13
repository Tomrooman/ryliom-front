import React, { FC, ReactElement } from 'react';

import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';

import TradesComponents from './components/TradesComponent/TradesComponent';
import './App.css';

// eslint-disable-next-line @typescript-eslint/ban-types
type AppProps = {};

const App: FC<AppProps> = () => {
  const Home = (): ReactElement => {
    return (
      <div>
        <h1>Test home</h1>
        <Link to="/trades">Trades</Link>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trades" element={<TradesComponents />} />
      </Routes>
    </Router>
  );
};

export default App;
