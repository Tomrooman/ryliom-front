import React, { FC, ReactElement } from 'react';

import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import './App.css';
import { TradesComponent } from './components/TradesComponent/TradesComponent';

const Home = (): ReactElement => {
  return (
    <div>
      <h1>Test home</h1>
      <Link to="/trades">Trades</Link>
    </div>
  );
};

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trades" element={<TradesComponent />} />
      </Routes>
    </Router>
  );
};

export default App;
