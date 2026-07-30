import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../hooks/useAuth';

export default function PublicHome() {
    const navigate = useNavigate();
    const { loginCandidate } = useAuth();

    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAccess = async (e) => {
        e.preventDefault();

        if (!accessCode.trim()) {
            setError('Por favor, ingresá un código válido.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // El AuthProvider maneja el login y el /me en un solo paso
            const { questionnaireId } = await loginCandidate(accessCode.trim());
            navigate(`/questionnaire/${questionnaireId}`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Código de acceso inválido o expirado.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-column align-items-center justify-content-center min-h-screen w-full surface-ground px-4 py-6">
            <div className="w-full" style={{ maxWidth: '420px' }}>
                <div className="text-center mb-5">
                    <div className="inline-flex align-items-center justify-content-center w-4rem h-4rem border-circle bg-primary-100 text-primary mb-3">
                        <i className="pi pi-verified text-3xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-color m-0">TalentMetrics AI</h1>
                    <p className="text-sm text-color-secondary mt-2 font-medium">Evaluación de Competencias TIC</p>
                </div>

                <div className="surface-card border-1 surface-border border-round p-5 flex flex-column">
                    <h2 className="text-xl font-bold text-color text-center mb-4 mt-0">Ingreso de Candidatos</h2>

                    <form onSubmit={handleAccess} className="flex flex-column gap-4">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="code" className="text-sm font-semibold text-color">Código de Invitación</label>
                            <div className="p-inputgroup w-full">
                                <span className="p-inputgroup-addon surface-ground">
                                    <i className="pi pi-key text-color-secondary"></i>
                                </span>
                                <InputText
                                    id="code"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="Ej: ABC-123-XYZ"
                                    disabled={loading}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {error && <Message severity="error" text={error} className="w-full justify-content-start text-sm" />}

                        <Button
                            label={loading ? 'Verificando...' : 'Comenzar Evaluación'}
                            icon="pi pi-sign-in"
                            type="submit"
                            className="w-full mt-2"
                            loading={loading}
                        />
                    </form>
                </div>

                <div
                    className="mt-4 surface-card border-1 surface-border border-round p-3 flex align-items-center justify-content-between hover:surface-hover transition-colors cursor-pointer"
                    onClick={() => navigate('/login')}
                >
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center justify-content-center w-2rem h-2rem border-circle surface-ground text-color-secondary">
                            <i className="pi pi-briefcase text-sm"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-color m-0">¿Sos consultor?</h3>
                            <p className="text-xs text-color-secondary m-0 mt-1">Accedé al panel de gestión.</p>
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-right" text rounded aria-label="Ingresar" />
                </div>
            </div>
        </div>
    );
}
