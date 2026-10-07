import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './archive-page';
import { I18nProvider } from '@/ui-kit/i18n-provider';
import { ThemeProvider } from '@/ui-kit/theme-provider';
import { ConfirmProvider } from './kit';
import './archive.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
);
