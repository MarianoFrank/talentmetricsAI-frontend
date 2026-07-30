import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function DashboardWelcome() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const horaActual = new Date().getHours();
    let saludo = 'Buenas noches';
    if (horaActual >= 6 && horaActual < 12) saludo = 'Buen día';
    else if (horaActual >= 12 && horaActual < 20) saludo = 'Buenas tardes';

    return (
        <div className="w-full fadein">
            {/* Banner principal alineado al tema */}
            <div className="bg-primary text-primary-contrast border-round p-5 md:p-6 mb-5 flex flex-column gap-2 relative overflow-hidden">
                <div className="relative z-1">
                    <h1 className="text-3xl md:text-4xl font-bold m-0 mb-2">
                        {saludo}, {user?.name || 'Consultor'}
                    </h1>
                    <p className="m-0 text-lg line-height-3" style={{ maxWidth: '800px', opacity: 0.9 }}>
                        Bienvenido a TalentMetrics AI. Desde acá podés gestionar las evaluaciones por competencias, administrar tus candidatos y analizar los reportes de rendimiento.
                    </p>
                </div>
                {/* Elemento decorativo sutil */}
                <i className="pi pi-chart-pie absolute z-0" style={{ fontSize: '15rem', right: '-2rem', top: '-3rem', opacity: 0.1, transform: 'rotate(-20deg)' }}></i>
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-bold text-color m-0">Accesos Rápidos</h2>
                <p className="text-sm text-color-secondary m-0 mt-1">¿Qué querés hacer hoy?</p>
            </div>

            {/* Grilla de tarjetas de acción (estilo Flat) */}
            <div className="grid">
                <div className="col-12 md:col-4 p-2">
                    <div className="surface-card border-1 surface-border border-round p-4 h-full flex flex-column hover:surface-hover transition-colors cursor-pointer" onClick={() => navigate('/evaluate')}>
                        <div className="flex align-items-center justify-content-center w-3rem h-3rem border-circle surface-ground text-primary mb-3">
                            <i className="pi pi-users text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-color m-0 mb-2">Evaluar Candidatos</h3>
                        <p className="text-sm text-color-secondary m-0 mb-4 line-height-3 flex-1">
                            Iniciá un nuevo proceso de evaluación con IA para los candidatos de tus búsquedas activas.
                        </p>
                        <div className="text-primary text-sm font-semibold flex align-items-center gap-2">
                            Comenzar <i className="pi pi-arrow-right text-xs"></i>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-4 p-2">
                    <div className="surface-card border-1 surface-border border-round p-4 h-full flex flex-column hover:surface-hover transition-colors cursor-pointer" onClick={() => navigate('/questions/new')}>
                        <div className="flex align-items-center justify-content-center w-3rem h-3rem border-circle surface-ground text-primary mb-3">
                            <i className="pi pi-plus-circle text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-color m-0 mb-2">Nueva Pregunta</h3>
                        <p className="text-sm text-color-secondary m-0 mb-4 line-height-3 flex-1">
                            Alimentá el banco de preguntas sumando nuevos escenarios y casos de estudio.
                        </p>
                        <div className="text-primary text-sm font-semibold flex align-items-center gap-2">
                            Crear ahora <i className="pi pi-arrow-right text-xs"></i>
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-4 p-2">
                    <div className="surface-card border-1 surface-border border-round p-4 h-full flex flex-column hover:surface-hover transition-colors cursor-pointer" onClick={() => navigate('/reportes/merito')}>
                        <div className="flex align-items-center justify-content-center w-3rem h-3rem border-circle surface-ground text-primary mb-3">
                            <i className="pi pi-chart-bar text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-color m-0 mb-2">Orden de Mérito</h3>
                        <p className="text-sm text-color-secondary m-0 mb-4 line-height-3 flex-1">
                            Revisá los resultados y el ranking de competencias de los candidatos ya evaluados.
                        </p>
                        <div className="text-primary text-sm font-semibold flex align-items-center gap-2">
                            Ver reportes <i className="pi pi-arrow-right text-xs"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
