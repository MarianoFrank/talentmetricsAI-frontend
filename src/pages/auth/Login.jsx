import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
    const navigate = useNavigate();
    const { login, loading, isAuthenticated } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        try {
            await login(username, password);
        } catch (err) {
            setError(err.response?.data?.error || 'Usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className="flex flex-column align-items-center justify-content-center min-h-screen w-full surface-ground px-4 py-6">
            <div className="w-full" style={{ maxWidth: '420px' }}>

                {/* Header de la App */}
                <div className="text-center mb-5">
                    <div className="inline-flex align-items-center justify-content-center w-4rem h-4rem border-circle bg-primary-100 text-primary mb-3">
                        <i className="pi pi-verified text-3xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-color m-0">
                        TalentMetrics AI
                    </h1>
                    <p className="text-sm text-color-secondary mt-2 font-medium">
                        Plataforma de Evaluación
                    </p>
                </div>

                {/* Card Principal de Acceso */}
                <div className="surface-card border-1 surface-border border-round p-5 flex flex-column">
                    <form onSubmit={handleSubmit}>
                        <div className="flex align-items-center justify-content-center w-3rem h-3rem border-circle bg-primary-100 text-primary mx-auto mb-3">
                            <i className="pi pi-lock text-xl"></i>
                        </div>

                        <h2 className="text-xl font-bold text-color text-center m-0">
                            Acceso al Sistema
                        </h2>
                        <p className="text-sm text-color-secondary text-center mt-2 mb-4 line-height-3">
                            Ingresá tus credenciales para administrar métricas o gestionar la plataforma.
                        </p>

                        {error && (
                            <div className="mb-4">
                                <Message severity="error" text={error} className="w-full justify-content-start text-sm" />
                            </div>
                        )}

                        <div className="flex flex-column gap-4">
                            <div className="flex flex-column gap-2">
                                <label htmlFor="username" className="text-sm font-semibold text-color">
                                    Nombre de Usuario
                                </label>
                                <div className="p-inputgroup w-full">
                                    <span className="p-inputgroup-addon surface-ground">
                                        <i className="pi pi-user text-color-secondary"></i>
                                    </span>
                                    <InputText
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="ej: jperez"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-column gap-2">
                                <label htmlFor="password" className="text-sm font-semibold text-color">
                                    Contraseña
                                </label>
                                <div className="p-inputgroup w-full">
                                    <span className="p-inputgroup-addon surface-ground">
                                        <i className="pi pi-key text-color-secondary"></i>
                                    </span>
                                    <Password
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        toggleMask
                                        feedback={false}
                                        placeholder="••••••••"
                                        disabled={loading}
                                        pt={{ input: { className: 'w-full' } }}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                label="Ingresar al Sistema"
                                icon="pi pi-sign-in"
                                className="w-full mt-2"
                                loading={loading}
                            />
                        </div>
                    </form>
                </div>

                {/* Acceso para volver a la Home Pública */}
                <div className="mt-4 surface-card border-1 surface-border border-round p-3 flex align-items-center justify-content-between hover:surface-hover transition-colors cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center justify-content-center w-2rem h-2rem border-circle surface-ground text-color-secondary">
                            <i className="pi pi-users text-sm"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-color m-0">
                                ¿Sos un candidato?
                            </h3>
                            <p className="text-xs text-color-secondary m-0 mt-1">
                                Ingresá con tu código.
                            </p>
                        </div>
                    </div>
                    <Button icon="pi pi-arrow-left" text severity="secondary" rounded aria-label="Volver" />
                </div>

                <div className="text-center mt-6">
                    <p className="text-xs text-color-secondary">
                        &copy; {new Date().getFullYear()} TalentMetrics AI. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
