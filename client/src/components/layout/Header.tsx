import { Gift, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePublicStoreSettings } from "../../hooks/usePublicStoreSettings";
import { classNames } from "../../lib/classNames";
import { NavigationSuccessNotice } from "../ui/NavigationSuccessNotice";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  classNames(
    "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2",
    isActive
      ? "bg-[#FDECEF] text-[#EC4C84] shadow-sm shadow-pink-100"
      : "text-[#6F6570] hover:bg-[#FFF5F7] hover:text-[#EC4C84]",
  );

export function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const settings = usePublicStoreSettings();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(settings.logoUrl && !logoFailed);

  const closeMenu = () => setIsMobileMenuOpen(false);
  const handleSignOut = async () => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      await logout();
    } finally {
      setIsSigningOut(false);
      closeMenu();
    }
  };

  return (
    <>
      <div className="border-b border-[#F7D9E2] bg-[#FFF5F7]">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 text-center text-xs font-semibold tracking-wide text-[#6F6570] sm:px-6 lg:px-8">
          Thoughtful gifts for meaningful moments.
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-[#F7D9E2]/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex min-w-0 items-center gap-3" to="/">
            {showLogo ? (
              <img
                alt="The AMY Shop logo"
                className="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover shadow-lg shadow-pink-200 ring-1 ring-[#F7D9E2] sm:h-12 sm:w-12"
                onError={() => setLogoFailed(true)}
                src={settings.logoUrl ?? ""}
              />
            ) : (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200 sm:h-12 sm:w-12">
                <Gift className="h-6 w-6" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                The AMY Shop
              </span>
              <span className="hidden text-xs font-medium text-[#9D8F98] sm:block">Handmade gifts</span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Store navigation">
            {!isAdmin ? <NavLink className={navLinkClass} end to="/">Home</NavLink> : null}
            {isAdmin ? <NavLink className={navLinkClass} to="/admin">Admin Dashboard</NavLink> : null}
            <NavLink className={navLinkClass} to="/products">Shop</NavLink>
            {isAuthenticated && !isAdmin ? (
              <>
                <NavLink className={navLinkClass} to="/orders">My Orders</NavLink>
                <NavLink className={navLinkClass} to="/account">My Account</NavLink>
              </>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              aria-label="Cart"
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#6F6570] transition hover:bg-[#FFF5F7] hover:text-[#EC4C84]"
              to="/cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden lg:inline">Cart</span>
            </Link>
            {isAuthenticated ? (
              <button
                className="hidden rounded-full border border-[#F7D9E2] bg-[#FFF9FA] px-4 py-2 text-sm font-semibold text-[#6F6570] transition hover:border-[#EC4C84] hover:text-[#EC4C84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2 disabled:opacity-60 lg:inline-flex"
                disabled={isSigningOut}
                onClick={() => void handleSignOut()}
                type="button"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            ) : (
              <Link className="hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2 lg:block" to="/login">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F7D9E2] bg-[#FFF9FA] px-4 py-2 text-sm font-semibold text-[#6F6570] transition hover:border-[#EC4C84] hover:text-[#EC4C84]">
                  <UserRound className="h-4 w-4" /> Sign in
                </span>
              </Link>
            )}
            <button
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full text-[#6F6570] hover:bg-[#FFF5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2 lg:hidden"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              type="button"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <nav className="grid gap-1 border-t border-[#F7D9E2] bg-white px-4 py-4 lg:hidden" aria-label="Mobile store navigation">
            {!isAdmin ? <NavLink className={navLinkClass} end onClick={closeMenu} to="/">Home</NavLink> : null}
            {isAdmin ? <NavLink className={navLinkClass} onClick={closeMenu} to="/admin">Admin Dashboard</NavLink> : null}
            <NavLink className={navLinkClass} onClick={closeMenu} to="/products">Shop</NavLink>
            <NavLink className={navLinkClass} onClick={closeMenu} to="/cart">Cart</NavLink>
            {isAuthenticated ? (
              <>
                {!isAdmin ? <NavLink className={navLinkClass} onClick={closeMenu} to="/orders">My Orders</NavLink> : null}
                {!isAdmin ? <NavLink className={navLinkClass} onClick={closeMenu} to="/account">My Account</NavLink> : null}
                <button
                  className="rounded-full px-4 py-2 text-left text-sm font-semibold text-[#6F6570] hover:bg-[#FFF5F7] hover:text-[#EC4C84] disabled:opacity-60"
                  disabled={isSigningOut}
                  onClick={() => void handleSignOut()}
                  type="button"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </>
            ) : (
              <NavLink className={navLinkClass} onClick={closeMenu} to="/login">Sign in</NavLink>
            )}
          </nav>
        ) : null}
      </header>
      <NavigationSuccessNotice />
    </>
  );
}
