import {
  BarChart3,
  Boxes,
  ClipboardList,
  ExternalLink,
  Gift,
  Settings,
  Star,
  Tags,
  UserRound,
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
                "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2",
                isActive
                  ? "border-white bg-white text-[#EC4C84] shadow-[0_10px_25px_rgba(236,76,132,0.12)] ring-1 ring-[#F7D9E2]"
                  : "border-transparent text-[#5E5962] hover:border-white/80 hover:bg-white/70 hover:text-[#EC4C84]",
              )
            }
            end={link.to === "/admin"}
            key={link.to}
            onClick={onNavigate}
            to={link.to}
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/60 ring-1 ring-[#F7D9E2]/80 transition group-hover:bg-white">
              <Icon className="h-4 w-4" />
            </span>
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
      className="flex items-center gap-3 rounded-2xl border border-[#F7D9E2] bg-white/75 px-4 py-3 text-sm font-semibold text-[#5E5962] shadow-sm shadow-pink-100 transition hover:border-[#EC4C84] hover:bg-white hover:text-[#EC4C84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2"
      onClick={onNavigate}
      to="/"
    >
      <ExternalLink className="h-5 w-5" />
      View Store
    </Link>
  );
}

export function AdminProfileLink({ onNavigate }: AdminNavigationProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        classNames(
          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2",
          isActive
            ? "border-[#F7D9E2] bg-white text-[#EC4C84] shadow-sm shadow-pink-100"
            : "border-transparent text-[#5E5962] hover:border-[#F7D9E2] hover:bg-white/75 hover:text-[#EC4C84]",
        )
      }
      onClick={onNavigate}
      to="/admin/profile"
    >
      <UserRound className="h-5 w-5" />
      Profile
    </NavLink>
  );
}

export function AdminSettingsLink({ onNavigate }: AdminNavigationProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        classNames(
          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2",
          isActive
            ? "border-[#F7D9E2] bg-white text-[#EC4C84] shadow-sm shadow-pink-100"
            : "border-transparent text-[#5E5962] hover:border-[#F7D9E2] hover:bg-white/75 hover:text-[#EC4C84]",
        )
      }
      onClick={onNavigate}
      to="/admin/settings"
    >
      <Settings className="h-5 w-5" />
      Store Settings
    </NavLink>
  );
}

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[21rem] shrink-0 flex-col overflow-hidden border-r border-white/80 bg-[linear-gradient(165deg,#FFF9FA_0%,#FDECEF_52%,#FFF4E8_100%)] px-5 py-6 text-[#1F1720] shadow-[14px_0_40px_rgba(115,72,86,0.08)] lg:flex">
      <div className="mb-8 flex items-center gap-4 rounded-[1.75rem] border border-white/80 bg-white/55 px-4 py-4 shadow-sm shadow-pink-100/70 backdrop-blur">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#F06494] to-[#D93D73] text-white shadow-lg shadow-pink-200">
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
      <div className="mt-auto grid gap-2 pt-6">
        <AdminSettingsLink />
        <AdminProfileLink />
        <ViewStoreLink />
      </div>
    </aside>
  );
}
