import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';

import './index.css';

// Tema (Lara es el estándar actual, muy limpio)
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import App from './App.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <BrowserRouter>
            <PrimeReactProvider value={{ ripple: true, inputStyle: 'outlined' }}>
                <App />
            </PrimeReactProvider>
        </BrowserRouter>
    </StrictMode>,
);
