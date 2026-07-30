import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-column align-items-center justify-content-center min-h-screen text-center p-4 surface-ground">
            <h1 className="text-7xl font-bold text-color m-0">404</h1>
            <p className="text-xl text-color-secondary m-0 mt-3 mb-5">
                Uy, parece que te perdiste. Esa ruta no existe en el sistema.
            </p>
            <Button
                label="Volver atrás"
                icon="pi pi-arrow-left"
                onClick={() => navigate(-1)}
                size="large"
            />
        </div>
    );
};
