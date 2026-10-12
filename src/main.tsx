import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Limpeza preventiva de service workers e caches em ambiente de desenvolvimento
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().catch(() => {});
    }
  }).catch(() => {});
}

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (err) {
    console.error('Falha crítica na montagem da aplicação:', err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background-color: #020617; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif; padding: 24px; text-align: center;">
        <div style="font-size: 42px; margin-bottom: 12px;">🎣</div>
        <h2 style="font-size: 20px; font-weight: 800; color: #38bdf8; margin: 0 0 8px 0;">Jogo de Pesca</h2>
        <p style="font-size: 13px; color: #94a3b8; max-width: 380px; margin: 0 0 20px 0;">Ocorreu uma instabilidade ao inicializar. Clique no botão abaixo para reiniciar com dados limpos.</p>
        <button onclick="try { localStorage.clear(); } catch(e){} window.location.reload();" style="padding: 10px 20px; background: #0284c7; color: #ffffff; font-weight: 700; font-size: 14px; border: none; border-radius: 12px; cursor: pointer;">
          Reiniciar Jogo
        </button>
      </div>
    `;
  }
}
