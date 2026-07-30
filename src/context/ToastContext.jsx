import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext();

export const useAppToast = () => {
    return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
    const toast = useRef(null);

    const showSuccess = (detail, summary = 'Éxito') => {
        toast.current?.show({ severity: 'success', summary, detail, life: 3000 });
    };

    const showError = (detail, summary = 'Error') => {
        toast.current?.show({ severity: 'error', summary, detail, life: 3000 });
    };

    const showInfo = (detail, summary = 'Info') => {
        toast.current?.show({ severity: 'info', summary, detail, life: 3000 });
    };

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
            <Toast ref={toast} />
            {children}
        </ToastContext.Provider>
    );
};
