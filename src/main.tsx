import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Catch and suppress benign Vite/WebSocket HMR errors in the sandbox environment
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (
    reason &&
    (reason === 'WebSocket closed without opened.' ||
     (typeof reason === 'string' && (reason.includes('WebSocket') || reason.includes('vite'))) ||
     (reason.message && (reason.message.includes('WebSocket') || reason.message.includes('vite'))))
  ) {
    event.preventDefault();
    console.warn('Suppressed benign HMR WebSocket rejection:', reason);
  }
});

window.addEventListener('error', (event) => {
  const message = event.message;
  if (
    message &&
    (message.includes('WebSocket') || message.includes('[vite]') || message.includes('vite'))
  ) {
    event.preventDefault();
    console.warn('Suppressed benign HMR WebSocket error:', message);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
