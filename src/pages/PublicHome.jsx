import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function PublicHome() {
    const navigate = useNavigate(); // <-- Hook correctamente instanciado acá[cite: 2]

    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAccess = (e) => {
        e.preventDefault();
        if (!accessCode.trim()) {
            setError('Por favor, ingresá un código válido.');
            return;
        }

        setError('');
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            alert(`Código "${accessCode}" ingresado con éxito. ¡Acá comenzaría la evaluación!`);
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 px-4 py-8">
            <div className="w-full max-w-md">

                {/* Header de la App */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-3 shadow-sm">
                        <i className="pi pi-verified text-3xl"></i>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">
                        TalentMetrics AI
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Evaluación de Competencias TIC
                    </p>
                </div>

                {/* Card Principal de Acceso (Candidatos) */}
                <Card className="shadow-lg border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-2 py-1">
                        <h2 className="text-xl font-bold text-gray-800 text-center mb-6 mt-0">
                            Ingreso de Candidatos
                        </h2>

                        <form onSubmit={handleAccess} className="space-y-5">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="code" className="text-sm font-semibold text-gray-700">
                                    Código de Invitación
                                </label>

                                <div className="p-inputgroup w-full">
                                    <span className="p-inputgroup-addon bg-gray-50 border-gray-300 text-gray-500">
                                        <i className="pi pi-key"></i>
                                    </span>
                                    <InputText
                                        id="code"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value)}
                                        placeholder="Ej: ABC-123-XYZ"
                                        className="w-full border-gray-300 focus:border-blue-500"
                                        disabled={loading}
                                    />
                                </div>

                                <p className="text-xs text-gray-400 m-0 leading-relaxed">
                                    Introducí el código alfanumérico único que recibiste en tu email de invitación.
                                </p>
                            </div>

                            {error && (
                                <div className="mt-2">
                                    <Message severity="error" text={error} className="w-full justify-start text-xs" />
                                </div>
                            )}

                            <Button
                                label={loading ? 'Verificando...' : 'Comenzar Evaluación'}
                                icon="pi pi-sign-in"
                                type="submit"
                                className="w-full p-3 font-semibold text-base mt-2"
                                loading={loading}
                            />
                        </form>
                    </div>
                </Card>

                {/* Card de Acceso para Consultores (Espejada a la del Login) */}
                <Card className="mt-5 border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between py-1 px-2">
                        <div className="flex items-center gap-3 text-left">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-gray-500">
                                <i className="pi pi-briefcase text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 m-0">
                                    ¿Sos consultor?
                                </h3>
                                <p className="text-xs text-gray-400 m-0">
                                    Accedé al panel de gestión de evaluaciones.
                                </p>
                            </div>
                        </div>

                        <Button
                            label="Ingresar"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            className="p-button-text p-button-sm text-xs text-blue-600 font-semibold"
                            onClick={() => navigate('/login')} // <-- Navegación directa corregida
                        />
                    </div>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} TalentMetrics AI. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};
