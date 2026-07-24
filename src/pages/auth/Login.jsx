import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
    const navigate = useNavigate();
    const { login, loading, isAuthenticated } = useAuth(); // Volamos el isAdmin
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard'); // Todos van al mismo lado
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
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 px-4 py-8">
            <div className="w-full max-w-md">

                {/* Header de la App */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-3 shadow-sm">
                        <i className="pi pi-verified text-3xl"></i>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">
                        TalentMetrics AI
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Plataforma de Evaluación
                    </p>
                </div>

                {/* Card Principal de Acceso */}
                <Card className="shadow-lg border border-gray-100 rounded-xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="px-2 py-1">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto mb-4">
                            <i className="pi pi-lock text-2xl"></i>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 text-center m-0">
                            Acceso al Sistema
                        </h2>
                        <p className="text-sm text-gray-500 text-center mt-2 mb-6 leading-relaxed">
                            Ingresá tus credenciales para administrar métricas o gestionar la plataforma.
                        </p>

                        {/* Mensaje de Error en pantalla */}
                        {error && (
                            <div className="mb-4">
                                <Message severity="error" text={error} className="w-full justify-start text-xs" />
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="username" className="text-sm font-semibold text-gray-700">
                                    Nombre de Usuario
                                </label>
                                <div className="p-inputgroup w-full">
                                    <span className="p-inputgroup-addon bg-gray-50 border-gray-300 text-gray-500">
                                        <i className="pi pi-user"></i>
                                    </span>
                                    <InputText
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="ej: jperez"
                                        className="w-full border-gray-300 focus:border-blue-500"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Input de Contraseña */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                    Contraseña
                                </label>
                                <div className="p-inputgroup w-full">
                                    <span className="p-inputgroup-addon bg-gray-50 border-gray-300 text-gray-500">
                                        <i className="pi pi-key"></i>
                                    </span>
                                    <Password
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        toggleMask
                                        feedback={false}
                                        placeholder="••••••••"
                                        className="w-full"
                                        inputClassName="w-full border-gray-300 focus:border-blue-500"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Botón de Enviar */}
                            <Button
                                type="submit"
                                label="Ingresar al Sistema"
                                icon="pi pi-sign-in"
                                className="w-full p-3 font-semibold text-base mt-2"
                                loading={loading}
                            />
                        </div>
                    </form>
                </Card>

                {/* Acceso para volver a la Home Pública */}
                <Card className="mt-5 border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between py-1 px-2">
                        <div className="flex items-center gap-3 text-left">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600">
                                <i className="pi pi-users text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 m-0">
                                    ¿Sos un candidato?
                                </h3>
                                <p className="text-xs text-gray-400 m-0">
                                    Ingresá con tu código de invitación.
                                </p>
                            </div>
                        </div>

                        <Button
                            label="Volver"
                            icon="pi pi-arrow-left"
                            className="p-button-text p-button-sm text-xs text-gray-600 font-semibold"
                            onClick={() => navigate('/')}
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
}
