import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

export default function TestCompleted() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-column align-items-center justify-content-center mt-6">
            <div className="surface-card border-1 surface-border border-round p-4 sm:p-6 shadow-2 fadein mx-auto" style={{ maxWidth: '35rem' }}>

                <div className="text-center mb-5">
                    <div className="flex justify-content-center mb-4">
                        <div className="p-4 bg-green-100 border-circle flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                            <i className="pi pi-check-circle text-5xl text-green-500"></i>
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-color m-0">¡Evaluación Completada!</h1>
                    <p className="text-color-secondary mt-3 line-height-3 text-lg">
                        Tus respuestas fueron enviadas y guardadas correctamente.
                    </p>
                </div>

                <Divider />

                <div className="mt-5 flex flex-column align-items-center text-center">
                    <p className="text-sm font-medium text-color-secondary mb-5 line-height-3">
                        El equipo de selección de <strong>Capital Humano</strong> analizará tus resultados y se pondrá en contacto con vos a la brevedad para informarte sobre los próximos pasos del proceso.
                    </p>

                    <Button
                        label="Volver al Inicio"
                        icon="pi pi-home"
                        severity="secondary"
                        outlined
                        className="w-full sm:w-auto px-6 py-3"
                        onClick={() => navigate('/')} // Ajustá esta ruta a la landing de candidatos si tenés una específica
                    />
                </div>

            </div>
        </div>
    );
}
