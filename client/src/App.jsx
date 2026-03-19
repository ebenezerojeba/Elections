import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage     from './pages/LoginPage.jsx';
import RegisterPage  from './pages/RegisterPage.jsx';
import AgentPanel    from './pages/AgentPanel.jsx';
import ProtectedRoute from './component/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/agent"
        element={
          <ProtectedRoute>
            <AgentPanel />
          </ProtectedRoute>
        }
      />
      {/* Catch-all → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}