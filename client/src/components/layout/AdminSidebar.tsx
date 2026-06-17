import { BarChart3, Boxes, ClipboardList, Tags, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { classNames } from "../../lib/classNames";

const adminLinks = [
  { label: "Dashboard", to: "/admin", icon: BarChart3 },
  { label: "Products", to: "/admin/products", icon: Boxes },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Customers", to: "/admin/customers", icon: UsersRound },
  { label: "Coupons", to: "/admin/coupons", icon: Tags },
];

export function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-[#4a3431] bg-[#332522] px-5 py-6 text-white lg:block">
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
