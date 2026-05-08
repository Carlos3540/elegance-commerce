// src/components/auth/UserRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * UserRoute - Protege rutas que requieren autenticación
 * 
 * Verifica:
 * 1. Si está cargando → muestra spinner
 * 2. Si no hay usuario → redirige a home
 * 3. Si hay usuario → permite acceso
 * 
 * NOTA: No verifica si es admin, solo que esté logueado
 */

const UserRoute = () => {
  const { user, isLoading } = useAuth();

  // 1. Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. No autenticado → redirige a home (donde puede abrir el login)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. Autenticado → permite acceso
  return <Outlet />;
};

export default UserRoute;