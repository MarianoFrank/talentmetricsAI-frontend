import { Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar'; // 👈 Importamos el Avatar para darle onda

// TODO: Importá tu hook de autenticación o estado global acá.
import { useAuth } from '../../hooks/useAuth';

export default function CandidateLayout() {
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Simulamos los datos del candidato.
    // Cuando lo enchufes de verdad, usá tu hook: const { candidate } = useAuth();
    const { user: candidate } = useAuth();
    console.log("Datos del candidato:", candidate); // 👈 Log para ver los datos del candidato
    return (
        <div className="min-h-screen surface-ground flex flex-column">
            <header className="surface-card shadow-1 px-4 py-3 flex align-items-center justify-content-between z-1 border-bottom-1 surface-border">

                {/* Logo y Título */}
                <div className="flex align-items-center gap-2 text-primary cursor-pointer" onClick={() => navigate('/')}>
                    <i className="pi pi-verified text-2xl"></i>
                    <span className="font-bold text-xl">TalentMetrics AI</span>
                </div>

                {/* Sección Derecha: Bienvenida + Controles */}
                <div className="flex align-items-center gap-3 text-color-secondary text-sm font-medium">

                    {/* Mensaje personalizado con Avatar (Se oculta en celulares muy chicos para no romper todo) */}
                    {candidate && (
                        <div className="hidden md:flex align-items-center gap-2 mr-2 border-right-1 surface-border pr-3">
                            <Avatar
                                label={candidate.firstName.charAt(0).toUpperCase()}
                                shape="circle"
                                className="bg-primary text-white font-bold"
                            />
                            <span>¡Hola, {candidate.firstName}!</span>
                        </div>
                    )}

                    <span className="hidden sm:inline">Evaluación de Competencias TIC</span>

                    <Button
                        icon={isDark ? 'pi pi-sun' : 'pi pi-moon'}
                        severity="secondary"
                        onClick={toggleTheme}
                        outlined
                        rounded
                        tooltipOptions={{ position: 'top' }}
                        tooltip={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        text
                        className="ml-2"
                    />
                </div>
            </header>

            {/* Contenedor central donde se inyectan Instructions y el Wizard */}
            <main className="flex-1 flex flex-column p-3 sm:p-5 w-full" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Outlet />
            </main>
        </div>
    );
}
