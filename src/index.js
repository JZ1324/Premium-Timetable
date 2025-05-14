import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/global.css';
// Import GitHub Pages routing helper
import './utils/githubPagesRouting';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);