import React from 'react';

import axios from 'axios';
import dotenv from 'dotenv';
import ReactDOM from 'react-dom';

import App from './App';
import './index.css';

dotenv.config();

axios.defaults.baseURL = 'http://localhost:3001';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
