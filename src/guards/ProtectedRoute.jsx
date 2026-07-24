import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div className="p-4 text-center">Cargando sesión...</div>;

    // Si no está logueado, patada al login
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Outlet />;
}
