import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { createLogger } from './utils/logger';
import './styles/global.css';

const log = createLogger('main');
window.addEventListener('error', (e) => log.error('Uncaught error', e.message));
window.addEventListener('unhandledrejection', (e) => log.error('Unhandled rejection', e.reason));

createRoot(document.getElementById('root')).render(
  <React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>
);
