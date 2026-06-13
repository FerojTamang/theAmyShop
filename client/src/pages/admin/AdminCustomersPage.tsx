import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  EllipsisVertical,
  Filter,
  Gift,
  Heart,
  Home,
  Mail,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  UserCheck,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";

type CustomerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

type SidebarItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  count?: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: string;
  status: CustomerStatus;
  joined: string;
  lastOrder: string;
  segment: string;
};

const sidebarGroups: Array<{ label: string; items: SidebarItem[] }> = [
  {
    label: "",
    items: [{ label: "Overview", icon: Home }],
  },
  {
    label: "Orders",
    items: [{ label: "Orders", icon: ShoppingBag, count: "127" }],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", icon: UsersRound, active: true },
      { label: "Segments", icon: Tags },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Products", icon: Gift },
      { label: "Collections", icon: Heart },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Discounts", icon: Tags },
      { label: "Email Campaigns", icon: Mail },
      { label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Store",
    items: [
      { label: "Analytics", icon: BarChart3 },
      { label: "Settings", icon: Settings },
    ],
  },
];

const customerStats = [
  { label: "Total Customers", value: "3,892", delta: "14.2%", icon: UsersRound, positive: true },
  { label: "Active Customers", value: "3,744", delta: "9.8%", icon: UserCheck, positive: true },
  { label: "New Customers", value: "482", delta: "8.7%", icon: UserPlus, positive: true },
  { label: "Suspended Customers", value: "18", delta: "2 this week", icon: UserMinus, positive: false },
];

const customers: Customer[] = [
  {
    id: "CUS-1001",
    name: "Sarah Johnson",
    email: "sarah.j@example.test",
    phone: "+1 (555) 123-4567",
    orders: 8,
    spent: "$342.50",
    status: "ACTIVE",
    joined: "May 4, 2025",
    lastOrder: "May 12, 2025",
    segment: "VIP",
  },
  {
    id: "CUS-1002",
    name: "Emily Rose",
    email: "emily.r@example.test",
    phone: "+1 (555) 234-5678",
    orders: 5,
    spent: "$189.90",
    status: "ACTIVE",
    joined: "Apr 18, 2025",
    lastOrder: "May 12, 2025",
    segment: "Loyal",
  },
  {
    id: "CUS-1003",
    name: "Jessica Miller",
    email: "jessica.m@example.test",
    phone: "+1 (555) 345-6789",
    orders: 12,
    spent: "$556.80",
    status: "ACTIVE",
    joined: "Mar 27, 2025",
    lastOrder: "May 11, 2025",
    segment: "VIP",
  },
  {
    id: "CUS-1004",
    name: "Amanda Lee",
    email: "amanda.l@example.test",
    phone: "+1 (555) 456-7890",
    orders: 3,
    spent: "$98.00",
    status: "SUSPENDED",
    joined: "May 1, 2025",
    lastOrder: "May 11, 2025",
    segment: "New",
  },
  {
    id: "CUS-1005",
    name: "Lauren Kim",
    email: "lauren.k@example.test",
    phone: "+1 (555) 567-8901",
    orders: 1,
    spent: "$28.50",
    status: "INACTIVE",
    joined: "Feb 14, 2025",
    lastOrder: "Mar 3, 2025",
    segment: "At Risk",
  },
];

const statusStyles: Record<CustomerStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-stone-100 text-stone-600 ring-stone-200",
  SUSPENDED: "bg-pink-100 text-pink-700 ring-pink-200",
};

const segmentStyles: Record<string, string> = {
  VIP: "bg-pink-100 text-pink-700 ring-pink-200",
  Loyal: "bg-amber-100 text-amber-700 ring-amber-200",
  New: "bg-blue-100 text-blue-700 ring-blue-200",
  "At Risk": "bg-stone-100 text-stone-600 ring-stone-200",
};

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-[22rem] shrink-0 border-r border-[#F7D9E2] bg-[#FFF5F7] px-5 py-6 xl:block">
      <div className="mb-8 flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
          <Gift className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
            The AMY Shop
          </h1>
          <p className="text-sm font-medium text-[#6F6570]">Admin</p>
        </div>
      </div>

      <div className="grid gap-6">
        {sidebarGroups.map((group) => (
          <div key={group.label || "overview"}>
            {group.label ? (
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.22em] text-[#EC4C84]">
                {group.label}
              </p>
            ) : null}
            <div className="grid gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      item.active
                        ? "bg-[#FDECEF] text-[#EC4C84] shadow-sm shadow-pink-100"
                        : "text-[#5E5962] hover:bg-white/80"
                    }`}
                    key={item.label}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </span>
                    {item.count ? (
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#EC4C84]">
                        {item.count}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-[#F7D9E2] bg-white/70 p-5 shadow-sm shadow-pink-100">
        <p className="text-sm font-semibold text-[#6F6570]">Customer Care</p>
        <p className="mt-2 text-lg font-bold text-[#1F1720]">Relationships first</p>
        <p className="mt-3 text-sm leading-6 text-[#6F6570]">
          Track customer history, order value, and account status in one polished workspace.
        </p>
      </div>
    </aside>
  );
}

function TopHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#F7D9E2] bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="mx-auto hidden h-11 w-full max-w-xl items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4 shadow-sm lg:flex">
          <Search className="h-5 w-5 text-[#9D8F98]" />
          <input
            className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]"
            placeholder="Search customers, orders, products..."
          />
          <span className="rounded-lg bg-[#FFF5F7] px-2 py-1 text-xs font-bold text-[#6F6570]">Ctrl K</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button className="relative grid h-11 w-11 place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#6F6570]">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#EC4C84] text-[10px] font-bold text-white">
              8
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">
              AA
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#1F1720]">Amy Admin</p>
              <p className="text-xs text-[#6F6570]">Administrator</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#6F6570]" />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({ stat }: { stat: (typeof customerStats)[number] }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#6F6570]">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-[#1F1720]">{stat.value}</p>
          <p className={`mt-1 text-xs font-bold ${stat.positive ? "text-[#39B86D]" : "text-red-500"}`}>
            {stat.positive ? "up" : "review"} {stat.delta}{" "}
            <span className="font-medium text-[#9D8F98]">vs last 30 days</span>
          </p>
        </div>
        <span className="grid h-13 w-13 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}

function FilterControl({ label }: { label: string }) {
  return (
    <button className="flex h-11 items-center justify-between gap-8 rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm font-semibold text-[#6F6570]">
      {label}
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

function Badge({ label, type }: { label: string; type: "status" | "segment" }) {
  const styles = type === "status" ? statusStyles[label as CustomerStatus] : segmentStyles[label];

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles ?? "bg-[#FDECEF] text-[#EC4C84] ring-[#F7D9E2]"}`}>
      {label}
    </span>
  );
}

function CustomerInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">
      {initials}
    </span>
  );
}

function CustomerTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
      <div className="grid min-w-[68rem] grid-cols-[2fr_1.7fr_1.15fr_0.6fr_1fr_0.9fr_1fr_4rem] border-b border-[#F7D9E2] px-4 py-3 text-xs font-bold text-[#6F6570]">
        <span>Customer</span>
        <span>Email</span>
        <span>Phone</span>
        <span>Orders</span>
        <span>Total Spent</span>
        <span>Status</span>
        <span>Joined Date</span>
        <span>Actions</span>
      </div>
      <div className="min-w-[68rem]">
        {customers.map((customer, index) => (
          <div
            className={`grid grid-cols-[2fr_1.7fr_1.15fr_0.6fr_1fr_0.9fr_1fr_4rem] items-center border-b border-[#F7D9E2]/70 px-4 py-4 text-sm last:border-b-0 ${
              index === 0 ? "bg-[#FFF5F7]" : "bg-white"
            }`}
            key={customer.id}
          >
            <span className="flex items-center gap-3">
              <CustomerInitials name={customer.name} />
              <span className="min-w-0">
                <span className="block truncate font-bold text-[#1F1720]">{customer.name}</span>
                <span className="mt-1 inline-flex">
                  <Badge label={customer.segment} type="segment" />
                </span>
              </span>
            </span>
            <span className="text-[#6F6570]">{customer.email}</span>
            <span className="text-xs font-semibold text-[#6F6570]">{customer.phone}</span>
            <span className="font-bold text-[#1F1720]">{customer.orders}</span>
            <span className="font-bold text-[#1F1720]">{customer.spent}</span>
            <span>
              <Badge label={customer.status} type="status" />
            </span>
            <span className="text-xs text-[#6F6570]">{customer.joined}</span>
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#F7D9E2] text-[#6F6570] hover:bg-[#FFF5F7]">
              <EllipsisVertical className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelCard({
  action,
  children,
  title,
}: {
  action?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-[#1F1720]">{title}</h3>
        {action ? <button className="text-xs font-bold text-[#EC4C84]">{action}</button> : null}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm text-[#6F6570]">
      <span>{label}</span>
      <span className="font-semibold text-[#1F1720]">{value}</span>
    </div>
  );
}

function DetailPanel() {
  const featuredCustomer = customers[0];

  return (
    <aside className="border-l border-[#F7D9E2] bg-[#FFF5F7] px-6 py-8 xl:w-[27rem] xl:shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
            Customer Summary
          </h2>
          <p className="mt-2 text-sm text-[#6F6570]">Focused view for relationship details.</p>
        </div>
        <button>
          <X className="h-5 w-5 text-[#6F6570]" />
        </button>
      </div>

      <PanelCard title="Selected Customer" action="View Profile">
        <div className="flex items-center gap-4">
          <CustomerInitials name={featuredCustomer.name} />
          <div className="min-w-0">
            <p className="truncate font-bold text-[#1F1720]">{featuredCustomer.name}</p>
            <p className="truncate text-sm text-[#6F6570]">{featuredCustomer.email}</p>
            <p className="text-sm text-[#6F6570]">{featuredCustomer.phone}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Badge label={featuredCustomer.status} type="status" />
          <Badge label={featuredCustomer.segment} type="segment" />
        </div>
      </PanelCard>

      <PanelCard title="Customer Value">
        <div className="grid gap-3">
          <SummaryRow label="Total orders" value={String(featuredCustomer.orders)} />
          <SummaryRow label="Total spent" value={featuredCustomer.spent} />
          <SummaryRow label="Last order" value={featuredCustomer.lastOrder} />
          <SummaryRow label="Joined" value={featuredCustomer.joined} />
        </div>
      </PanelCard>

      <PanelCard title="Account Health">
        <div className="rounded-xl bg-[#FFF5F7] p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-[#6F6570]">Relationship score</span>
            <span className="font-bold text-[#EC4C84]">Excellent</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[#FDECEF]">
            <span className="block h-2 w-[86%] rounded-full bg-[#EC4C84]" />
          </div>
          <p className="mt-4 text-sm leading-6 text-[#6F6570]">
            Frequent gift buyer with strong repeat order activity and a healthy account status.
          </p>
        </div>
      </PanelCard>
    </aside>
  );
}

function StateCard({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-6 text-center shadow-sm shadow-pink-100">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
        <UsersRound className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-bold text-[#1F1720]">{title}</h3>
      <p className="mt-2 text-sm text-[#6F6570]">{description}</p>
    </div>
  );
}

export function AdminCustomersPage() {
  const hasCustomers = customers.length > 0;

  return (
    <div className="min-h-screen bg-white text-[#1F1720] xl:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopHeader />
        <div className="grid min-h-[calc(100vh-4.8rem)] xl:grid-cols-[minmax(0,1fr)_27rem]">
          <main className="min-w-0 bg-white px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-4xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                    Customers <Heart className="inline h-5 w-5 text-[#EC4C84]" />
                  </h1>
                  <p className="mt-1 text-sm text-[#6F6570]">Manage your customers and relationships</p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {customerStats.map((stat) => (
                  <StatCard key={stat.label} stat={stat} />
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-[#F7D9E2] bg-white p-4 shadow-sm shadow-pink-100">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4">
                    <Search className="h-4 w-4 text-[#9D8F98]" />
                    <input
                      className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]"
                      placeholder="Search customers"
                    />
                  </div>
                  <FilterControl label="Status" />
                  <FilterControl label="Joined Date" />
                  <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#F7D9E2] bg-white px-5 text-sm font-bold text-[#6F6570]">
                    <Filter className="h-4 w-4 text-[#EC4C84]" /> Sort/filter
                  </button>
                </div>
                <div className="mt-4 overflow-x-auto">
                  {hasCustomers ? (
                    <CustomerTable />
                  ) : (
                    <StateCard
                      description="Customers will appear here once registrations or imported customer records are available."
                      title="No customers found"
                    />
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <StateCard
                  description="Customer records are ready. Use the search and status controls to narrow this list."
                  title="Customer list loaded"
                />
                <StateCard
                  description="If the customer API cannot be reached, keep this panel styled consistently while fallback data is shown."
                  title="Customer data fallback"
                />
              </div>
            </div>
          </main>
          <DetailPanel />
        </div>
      </div>
    </div>
  );
}
