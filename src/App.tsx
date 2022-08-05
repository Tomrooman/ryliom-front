import React, { FC, ReactElement } from 'react';

import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import './App.css';
import AnalyzeComponent from './components/AnalyzeComponent/AnalyzeComponent';

const Home = (): ReactElement => {
  return (
    <div>
      <h1>Test home</h1>
      <Link to="/analyze">Analyze</Link>
    </div>
  );
};

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<AnalyzeComponent />} />
      </Routes>
    </Router>
  );
};

export default App;
