import { Gift, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { classNames } from "../../lib/classNames";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  classNames(
    "rounded-full px-3 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-[#ffe5ed] text-[#9d3f5b] shadow-sm shadow-rose-100"
      : "text-[#6b5550] hover:bg-rose-50 hover:text-[#9d3f5b]",
  );

export function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-[#fff8f9]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" to="/">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#f69ab2] to-[#d85f83] text-white shadow-lg shadow-rose-300/40">
            <Gift className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-bold tracking-wide text-[#332522]">
              The AMY Shop
            </span>
            <span className="hidden text-xs font-medium text-[#8a706a] sm:block">
              Handmade custom gifts
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink className={navLinkClass} to="/">
            Home
          </NavLink>
          <NavLink className={navLinkClass} to="/products">
            Products
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink className={navLinkClass} to="/orders">
                Orders
              </NavLink>
              <NavLink className={navLinkClass} to="/account">
                Account
              </NavLink>
              {isAdmin ? (
                <NavLink className={navLinkClass} to="/admin">
                  Admin
                </NavLink>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="hidden rounded-full p-2 text-[#6b5550] transition hover:bg-rose-50 hover:text-[#9d3f5b] lg:inline-flex"
            to="/products"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            className="hidden rounded-full p-2 text-[#6b5550] transition hover:bg-rose-50 hover:text-[#9d3f5b] sm:inline-flex"
            to="/cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
          {isAuthenticated ? (
            <Button onClick={() => void logout()} variant="secondary">
              Sign out
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="secondary">
                <UserRound className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          )}
          <button className="rounded-full p-2 text-[#6b5550] md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
