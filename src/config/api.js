import axios from 'axios';

export const tmApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true, // Manda y recibe las cookies de sesión
    headers: {
        'Content-Type': 'application/json',
    }
});

// --- INTERCEPTOR PARA EL REFRESH TOKEN ---
tmApi.interceptors.response.use(
    (response) => response, // Si la petición sale bien, pasa de largo
    async (error) => {
        const originalRequest = error.config;

        // Si el backend nos patea (401) y todavía no reintentamos
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // SI ES UN CANDIDATO (está en la ruta del cuestionario), no intentamos refresh
            if (window.location.pathname.startsWith('/questionnaire')) {
                window.location.href = '/?expired=true';
                return Promise.reject(error);
            }

            try {
                // Le pegamos al endpoint de refresh.
                // Como tenemos withCredentials: true, la cookie de refresh viaja sola.
                await tmApi.post('/api/auth/refresh');

                // Si el backend nos dio un token nuevo, reintentamos la petición original que había fallado
                return tmApi(originalRequest);
            } catch (refreshError) {
                // Si el refresh token también venció o falló, lo mandamos directo al login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
