import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function CustomerLayout() {
  const location = useLocation();

  if (location.pathname === "/cart" || location.pathname === "/checkout") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#fff8f9] text-[#332522]">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
