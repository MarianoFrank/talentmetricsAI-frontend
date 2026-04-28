import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importamos tus páginas (las vamos a crear ahora)
import Sidebar from './components/layout/Sidebar';
import CreateQuestion from './pages/questions/CreateQuestion';
// Un componente de ejemplo para el Dashboard o Inicio
const Dashboard = () => <div className="p-6 text-2xl">Bienvenido a TalentMetrics AI</div>;

function App() {
  return (
    <BrowserRouter>

      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar className="h-full" />
        <main className="flex-1 overflow-y-auto px-60 py-10">
          <Routes>
            {/* Redirigir la raíz al Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Ruta para el flujo del PDF */}
            <Route path="/preguntas/nueva" element={<CreateQuestion />} />

            {/* Ruta 404 por si ponen cualquier cosa */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;