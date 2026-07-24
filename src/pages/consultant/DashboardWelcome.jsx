import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function DashboardWelcome() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Sacamos la hora para darle un saludo más natural
    const horaActual = new Date().getHours();
    let saludo = 'Buenas noches';
    if (horaActual >= 6 && horaActual < 12) saludo = 'Buen día';
    else if (horaActual >= 12 && horaActual < 20) saludo = 'Buenas tardes';

    return (
        <div className="max-w-6xl mx-auto animate-fadein">
            {/* Banner principal de bienvenida */}
            <div className="bg-linear-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
                {/* Un circulito decorativo de fondo con Tailwind */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                        {saludo}, {user?.name || 'Consultor'}
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl">
                        Bienvenido a TalentMetrics AI. Desde acá podés gestionar las evaluaciones por competencias, administrar tus candidatos y analizar los reportes de rendimiento.
                    </p>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Accesos Rápidos</h2>
                <p className="text-sm text-gray-500">¿Qué querés hacer hoy?</p>
            </div>

            {/* Grilla de tarjetas de acción */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Tarjeta 1: Evaluar */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
                    onClick={() => navigate('/evaluate')}>
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <i className="pi pi-users text-xl text-blue-600"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Evaluar Candidatos</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        Iniciá un nuevo proceso de evaluación con IA para los candidatos de tus búsquedas activas.
                    </p>
                    <div className="text-blue-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Comenzar evaluación <i className="pi pi-arrow-right text-xs"></i>
                    </div>
                </div>

                {/* Tarjeta 2: Crear Pregunta */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
                    onClick={() => navigate('/questions/new')}>
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <i className="pi pi-plus-circle text-xl text-green-600"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Nueva Pregunta</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        Alimentá el banco de preguntas sumando nuevos escenarios y casos de estudio.
                    </p>
                    <div className="text-green-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Crear ahora <i className="pi pi-arrow-right text-xs"></i>
                    </div>
                </div>

                {/* Tarjeta 3: Reportes */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
                    onClick={() => navigate('/reportes/merito')}>
                    <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <i className="pi pi-chart-bar text-xl text-purple-600"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Orden de Mérito</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        Revisá los resultados y el ranking de competencias de los candidatos ya evaluados.
                    </p>
                    <div className="text-purple-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ver reportes <i className="pi pi-arrow-right text-xs"></i>
                    </div>
                </div>

            </div>
        </div>
    );
}
