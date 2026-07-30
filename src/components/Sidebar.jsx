import { Menu } from 'primereact/menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { useTheme } from '../hooks/useTheme';

const Sidebar = () => {
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const itemTemplate = (item) => {
        const active = isActive(item.route);

        return (
            <div
                onClick={() => item.route && navigate(item.route)}
                // Removido bg-surface-200. surface-hover es suficiente y funciona perfecto en ambos temas.
                className={`flex align-items-center gap-3 px-3 py-2 mx-2 my-1 border-round cursor-pointer transition-colors transition-duration-200
                    ${active ? 'surface-hover text-primary font-semibold' : 'text-color-secondary hover:surface-hover hover:text-color'}`}
            >
                <i className={`${item.icon} text-lg ${active ? 'text-primary' : 'text-color-secondary'}`}></i>
                <span className="text-sm font-medium line-height-1">{item.label}</span>
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
        // Cambié surface-overlay por surface-card para que mantenga la coherencia con el fondo de los componentes
        <div className="h-screen flex flex-column surface-card surface-border border-right-1 select-none" style={{ width: '260px' }}>
            {/* --- LOGO --- */}
            <div className="p-4 hover:surface-hover transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="flex align-items-center gap-3 px-1">
                    <div className="flex align-items-center justify-content-center w-3rem h-3rem border-round border-1 surface-border surface-ground">
                        <i className="pi pi-shield text-primary text-xl"></i>
                    </div>
                    <div className="flex flex-column">
                        <span className="text-lg font-bold text-color line-height-1">TalentMetrics AI</span>
                    </div>
                </div>
            </div>

            {/* --- MENÚ --- */}
            <div className="flex-grow-1 overflow-auto pt-2">
                <Menu
                    model={consultorItems}
                    className="w-full border-none bg-transparent"
                    pt={{
                        submenuHeader: {
                            className: 'text-xs font-bold text-color-secondary px-4 pb-2 uppercase surface-ground',
                            style: { letterSpacing: '1px' }
                        },
                        menu: { className: 'border-none' }
                    }}
                />
            </div>

            {/* --- FOOTER DE USUARIO --- */}
            <div className="p-3 border-top-1 surface-border surface-ground">
                <div className="flex align-items-center justify-content-between px-1 gap-3">
                    <div className="flex align-items-center gap-3">
                        <div className="relative">
                            <Avatar
                                label={user?.name?.charAt(0) + user?.lastName?.charAt(0) || 'C'}
                                size="large"
                                shape="circle"
                                className="bg-primary text-primary-contrast font-bold shadow-1"
                            />
                            {/* Puntito verde de "conectado", el border hereda el color del parent para quedar prolijo */}
                            <span className="absolute bottom-0 right-0 w-1rem h-1rem bg-green-500 border-2 border-circle" style={{ borderColor: 'var(--surface-ground)' }}></span>
                        </div>
                        <div className="flex flex-column">
                            <span className="text-sm font-semibold text-color line-height-2">
                                {user?.name} {user?.lastname}
                            </span>
                            <span className="text-xs font-medium text-color-secondary">
                                Legajo: {user?.legajo}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-1">
                        <Button
                            icon={isDark ? 'pi pi-sun' : 'pi pi-moon'}
                            severity="secondary"
                            onClick={toggleTheme}
                            rounded
                            tooltipOptions={{ position: 'top' }}
                            tooltip={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                            text
                        />
                        <Button
                            icon="pi pi-sign-out"
                            severity="secondary"
                            text
                            rounded
                            aria-label="Cerrar sesión"
                            onClick={logout}
                            tooltip="Cerrar sesión"
                            tooltipOptions={{ position: 'top' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
