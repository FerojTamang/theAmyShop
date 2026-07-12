import { BarChart3, Boxes, ClipboardList, Star, Tags, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { classNames } from "../../lib/classNames";

export const adminLinks = [
  { label: "Dashboard", to: "/admin", icon: BarChart3 },
  { label: "Products", to: "/admin/products", icon: Boxes },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Customers", to: "/admin/customers", icon: UsersRound },
  { label: "Coupons", to: "/admin/coupons", icon: Tags },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
];

export function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-[#4a3431] bg-[#332522] px-5 py-6 text-white xl:block">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffdce6]">
          The AMY Shop
        </p>
        <h1 className="mt-2 text-2xl font-bold">Admin Studio</h1>
      </div>
      <nav className="grid gap-2">
        {adminLinks.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-white text-[#332522]"
                    : "text-[#ead9d4] hover:bg-white/10 hover:text-white",
                )
              }
              end={link.to === "/admin"}
              key={link.to}
              to={link.to}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export function AdminMobileNav() {
  return (
    <nav className="sticky top-0 z-40 flex gap-2 overflow-x-auto border-b border-[#F7D9E2] bg-white/95 px-4 py-3 backdrop-blur xl:hidden">
      {adminLinks.map((link) => {
        const Icon = link.icon;

        return (
          <NavLink
            className={({ isActive }) =>
              classNames(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold",
                isActive
                  ? "bg-[#EC4C84] text-white"
                  : "border border-[#F7D9E2] bg-[#FFF9FA] text-[#6F6570]",
              )
            }
            end={link.to === "/admin"}
            key={link.to}
            to={link.to}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
