// src/components/auth/AdminRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * AdminRoute - Protege rutas de administrador
 * 
 * Verifica:
 * 1. Si está cargando → muestra spinner
 * 2. Si no hay usuario → redirige a home
 * 3. Si no es admin → redirige a home
 * 4. Si es admin → permite acceso (<Outlet />)
 */

const AdminRoute = () => {
  const { isAdmin, isLoading, user } = useAuth();

  // 1. Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // 2. No autenticado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. Autenticado pero no es admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Es admin → renderiza las rutas hijas
  return <Outlet />;
};

export default AdminRoute;