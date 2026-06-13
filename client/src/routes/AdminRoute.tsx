import { Navigate, Outlet } from "react-router-dom";
import { Loader } from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";

export function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader label="Opening admin workspace" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
