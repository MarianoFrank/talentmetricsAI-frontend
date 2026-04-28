import React from 'react';
import { Menu } from 'primereact/menu';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Definimos los ítems con el formato que pide el componente Menu
    const items = [
        {
            label: 'EVALUACIONES',
            items: [
                {
                    label: 'Crear Pregunta',
                    icon: 'pi pi-plus',
                    className: location.pathname === '/preguntas/nueva' ? 'bg-blue-50' : '',
                    command: () => navigate('/preguntas/nueva')
                },
                {
                    label: 'Evaluar Candidatos',
                    icon: 'pi pi-users',
                    command: () => navigate('/evaluar')
                },
                {
                    label: 'Importar Candidatos',
                    icon: 'pi pi-upload',
                    command: () => navigate('/importar')
                }
            ]
        },
        {
            label: 'REPORTES',
            items: [
                { label: 'Orden de mérito', icon: 'pi pi-list', command: () => navigate('/reportes/merito') },
                { label: 'Reporte comparativo', icon: 'pi pi-copy', command: () => navigate('/reportes/comparativo') }
            ]
        },
        {
            label: 'PARÁMETROS DEL SISTEMA',
            items: [
                { label: 'Puesto / Funciones', icon: 'pi pi-briefcase' },
                { label: 'Competencias', icon: 'pi pi-star' },
                { label: 'Factores', icon: 'pi pi-filter' }
            ]
        }
    ];

    return (
        <div className="h-screen flex flex-col bg-white border-r border-gray-200" style={{ width: '260px' }}>
            {/* Header con estilo de la marca */}
            <div className="p-4 mb-2">
                <div className="flex items-center gap-2 px-2">
                    <i className="pi pi-shield text-blue-600 text-2xl"></i>
                    <span className="text-xl font-bold text-gray-800">TalentMetrics</span>
                </div>
            </div>

            {/* El componente Menu de PrimeReact */}
            <div className="flex-grow">
                <Menu
                    model={items}
                    className="w-full border-none"
                    style={{ width: '100%' }}
                />
            </div>

            {/* Footer de usuario (estilo PrimeReact) */}
            <div className="p-3  surface-50">
                <div className="flex items-center gap-2 p-2">
                    <i className="pi pi-user p-2 border-circle bg-white shadow-1"></i>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">Mariano</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;