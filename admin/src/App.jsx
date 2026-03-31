// import { Routes, Route, Navigate } from 'react-router-dom';
// import Dashboard from './pages/DashBoard';


// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Dashboard />} />
//       {/* Catch-all → dashboard */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute  from './components/ProtectedRoute';
import Dashboard       from './pages/DashBoard';
import LoginPage       from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}