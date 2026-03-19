import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-body">Verifying credentials…</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/agent/login" replace />;
}