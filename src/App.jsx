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
import GenerateEvaluation from "./pages/consultant/GenerateEvaluation";
import CandidateLayout from "./pages/candidate/CandidateLayout";
import Instructions from "./pages/candidate/Instructions";
import QuestionnaireWizard from "./pages/candidate/QuestionnaireWizard";
import TestCompleted from "./pages/candidate/TestCompleted";

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

                {/* --- ZONA CANDIDATO (Exclusivo para candidatos) --- */}
                <Route path="/questionnaire" element={<CandidateLayout />}>
                    <Route path=":id" element={<Instructions />} />
                    <Route path=":id/test" element={<QuestionnaireWizard />} />
                    <Route path=":id/completed" element={<TestCompleted />} />
                </Route>

                {/* --- RUTA 404 --- */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
