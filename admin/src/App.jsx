import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/DashBoard';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* Catch-all → dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}