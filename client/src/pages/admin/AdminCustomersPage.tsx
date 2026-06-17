import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  ChevronDown,
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
  UsersRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { normalizeApiError } from "../../lib/apiError";
import {
  adminCustomerApi,
  type AdminCustomer,
  type AdminCustomerDetail,
  type AdminCustomerDetailResult,
  type CustomerStatus,
} from "../../services/adminCustomerApi";
import type { PaginatedMeta } from "../../types/api";

type SidebarItem = {
  label: string;
  icon: LucideIcon;
  soon?: boolean;
  to?: string;
};

type Stat = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "green" | "pink" | "stone";
};

const customerStatuses: CustomerStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const sidebarGroups: Array<{ label: string; items: SidebarItem[] }> = [
  {
    label: "",
    items: [{ label: "Overview", icon: Home, to: "/admin" }],
  },
  {
    label: "Orders",
    items: [{ label: "Orders", icon: ShoppingBag, to: "/admin/orders" }],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", icon: UsersRound, to: "/admin/customers" },
      { label: "Segments", icon: Tags, soon: true },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Products", icon: Gift, to: "/admin/products" },
      { label: "Collections", icon: Heart, soon: true },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Discounts", icon: Tags, soon: true },
      { label: "Email Campaigns", icon: Mail, soon: true },
      { label: "Reviews", icon: Star, soon: true },
    ],
  },
  {
    label: "Store",
    items: [
      { label: "Analytics", icon: BarChart3, soon: true },
      { label: "Settings", icon: Settings, soon: true },
    ],
  },
];

const statusStyles: Record<CustomerStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-stone-100 text-stone-600 ring-stone-200",
  SUSPENDED: "bg-pink-100 text-pink-700 ring-pink-200",
};

const formatDate = (date: string | undefined) => {
  if (!date) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const formatCurrency = (amount: string | number | undefined) => {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-NP", {
    currency: "NPR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
};

const displayStatus = (status: string) => status.replaceAll("_", " ");

const getCustomerOrders = (customer: AdminCustomer | AdminCustomerDetail | null) => (
  customer?.profile?.totalOrders ?? customer?._count?.orders ?? 0
);

const getCustomerSpent = (
  customer: AdminCustomer | AdminCustomerDetail | null,
  detail?: AdminCustomerDetailResult | null,
) => detail?.summaries?.orders?.totalSpent ?? customer?.profile?.totalSpent ?? 0;

const getApiErrorMessage = (error: unknown) => {
  const normalized = normalizeApiError(error);
  const firstError = normalized.errors?.[0];

  if (
    firstError &&
    typeof firstError === "object" &&
    "message" in firstError &&
    typeof firstError.message === "string"
  ) {
    return firstError.message;
  }

  return normalized.message;
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
                const baseClass = "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition";

                if (item.soon || !item.to) {
                  return (
                    <div className={`${baseClass} cursor-not-allowed text-[#B8A5AD]`} key={item.label}>
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#C8A7B1]">
                        Soon
                      </span>
                    </div>
                  );
                }

                return (
                  <NavLink
                    className={({ isActive }) =>
                      `${baseClass} ${
                        isActive
                          ? "bg-[#FDECEF] text-[#EC4C84] shadow-sm shadow-pink-100"
                          : "text-[#5E5962] hover:bg-white/80"
                      }`
                    }
                    end={item.to === "/admin"}
                    key={item.label}
                    to={item.to}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
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
          <span className="min-w-0 flex-1 text-sm text-[#9D8F98]">Search from the customer toolbar below</span>
          <span className="rounded-lg bg-[#FFF5F7] px-2 py-1 text-xs font-bold text-[#C8A7B1]">Soon</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button
            className="relative grid h-11 w-11 cursor-not-allowed place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#C8A7B1]"
            disabled
            title="Notifications coming soon"
            type="button"
          >
            <Bell className="h-5 w-5" />
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

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  const toneClass = stat.tone === "green" ? "text-[#39B86D]" : stat.tone === "pink" ? "text-[#EC4C84]" : "text-[#9D8F98]";

  return (
    <div className="rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#6F6570]">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-[#1F1720]">{stat.value}</p>
          <p className={`mt-1 text-xs font-bold ${toneClass}`}>{stat.helper}</p>
        </div>
        <span className="grid h-13 w-13 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}

function Badge({ label }: { label: CustomerStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[label]}`}>
      {label}
    </span>
  );
}

function CustomerInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">
      {initials || "C"}
    </span>
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

function Notice({ message, tone }: { message: string; tone: "error" | "success" }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
      tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-600"
    }`}>
      {message}
    </div>
  );
}

function CustomerTable({
  customers,
  isUpdating,
  onSelect,
  onStatusChange,
  selectedCustomerId,
}: {
  customers: AdminCustomer[];
  isUpdating: string | null;
  onSelect: (customer: AdminCustomer) => void;
  onStatusChange: (customer: AdminCustomer, status: CustomerStatus) => void;
  selectedCustomerId: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
      <div className="grid min-w-[74rem] grid-cols-[2fr_1.7fr_1.15fr_0.6fr_1fr_0.9fr_1fr_8rem] border-b border-[#F7D9E2] px-4 py-3 text-xs font-bold text-[#6F6570]">
        <span>Customer</span>
        <span>Email</span>
        <span>Phone</span>
        <span>Orders</span>
        <span>Total Spent</span>
        <span>Status</span>
        <span>Joined Date</span>
        <span>Actions</span>
      </div>
      <div className="min-w-[74rem]">
        {customers.map((customer) => (
          <button
            className={`grid w-full grid-cols-[2fr_1.7fr_1.15fr_0.6fr_1fr_0.9fr_1fr_8rem] items-center border-b border-[#F7D9E2]/70 px-4 py-4 text-left text-sm last:border-b-0 ${
              selectedCustomerId === customer.id ? "bg-[#FFF5F7]" : "bg-white"
            }`}
            key={customer.id}
            onClick={() => onSelect(customer)}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-3">
              <CustomerInitials name={customer.fullName} />
              <span className="min-w-0">
                <span className="block truncate font-bold text-[#1F1720]">{customer.fullName}</span>
                <span className="text-xs font-semibold text-[#9D8F98]">{customer.role}</span>
              </span>
            </span>
            <span className="truncate text-[#6F6570]">{customer.email ?? "No email"}</span>
            <span className="text-xs font-semibold text-[#6F6570]">{customer.phone}</span>
            <span className="font-bold text-[#1F1720]">{getCustomerOrders(customer)}</span>
            <span className="font-bold text-[#1F1720]">{formatCurrency(getCustomerSpent(customer))}</span>
            <span>
              <Badge label={customer.status} />
            </span>
            <span className="text-xs text-[#6F6570]">{formatDate(customer.createdAt)}</span>
            <span onClick={(event) => event.stopPropagation()}>
              <select
                className="h-10 w-full rounded-xl border border-[#F7D9E2] bg-white px-3 text-xs font-bold text-[#6F6570] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isUpdating === customer.id}
                onChange={(event) => onStatusChange(customer, event.target.value as CustomerStatus)}
                value={customer.status}
              >
                {customerStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </span>
          </button>
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
        {action ? <span className="rounded-full bg-[#FFF5F7] px-3 py-1 text-xs font-bold text-[#C8A7B1]">{action}</span> : null}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm text-[#6F6570]">
      <span>{label}</span>
      <span className="text-right font-semibold text-[#1F1720]">{value}</span>
    </div>
  );
}

function DetailPanel({
  detail,
  isLoading,
  onClose,
  selectedCustomer,
}: {
  detail: AdminCustomerDetailResult | null;
  isLoading: boolean;
  onClose: () => void;
  selectedCustomer: AdminCustomer | null;
}) {
  const customer = detail?.customer ?? selectedCustomer;
  const recentOrders = detail?.summaries?.orders?.recentOrders ?? detail?.customer.orders ?? [];

  return (
    <aside className="border-l border-[#F7D9E2] bg-[#FFF5F7] px-6 py-8 xl:w-[27rem] xl:shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
            Customer Summary
          </h2>
          <p className="mt-2 text-sm text-[#6F6570]">Real backend account detail.</p>
        </div>
        <button onClick={onClose} type="button">
          <X className="h-5 w-5 text-[#6F6570]" />
        </button>
      </div>

      {isLoading ? (
        <PanelCard title="Loading customer">
          <p className="text-sm text-[#6F6570]">Fetching selected customer detail.</p>
        </PanelCard>
      ) : customer ? (
        <>
          <PanelCard title="Selected Customer" action="Profile edit soon">
            <div className="flex items-center gap-4">
              <CustomerInitials name={customer.fullName} />
              <div className="min-w-0">
                <p className="truncate font-bold text-[#1F1720]">{customer.fullName}</p>
                <p className="truncate text-sm text-[#6F6570]">{customer.email ?? "No email"}</p>
                <p className="text-sm text-[#6F6570]">{customer.phone}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge label={customer.status} />
              <span className="inline-flex rounded-full bg-[#FDECEF] px-3 py-1 text-xs font-bold text-[#EC4C84] ring-1 ring-[#F7D9E2]">
                {customer.role}
              </span>
            </div>
          </PanelCard>

          <PanelCard title="Customer Value">
            <div className="grid gap-3">
              <SummaryRow label="Total orders" value={String(detail?.summaries?.orders?.totalOrders ?? getCustomerOrders(customer))} />
              <SummaryRow label="Total spent" value={formatCurrency(getCustomerSpent(customer, detail))} />
              <SummaryRow label="Joined" value={formatDate(customer.createdAt)} />
              <SummaryRow label="Addresses" value={String(customer._count?.addresses ?? detail?.customer.addresses?.length ?? 0)} />
              <SummaryRow label="Reviews" value={String(customer._count?.reviews ?? 0)} />
            </div>
          </PanelCard>

          <PanelCard title="Recent Orders">
            <div className="grid gap-3">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div className="rounded-xl bg-[#FFF5F7] p-3 text-sm" key={order.id}>
                  <div className="flex justify-between gap-3 font-bold text-[#1F1720]">
                    <span>#{order.orderNumber}</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6F6570]">
                    {displayStatus(order.orderStatus)} · {formatDate(order.createdAt)}
                  </p>
                </div>
              )) : <p className="text-sm text-[#6F6570]">No recent orders provided.</p>}
            </div>
          </PanelCard>

          <PanelCard title="Saved Addresses">
            <div className="grid gap-3">
              {detail?.customer.addresses?.length ? detail.customer.addresses.slice(0, 3).map((address) => (
                <div className="rounded-xl bg-[#FFF5F7] p-3 text-sm text-[#6F6570]" key={address.id}>
                  <p className="font-bold text-[#1F1720]">{address.fullName}</p>
                  <p>{address.streetAddress}</p>
                  <p>{address.city}, {address.district}</p>
                  <p>{address.phone}</p>
                </div>
              )) : <p className="text-sm text-[#6F6570]">No addresses provided.</p>}
            </div>
          </PanelCard>

          <PanelCard title="Unsupported Actions" action="Coming soon">
            <p className="text-sm leading-6 text-[#6F6570]">
              Password reset, manual order edits, customer segmentation, and profile edits are not supported by the current customer admin API.
            </p>
          </PanelCard>
        </>
      ) : (
        <StateCard description="Select a customer row to load real admin customer detail." title="No customer selected" />
      )}
    </aside>
  );
}

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [detail, setDetail] = useState<AdminCustomerDetailResult | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [updatingCustomerId, setUpdatingCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminCustomerApi.list({
        limit: 20,
        page,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setCustomers(result.customers);
      setMeta(result.meta);
      setSelectedCustomer((current) => {
        if (current && result.customers.some((customer) => customer.id === current.id)) {
          return result.customers.find((customer) => customer.id === current.id) ?? current;
        }

        return result.customers[0] ?? null;
      });
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
      setCustomers([]);
      setMeta(null);
      setSelectedCustomer(null);
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  const loadCustomerDetail = useCallback(async (customerId: string) => {
    try {
      setIsDetailLoading(true);
      const result = await adminCustomerApi.get(customerId);
      setDetail(result);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
      setDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (selectedCustomer) {
      void loadCustomerDetail(selectedCustomer.id);
    } else {
      setDetail(null);
    }
  }, [loadCustomerDetail, selectedCustomer]);

  const stats = useMemo<Stat[]>(() => {
    const active = customers.filter((customer) => customer.status === "ACTIVE").length;
    const inactive = customers.filter((customer) => customer.status === "INACTIVE").length;
    const suspended = customers.filter((customer) => customer.status === "SUSPENDED").length;

    return [
      {
        label: "Total Customers",
        value: String(meta?.total ?? customers.length),
        helper: meta ? `Page ${meta.page} of ${meta.totalPages || 1}` : "From admin customer API",
        icon: UsersRound,
        tone: "pink",
      },
      {
        label: "Visible Active",
        value: String(active),
        helper: "Loaded rows only",
        icon: UserCheck,
        tone: "green",
      },
      {
        label: "Visible Inactive",
        value: String(inactive),
        helper: "Loaded rows only",
        icon: UsersRound,
        tone: "stone",
      },
      {
        label: "Visible Suspended",
        value: String(suspended),
        helper: "Loaded rows only",
        icon: UserMinus,
        tone: "pink",
      },
    ];
  }, [customers, meta]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleSelectCustomer = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setSuccessMessage(null);
  };

  const handleStatusChange = async (customer: AdminCustomer, status: CustomerStatus) => {
    if (status === customer.status) {
      return;
    }

    try {
      setUpdatingCustomerId(customer.id);
      setError(null);
      setSuccessMessage(null);
      const updatedCustomer = await adminCustomerApi.updateStatus(customer.id, status);
      setCustomers((current) => current.map((item) => item.id === customer.id ? updatedCustomer : item));
      setSelectedCustomer((current) => current?.id === customer.id ? updatedCustomer : current);
      setDetail((current) => current?.customer.id === customer.id ? { ...current, customer: { ...current.customer, ...updatedCustomer } } : current);
      setSuccessMessage(`${updatedCustomer.fullName} status updated to ${updatedCustomer.status}.`);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setUpdatingCustomerId(null);
    }
  };

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
                  <p className="mt-1 text-sm text-[#6F6570]">Manage real customers and account status</p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.label} stat={stat} />
                ))}
              </div>

              <div className="mt-5 grid gap-3">
                {successMessage ? <Notice message={successMessage} tone="success" /> : null}
                {error ? <Notice message={error} tone="error" /> : null}
              </div>

              <div className="mt-7 rounded-2xl border border-[#F7D9E2] bg-white p-4 shadow-sm shadow-pink-100">
                <form className="flex flex-col gap-3 lg:flex-row" onSubmit={handleSearchSubmit}>
                  <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4">
                    <Search className="h-4 w-4 text-[#9D8F98]" />
                    <input
                      className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]"
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search customers by name, email, or phone"
                      value={searchInput}
                    />
                  </div>
                  <select
                    className="h-11 rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm font-semibold text-[#6F6570] outline-none"
                    onChange={(event) => {
                      setPage(1);
                      setStatusFilter(event.target.value as CustomerStatus | "ALL");
                    }}
                    value={statusFilter}
                  >
                    <option value="ALL">All statuses</option>
                    {customerStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EC4C84] px-5 text-sm font-bold text-white" type="submit">
                    <Search className="h-4 w-4" /> Search
                  </button>
                  <button
                    className="flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#F7D9E2] bg-white px-5 text-sm font-bold text-[#C8A7B1]"
                    disabled
                    title="Advanced sort and date filters coming soon"
                    type="button"
                  >
                    <Filter className="h-4 w-4" /> More filters soon
                  </button>
                </form>

                <div className="mt-4 overflow-x-auto">
                  {isLoading ? (
                    <StateCard description="Loading real customer records from the admin customers API." title="Loading customers" />
                  ) : customers.length > 0 ? (
                    <CustomerTable
                      customers={customers}
                      isUpdating={updatingCustomerId}
                      onSelect={handleSelectCustomer}
                      onStatusChange={(customer, status) => void handleStatusChange(customer, status)}
                      selectedCustomerId={selectedCustomer?.id ?? null}
                    />
                  ) : (
                    <StateCard
                      description={error ? "Fix the API issue and refresh this page to try again." : "The admin customer API responded successfully, but no customers match this view."}
                      title={error ? "Customer API unavailable" : "No customers found"}
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 text-sm text-[#6F6570] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {meta ? `Showing page ${meta.page} of ${meta.totalPages || 1} · ${meta.total} total` : "Pagination appears after customers load."}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="rounded-xl border border-[#F7D9E2] bg-white px-4 py-2 font-bold text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!meta || page <= 1 || isLoading}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      type="button"
                    >
                      Previous
                    </button>
                    <button
                      className="rounded-xl border border-[#F7D9E2] bg-white px-4 py-2 font-bold text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!meta || page >= meta.totalPages || isLoading}
                      onClick={() => setPage((current) => current + 1)}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <DetailPanel
            detail={detail}
            isLoading={isDetailLoading}
            onClose={() => setSelectedCustomer(null)}
            selectedCustomer={selectedCustomer}
          />
        </div>
      </div>
    </div>
  );
}
