import { Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./guards/ProtectedRoute";
import { DashboardLayout } from "./pages/consultant/DashboardLayout";

import Login from "./pages/auth/Login";
import { NotFound } from "./pages/errors/NotFound";
import DashboardWelcome from "./pages/consultant/DashboardWelcome";
import PublicHome from "./pages/PublicHome";
import QuestionList from "./pages/consultant/questions/QuestionList";
import CreateQuestion from "./pages/consultant/questions/CreateQuestion";
import GenerateEvaluation from "./pages/consultant/candidates/GenerateEvaluation";

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* --- RUTAS PÚBLICAS --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PublicHome />} />

                {/* --- ZONA CONSULTOR (Exclusivo para no-admins) --- */}
                <Route element={<ProtectedRoute requireConsultant={true} />}>
                    <Route element={<DashboardLayout />}>
                        <Route
                            path="/dashboard"
                            element={<DashboardWelcome />}
                        />

                        <Route path="/evaluate" element={<GenerateEvaluation />} />

                        {/* Gestion de preguntas */}
                        <Route
                            path="/questions/new"
                            element={<CreateQuestion />}
                        />
                        <Route
                            path="/questions"
                            element={<QuestionList />}
                        />
                    </Route>
                </Route>

                {/* --- RUTA 404 --- */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
