import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (
    location.pathname === "/admin" ||
    location.pathname === "/admin/coupons" ||
    location.pathname === "/admin/customers" ||
    location.pathname === "/admin/orders" ||
    location.pathname === "/admin/products"
  ) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#fbf4f3] text-[#332522] lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="border-b border-rose-100 bg-white/85 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b94767]">
                Admin dashboard
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#332522]">
                Welcome back, {user?.fullName ?? "Admin"}
              </h2>
            </div>
            <div className="rounded-full border border-rose-100 bg-[#fff7fa] px-4 py-2 text-sm font-semibold text-[#7a5d56]">
              {user?.role ?? "ADMIN"}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
