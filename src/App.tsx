import React, { FC, ReactElement } from 'react';

import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import './App.css';
import AnalyzeComponent from './components/AnalyzeComponent/AnalyzeComponent';
import TradesChartsComponent from './components/TradesChartsComponent/TradesChartsComponent';

const Home = (): ReactElement => (
  <div>
    <h1>Test home</h1>
    <p>
      <Link to="/analyze">Analyze</Link>
    </p>
    <p>
      <Link to="/trades">Trades</Link>
    </p>
  </div>
);

const App: FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trades" element={<TradesChartsComponent />} />
      <Route path="/analyze" element={<AnalyzeComponent />} />
    </Routes>
  </Router>
);

export default App;
