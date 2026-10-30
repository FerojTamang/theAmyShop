import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function CustomerAccountRoute() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (isAdmin) {
    return <Navigate to="/admin/profile" replace />;
  }

  return <Outlet />;
}
