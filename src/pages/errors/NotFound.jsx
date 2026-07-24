import { useNavigate } from 'react-router-dom'; // Cambiamos Link por useNavigate

export const NotFound = () => {
    const navigate = useNavigate(); // Inicializamos el navegador

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
            <h1 className="text-6xl font-bold text-gray-800">404</h1>
            <p className="text-xl text-gray-600 mt-4">
                Uy, parece que te perdiste. Esa página no existe.
            </p>
            <button
                onClick={() => navigate(-1)} // <--- Esto te manda a la página anterior
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
                Volver
            </button>
        </div>
    );
};
