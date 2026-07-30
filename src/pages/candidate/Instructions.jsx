import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { tmApi } from '../../config/api';
import { useAppToast } from '../../context/ToastContext';

export default function Instructions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError } = useAppToast();
    const [loading, setLoading] = useState(false);

    const handleStartTest = async () => {
        setLoading(true);
        try {
            // Le pegamos a /api/questionnaires/{id}/start para generar los bloques si no existen
            const { data } = await tmApi.post(`/api/questionnaires/${id}/start`);
            navigate(`/questionnaire/${id}/test`, { state: data, replace: true });
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Hubo un error al iniciar el cuestionario.';
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="surface-card border-1 surface-border border-round p-4 sm:p-6 shadow-2 fadein mt-4">
            <div className="text-center mb-5">
                <i className="pi pi-book text-5xl text-primary mb-3"></i>
                <h1 className="text-2xl sm:text-3xl font-bold text-color m-0">Instrucciones de la Evaluación</h1>
                <p className="text-color-secondary mt-2">Por favor, leé atentamente antes de comenzar.</p>
            </div>

            <Divider />

            <div className="flex flex-column gap-4 my-5">
                <div className="flex align-items-start gap-3">
                    <div className="p-2 bg-blue-100 border-circle text-blue-600 flex align-items-center justify-content-center">
                        <i className="pi pi-clock"></i>
                    </div>
                    <div>
                        <h3 className="m-0 mb-1 text-lg font-semibold">Tiempo Límite</h3>
                        <p className="m-0 text-color-secondary line-height-3">
                            Tendrás un máximo de <strong>60 minutos</strong> para completar todas las preguntas. El temporizador comenzará apenas hagas clic en "Comenzar".
                        </p>
                    </div>
                </div>

                <div className="flex align-items-start gap-3">
                    <div className="p-2 bg-orange-100 border-circle text-orange-600 flex align-items-center justify-content-center">
                        <i className="pi pi-step-forward"></i>
                    </div>
                    <div>
                        <h3 className="m-0 mb-1 text-lg font-semibold">Navegación Unidireccional</h3>
                        <p className="m-0 text-color-secondary line-height-3">
                            El cuestionario se presenta en bloques. <strong>Una vez que avances al siguiente bloque, no podrás retroceder</strong> para modificar respuestas anteriores.
                        </p>
                    </div>
                </div>
            </div>

            <Divider />

            <div className="mt-5 flex flex-column align-items-center">
                <p className="text-sm font-medium text-color-secondary mb-4 text-center">
                    Al hacer clic en el botón de abajo, confirmás que leíste y entendiste las reglas.
                </p>
                <Button
                    label="Comenzar Evaluación"
                    icon="pi pi-play"
                    size="large"
                    className="w-full sm:w-auto px-6 py-3 text-lg"
                    loading={loading}
                    onClick={handleStartTest}
                />
            </div>
        </div>
    );
}
