import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#fff8f9] text-[#332522]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
