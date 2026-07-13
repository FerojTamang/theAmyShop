import { Gift, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  AdminNavigation,
  AdminSidebar,
  ViewStoreLink,
} from "./AdminSidebar";

const sectionTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/coupons": "Coupons",
  "/admin/reviews": "Reviews",
};

export function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sectionTitle = sectionTitles[location.pathname] ?? "Admin";
  const adminIdentity = user?.fullName || user?.email || user?.role || "Admin";
  const adminInitials = (user?.fullName || user?.email || "Admin")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsDrawerOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf4f3] text-[#1F1720] lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#F7D9E2] bg-white/95 px-4 py-4 shadow-sm shadow-pink-100/60 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-expanded={isDrawerOpen}
                aria-label="Open admin navigation"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] text-[#EC4C84] shadow-sm shadow-pink-100 lg:hidden"
                onClick={() => setIsDrawerOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">
                  Admin workspace
                </p>
                <h1 className="mt-1 truncate text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                  {sectionTitle}
                </h1>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84] ring-1 ring-[#F7D9E2] sm:grid">
                {adminInitials}
              </span>
              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-56 truncate text-sm font-bold text-[#1F1720]">{adminIdentity}</p>
                <p className="mt-0.5 text-xs capitalize text-[#6F6570]">{(user?.role ?? "ADMIN").toLowerCase().replaceAll("_", " ")}</p>
              </div>
              <button
                className="hidden items-center gap-2 rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] px-4 py-2.5 text-sm font-bold text-[#EC4C84] shadow-sm shadow-pink-100 transition hover:border-[#EC4C84] hover:bg-white disabled:opacity-60 sm:inline-flex"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Signing out..." : "Logout"}
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-[#1F1720]/55 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
            type="button"
          />
          <aside
            aria-label="Mobile admin navigation"
            className="relative flex h-full w-[min(88vw,21rem)] flex-col border-r border-[#F7D9E2] bg-[#FFF5F7] px-5 py-6 text-[#1F1720] shadow-2xl shadow-pink-950/20"
          >
            <div className="mb-8 flex items-start justify-between gap-4 px-2">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
                  <Gift className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                    The AMY Shop
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#6F6570]">Admin</p>
                </div>
              </div>
              <button
                aria-label="Close admin navigation"
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#F7D9E2] bg-white text-[#EC4C84] shadow-sm shadow-pink-100"
                onClick={() => setIsDrawerOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminNavigation onNavigate={() => setIsDrawerOpen(false)} />
            <div className="mt-auto grid gap-2 pt-6">
              <ViewStoreLink onNavigate={() => setIsDrawerOpen(false)} />
              <button
                className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-semibold text-[#5E5962] transition hover:border-[#F7D9E2] hover:bg-white/75 hover:text-[#EC4C84] disabled:opacity-60"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
                type="button"
              >
                <LogOut className="h-5 w-5" />
                {isLoggingOut ? "Signing out..." : "Logout"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
