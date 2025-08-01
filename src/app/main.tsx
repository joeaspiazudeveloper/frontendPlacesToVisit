import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/main.scss';
import App from './App';

const rootElement = document.getElementById('root');

// Verificar si el elemento raíz existe
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error('Root element not found');
}
