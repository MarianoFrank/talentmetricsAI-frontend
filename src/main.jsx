import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { PrimeReactProvider } from 'primereact/api';

import './index.css'; // Tu Tailwind v4 (@import "tailwindcss")

// Tema (Lara es el estándar actual, muy limpio)
import "primereact/resources/themes/lara-light-blue/theme.css";
// Core de componentes
import "primereact/resources/primereact.min.css";
// Iconos
import "primeicons/primeicons.css";



import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: true, inputStyle: 'filled' }}>
      <App />
    </PrimeReactProvider>
  </StrictMode>,
)
