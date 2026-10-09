import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './save-page';
import { I18nProvider } from '@/ui-kit/i18n-provider';
import { ThemeProvider } from '@/ui-kit/theme-provider';
import './save-recording.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
);
