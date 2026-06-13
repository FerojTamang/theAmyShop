import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function PublicLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-[#fff8f9] text-[#332522]">
      {isHomePage ? null : <Header />}
      <main>
        <Outlet />
      </main>
      {isHomePage ? null : <Footer />}
    </div>
  );
}
