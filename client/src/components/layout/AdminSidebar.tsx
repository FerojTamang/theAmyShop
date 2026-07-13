import {
  BarChart3,
  Boxes,
  ClipboardList,
  ExternalLink,
  Gift,
  Star,
  Tags,
  UsersRound,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { classNames } from "../../lib/classNames";

export const adminLinks = [
  { label: "Dashboard", to: "/admin", icon: BarChart3 },
  { label: "Products", to: "/admin/products", icon: Boxes },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Customers", to: "/admin/customers", icon: UsersRound },
  { label: "Coupons", to: "/admin/coupons", icon: Tags },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
] as const;

type AdminNavigationProps = {
  onNavigate?: () => void;
};

export function AdminNavigation({ onNavigate }: AdminNavigationProps) {
  return (
    <nav aria-label="Admin navigation" className="grid gap-2">
      {adminLinks.map((link) => {
        const Icon = link.icon;

        return (
          <NavLink
            className={({ isActive }) =>
              classNames(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-white text-[#EC4C84] shadow-sm shadow-pink-100 ring-1 ring-[#F7D9E2]"
                  : "text-[#5E5962] hover:bg-white/75 hover:text-[#EC4C84]",
              )
            }
            end={link.to === "/admin"}
            key={link.to}
            onClick={onNavigate}
            to={link.to}
          >
            <Icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function ViewStoreLink({ onNavigate }: AdminNavigationProps) {
  return (
    <Link
      className="flex items-center gap-3 rounded-2xl border border-[#F7D9E2] bg-white/70 px-4 py-3 text-sm font-semibold text-[#5E5962] shadow-sm shadow-pink-100 transition hover:border-[#EC4C84] hover:bg-white hover:text-[#EC4C84]"
      onClick={onNavigate}
      to="/"
    >
      <ExternalLink className="h-5 w-5" />
      View Store
    </Link>
  );
}

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[21rem] shrink-0 flex-col border-r border-[#F7D9E2] bg-[#FFF5F7] px-5 py-6 text-[#1F1720] shadow-[10px_0_35px_rgba(236,76,132,0.06)] lg:flex">
      <div className="mb-8 flex items-center gap-4 px-2">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
          <Gift className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
            The AMY Shop
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#6F6570]">Admin</p>
        </div>
      </div>
      <AdminNavigation />
      <div className="mt-auto pt-6">
        <ViewStoreLink />
      </div>
    </aside>
  );
}
