import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { tmApi } from '../../config/api';
import { useAppToast } from '../../context/ToastContext';
import QuestionBlock from './QuestionBlock';
import Timer from './Timer';

export default function QuestionnaireWizard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showError, showSuccess } = useAppToast();

    const [loading, setLoading] = useState(true);
    const [currentBlockNumber, setCurrentBlockNumber] = useState(1);
    const [totalBlocks, setTotalBlocks] = useState(1);
    const [currentBlockData, setCurrentBlockData] = useState(null);
    const [answers, setAnswers] = useState({});

    const [durationMinutes, setDurationMinutes] = useState(0);
    const [startedAt, setStartedAt] = useState(null);

    // Inicialización del cuestionario
    useEffect(() => {
        const initializeWizard = async () => {
            setLoading(true);
            try {
                let blockToLoad = location.state?.currentBlock;
                let total = location.state?.totalBlocks;
                let duration = location.state?.durationMinutes;
                let start = location.state?.startedAt;

                // Fallback: Si refrescan la página con F5, pedimos los datos de inicio de nuevo
                if (!blockToLoad || !total || !start) {
                    const { data } = await tmApi.post(`/api/questionnaires/${id}/start`);
                    blockToLoad = data.currentBlock;
                    total = data.totalBlocks;
                    duration = data.durationMinutes;
                    start = data.startedAt;
                }

                setTotalBlocks(total);
                setCurrentBlockNumber(blockToLoad);
                setDurationMinutes(duration);
                setStartedAt(start);

                await loadBlock(blockToLoad);
            } catch (error) {
                handleCriticalError(error);
            }
        };

        initializeWizard();
    }, [id, location.state]);

    // Función para traer la data de un bloque
    const loadBlock = async (blockNum) => {
        setLoading(true);
        try {
            const { data } = await tmApi.get(`/api/questionnaires/${id}/blocks/${blockNum}`);
            setCurrentBlockData(data);
            setAnswers({}); // Limpiamos respuestas en memoria para el nuevo bloque
        } catch (error) {
            handleCriticalError(error);
        } finally {
            setLoading(false);
        }
    };

    // Manejador genérico para sacar al candidato si el cuestionario ya no es válido
    const handleCriticalError = (error) => {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error inesperado.';
        const msgLower = errorMsg.toLowerCase();

        if (['habilitado', 'curso', 'finalizado', 'estado', 'unidireccional', 'orden'].some(kw => msgLower.includes(kw))) {
            navigate(`/questionnaire/${id}/completed`, { replace: true });
        } else {
            showError(errorMsg);
            setLoading(false);
        }
    };

    const handleSelectOption = (questionItemId, optionId) => {
        setAnswers(prev => ({ ...prev, [questionItemId]: optionId }));
    };

    const handleNextBlock = async () => {
        const questionsInBlock = currentBlockData?.questionItems || [];
        const payload = {};

        // Armamos el diccionario para enviar al backend { "id": [ids] }
        for (const item of questionsInBlock) {
            const ans = answers[item.id]; // Usamos el ID del item como key
            if (Array.isArray(ans) ? ans.length > 0 : ans != null) {
                payload[item.id] = Array.isArray(ans) ? ans : [ans];
            }
        }

        if (Object.keys(payload).length < questionsInBlock.length) {
            showError('Por favor, respondé todas las preguntas antes de avanzar.');
            return;
        }

        setLoading(true);
        try {
            // 🛡️ CORRECCIÓN: Le sacamos el /submit a la ruta para que coincida con el backend
            await tmApi.post(`/api/questionnaires/${id}/blocks/${currentBlockNumber}`, payload);

            if (currentBlockNumber < totalBlocks) {
                const nextBlock = currentBlockNumber + 1;
                setCurrentBlockNumber(nextBlock);
                await loadBlock(nextBlock);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showSuccess('¡Evaluación finalizada con éxito!');
                navigate(`/questionnaire/${id}/completed`, { replace: true });
            }
        } catch (error) {
            handleCriticalError(error);
        }
    };

    const handleTimeUp = () => {
        showError('¡Se acabó el tiempo! Tu evaluación será cerrada.');
        navigate(`/questionnaire/${id}/completed`, { replace: true });
    };

    const progressPercentage = totalBlocks > 0 ? (currentBlockNumber / totalBlocks) * 100 : 0;

    return (
        <div className="surface-card border-1 surface-border border-round p-4 sm:p-6 shadow-2 fadein mt-3">
            <div className="flex flex-column gap-2 mb-5">
                <div className="flex justify-content-between align-items-center">
                    <span className="font-bold text-sm text-primary">
                        Bloque {currentBlockNumber} de {totalBlocks}
                    </span>
                    <Timer startedAt={startedAt} durationMinutes={durationMinutes} onTimeUp={handleTimeUp} />
                </div>
                <ProgressBar value={progressPercentage} showValue={false} style={{ height: '8px' }} />
            </div>

            {loading ? (
                <div className="flex justify-content-center align-items-center py-6">
                    <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
                </div>
            ) : currentBlockData ? (
                <QuestionBlock
                    block={currentBlockData}
                    answers={answers}
                    onSelectOption={handleSelectOption}
                />
            ) : null}

            <div className="mt-6 pt-4 border-top-1 surface-border flex justify-content-end">
                <Button
                    label={currentBlockNumber === totalBlocks ? 'Finalizar Evaluación' : 'Siguiente Bloque'}
                    icon={currentBlockNumber === totalBlocks ? 'pi pi-check' : 'pi pi-arrow-right'}
                    iconPos="right"
                    severity={currentBlockNumber === totalBlocks ? 'success' : 'primary'}
                    onClick={handleNextBlock}
                    disabled={loading}
                />
            </div>
        </div>
    );
}
