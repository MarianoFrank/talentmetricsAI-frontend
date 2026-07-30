import { useState, useEffect, useCallback } from 'react';
import { tmApi } from '../config/api';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const { data } = await tmApi.get('/api/auth/me');
            setUser(data);
            return data;
        } catch (error) {
            setUser(null);

            if (error.response?.status !== 403) {
                console.error('Error verificando sesión:', error);
            }

            return null;
        }
    }, []);


    const login = async (username, password) => {
        setLoading(true);

        try {
            await tmApi.post('/api/auth/login', {
                username,
                password
            });

            // Después del login recuperamos el usuario
            await fetchUser();

            return true;

        } catch (error) {
            setUser(null);
            throw error;

        } finally {
            setLoading(false);
        }
    };

    const loginCandidate = async (accessCode) => {
        setLoading(true);
        try {
            const response = await tmApi.post('/api/auth/candidate/login', { accessCode });
            // Después de loguear con éxito, obligamos a React a pedir el /me
            await fetchUser();

            // Devolvemos la data para que el PublicHome sepa a dónde navegar
            return response.data;
        } catch (error) {
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);

        try {
            await tmApi.post('/api/auth/logout');
            setUser(null);
            return true;

        } catch (error) {
            console.error('Error cerrando sesión:', error);
            return false;

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {

        const PUBLIC_ROUTES = [
            '/login',
            '/register',
            '/'
        ];

        const initAuth = async () => {
            const isPublicRoute = PUBLIC_ROUTES.includes(window.location.pathname);

            if (isPublicRoute) {
                setLoading(false);
                return;
            }

            await fetchUser();
            setLoading(false);
        };

        initAuth();
    }, [fetchUser]);


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                loginCandidate,
                logout,
                isAuthenticated: Boolean(user),
                isConsultant: user?.role === 'CONSULTANT',
                isCandidate: user?.role === 'CANDIDATE'
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
