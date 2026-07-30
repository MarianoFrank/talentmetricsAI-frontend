import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';


import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


import './index.css';

import App from './App.jsx';
import ThemeProvider from './context/ThemeProvider.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <BrowserRouter>
            <PrimeReactProvider value={{ ripple: true, inputStyle: 'outlined' }}>
                <ThemeProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </ThemeProvider>
            </PrimeReactProvider>
        </BrowserRouter>
    </StrictMode>,
);
