import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { getTheme, setTheme } from './services/storage';
import ErrorBoundary from './components/ErrorBoundary';
import { captureGlobalErrors } from './services/telemetry';

setTheme(getTheme());
captureGlobalErrors();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
