import { Menu } from 'primereact/menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const itemTemplate = (item) => {
        const active = isActive(item.route);

        return (
            <div
                onClick={() => item.route && navigate(item.route)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 group
                    ${active ? 'bg-blue-50/70 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <i className={`${item.icon} text-lg transition-colors
                    ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700'}`}
                ></i>
                <span className="text-sm font-medium">{item.label}</span>
            </div>
        );
    };

    const consultorItems = [
        {
            label: 'EVALUACIONES',
            items: [
                { label: 'Evaluar Candidatos', icon: 'pi pi-users', route: '/evaluate', template: itemTemplate },
                { label: 'Importar Candidatos', icon: 'pi pi-upload', route: '/importar', template: itemTemplate }
            ]
        },
        {
            label: 'REPORTES',
            items: [
                { label: 'Orden de mérito', icon: 'pi pi-list', route: '/reportes/merito', template: itemTemplate },
                { label: 'Reporte comparativo', icon: 'pi pi-copy', route: '/reportes/comparativo', template: itemTemplate }
            ]
        },
        {
            label: 'PARÁMETROS DEL SISTEMA',
            items: [
                { label: 'Puesto / Funciones', icon: 'pi pi-briefcase', route: '/parametros/puestos', template: itemTemplate },
                { label: 'Competencias', icon: 'pi pi-star', route: '/parametros/competencias', template: itemTemplate },
                { label: 'Factores', icon: 'pi pi-filter', route: '/parametros/factores', template: itemTemplate },
                { label: 'Preguntas', icon: 'pi pi-plus', route: '/questions', template: itemTemplate }
            ]
        }
    ];

    return (
        <div className="h-screen flex flex-col bg-white border-r border-gray-200 select-none" style={{ width: '260px' }}>
            <div className="p-5 border-b border-gray-100/60" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                <div className="flex items-center gap-2.5 px-1">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg border bg-blue-50 border-blue-100">
                        <i className="pi pi-shield text-blue-600 text-lg"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-gray-900 tracking-tight leading-none">TalentMetrics</span>
                        <span className="text-[10px] font-semibold text-gray-400 tracking-widest mt-1 uppercase">AI Evaluation</span>
                    </div>
                </div>
            </div>

            <div className="grow overflow-y-auto pt-2">
                <Menu
                    model={consultorItems}
                    className="w-full border-none! bg-transparent"
                    style={{ width: '100%' }}
                    pt={{
                        submenuHeader: { className: 'text-[11px] font-bold text-gray-400 tracking-wider px-5 pt-4 pb-2 bg-transparent uppercase' },
                        menu: { className: 'bg-transparent border-none' }
                    }}
                />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
                                {user?.name?.charAt(0) + user?.lastname?.charAt(0) || 'C'}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800 leading-tight">
                                {user?.name} {user?.lastname}
                            </span>
                            <span className="text-[11px] font-medium text-gray-500">
                                Legajo: {user?.legajo}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="w-9 h-9 rounded-lg bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-100 transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer"
                        title="Cerrar sesión"
                    >
                        <i className="pi pi-sign-out text-base"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
