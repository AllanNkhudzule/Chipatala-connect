import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { getTheme, setTheme } from './services/storage';
import ErrorBoundary from './components/ErrorBoundary';
import { captureGlobalErrors } from './services/telemetry';

setTheme(getTheme());
captureGlobalErrors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
