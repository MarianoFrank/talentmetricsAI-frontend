import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export const DashboardLayout = () => {
    return (
        <div className="flex w-full h-screen overflow-hidden surface-ground">
            <Sidebar isAdmin={false} />

            {/* Contenedor principal que maneja el scroll interno */}
            <div className="flex-1 flex flex-column h-screen overflow-hidden">
                {/* padding generoso pero controlado para que respire */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 lg:py-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
