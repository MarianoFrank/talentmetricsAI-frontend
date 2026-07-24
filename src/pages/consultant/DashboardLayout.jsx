import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export const DashboardLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Le decimos explícitamente al Sidebar que se pinte de Consultor */}
            <Sidebar isAdmin={false} />

            <main className="flex-1 overflow-y-auto px-10 py-10">
                <Outlet />
            </main>
        </div>
    );
};
