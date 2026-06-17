import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Boxes,
  ChevronDown,
  ClipboardList,
  CreditCard,
  EllipsisVertical,
  Filter,
  Gift,
  Heart,
  Home,
  Mail,
  Printer,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tags,
  TrendingUp,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { normalizeApiError } from "../../lib/apiError";
import {
  orderApi,
  type CustomerOrder,
  type OrderStatus,
} from "../../services/orderApi";
import type { PaginatedMeta } from "../../types/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const sidebarGroups = [
  { label: "", items: [{ label: "Overview", icon: Home, soon: true }] },
  {
    label: "Orders",
    items: [
      { label: "Orders", icon: ClipboardList, active: true },
      { label: "Abandoned Carts", icon: ShoppingCart, soon: true },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", icon: UsersRound, soon: true },
      { label: "Segments", icon: Tags, soon: true },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Products", icon: Boxes, soon: true },
      { label: "Collections", icon: ClipboardList, soon: true },
      { label: "Gift Boxes", icon: Gift, soon: true },
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
      { label: "Settings", icon: Settings, soon: true },
      { label: "Users", icon: UsersRound, soon: true },
      { label: "Notifications", icon: Bell, soon: true },
    ],
  },
];

const supportedStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "IN_PRODUCTION",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const tabs: Array<[string, OrderStatus | "ALL"]> = [
  ["All Orders", "ALL"],
  ["Pending", "PENDING"],
  ["Confirmed", "CONFIRMED"],
  ["Processing", "PROCESSING"],
  ["In Production", "IN_PRODUCTION"],
  ["Ready", "READY_TO_SHIP"],
  ["Shipped", "SHIPPED"],
  ["Delivered", "DELIVERED"],
  ["Cancelled", "CANCELLED"],
  ["Returned", "RETURNED"],
];

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-sky-100 text-sky-700 ring-sky-200",
  PROCESSING: "bg-blue-100 text-blue-700 ring-blue-200",
  IN_PRODUCTION: "bg-purple-100 text-purple-700 ring-purple-200",
  READY_TO_SHIP: "bg-teal-100 text-teal-700 ring-teal-200",
  SHIPPED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  DELIVERED: "bg-green-100 text-green-700 ring-green-200",
  CANCELLED: "bg-stone-100 text-stone-600 ring-stone-200",
  RETURNED: "bg-red-100 text-red-700 ring-red-200",
  PAID: "bg-green-100 text-green-700 ring-green-200",
  FAILED: "bg-red-100 text-red-700 ring-red-200",
  REFUNDED: "bg-purple-100 text-purple-700 ring-purple-200",
  NOT_COLLECTED: "bg-stone-100 text-stone-600 ring-stone-200",
};

type OrderListMeta = PaginatedMeta | null;

const asNumber = (value: string | number | undefined) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

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

const getItemCount = (order: CustomerOrder) => (
  order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
);

const displayStatus = (status: string) => status.replaceAll("_", " ");

const getDisplayPaymentStatus = (order: CustomerOrder) => {
  if (
    order.paymentMethod === "CASH_ON_DELIVERY" &&
    order.paymentStatus === "PENDING" &&
    (order.orderStatus === "CANCELLED" || order.orderStatus === "RETURNED")
  ) {
    return "NOT_COLLECTED";
  }

  return order.paymentStatus;
};

const getDisplayPaymentStatusLabel = (order: CustomerOrder) => {
  const paymentStatus = getDisplayPaymentStatus(order);

  if (paymentStatus === "NOT_COLLECTED") {
    return order.orderStatus === "CANCELLED" ? "COD cancelled" : "Not collected";
  }

  return displayStatus(paymentStatus);
};

function Badge({ label }: { label: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[label] ?? "bg-[#FDECEF] text-[#EC4C84] ring-[#F7D9E2]"}`}>
      {displayStatus(label)}
    </span>
  );
}

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
            {group.label ? <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.22em] text-[#EC4C84]">{group.label}</p> : null}
            <div className="grid gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      item.active
                        ? "bg-[#FDECEF] text-[#EC4C84] shadow-sm shadow-pink-100"
                        : item.soon
                          ? "cursor-not-allowed text-[#C8A7B1]"
                          : "text-[#5E5962] hover:bg-white/80"
                    }`}
                    key={item.label}
                    title={item.soon ? "Coming soon" : undefined}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </span>
                    {item.soon ? <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#C8A7B1]">Soon</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-[#F7D9E2] bg-white/70 p-5">
        <p className="text-sm font-semibold text-[#6F6570]">Store Plan</p>
        <p className="mt-2 text-lg font-bold text-[#1F1720]">Premium</p>
        <button className="mt-5 w-full cursor-not-allowed rounded-xl bg-[#FDECEF] px-4 py-3 text-sm font-bold text-[#C8A7B1]" disabled type="button">
          Upgrade Soon
        </button>
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
          <input className="min-w-0 flex-1 cursor-not-allowed text-sm outline-none placeholder:text-[#C8A7B1]" disabled placeholder="Search coming soon" />
          <span className="rounded-lg bg-[#FFF5F7] px-2 py-1 text-xs font-bold text-[#C8A7B1]">Soon</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button className="relative grid h-11 w-11 place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#6F6570]" type="button">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">AA</span>
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#6F6570]">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#1F1720]">{value}</p>
          <p className="mt-1 text-xs font-bold text-[#39B86D]">Live API</p>
        </div>
        <span className="grid h-13 w-13 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}

function StatePanel({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-8 text-center shadow-sm shadow-pink-100">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
        <Gift className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6F6570]">{description}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm text-[#6F6570]">
      <span>{label}</span>
      <span className="font-semibold text-[#1F1720]">{value}</span>
    </div>
  );
}

function PanelCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100">
      <h3 className="mb-4 font-bold text-[#1F1720]">{title}</h3>
      {children}
    </div>
  );
}

function OrderDetailPanel({
  detailOrder,
  isLoading,
  onClose,
  selectedOrder,
}: {
  detailOrder: CustomerOrder | null;
  isLoading: boolean;
  onClose: () => void;
  selectedOrder: CustomerOrder | null;
}) {
  const order = detailOrder ?? selectedOrder;

  return (
    <aside className="border-l border-[#F7D9E2] bg-[#FFF5F7] px-6 py-8 xl:w-[27rem] xl:shrink-0">
      {order ? (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                Order #{order.orderNumber}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge label={order.orderStatus} />
                <Badge label={getDisplayPaymentStatus(order)} />
              </div>
              <p className="mt-3 text-sm text-[#6F6570]">{formatDate(order.createdAt)}</p>
            </div>
            <button onClick={onClose} type="button">
              <X className="h-5 w-5 text-[#6F6570]" />
            </button>
          </div>
          <div className="mt-5 flex justify-end gap-3 text-[#C8A7B1]">
            <Printer className="h-5 w-5" />
            <EllipsisVertical className="h-5 w-5" />
          </div>
          {isLoading ? (
            <PanelCard title="Loading details">
              <p className="text-sm text-[#6F6570]">Fetching order detail from the admin API.</p>
            </PanelCard>
          ) : null}
          <PanelCard title="Customer">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">
                {(order.user?.fullName ?? "C").charAt(0)}
              </span>
              <div>
                <p className="font-bold text-[#1F1720]">{order.user?.fullName ?? "Unknown customer"}</p>
                <p className="text-sm text-[#6F6570]">{order.user?.email ?? "No email"}</p>
                <p className="text-sm text-[#6F6570]">{order.user?.phone ?? "No phone"}</p>
              </div>
            </div>
          </PanelCard>
          <PanelCard title="Order Summary">
            <div className="grid gap-3">
              <DetailRow label="Subtotal" value={formatCurrency(order.subtotal)} />
              <DetailRow label="Shipping" value={formatCurrency(order.shippingFee)} />
              <DetailRow label="Gift wrap" value={formatCurrency(order.giftWrapFee)} />
              <DetailRow label="Discount" value={`-${formatCurrency(order.couponDiscount)}`} />
              <div className="mt-2 flex justify-between border-t border-[#F7D9E2] pt-4 text-lg font-bold">
                <span>Total</span>
                <span className="text-[#EC4C84]">{formatCurrency(order.totalAmount)}</span>
              </div>
              <DetailRow label="Payment method" value={displayStatus(order.paymentMethod)} />
              <DetailRow label="Payment status" value={getDisplayPaymentStatusLabel(order)} />
            </div>
          </PanelCard>
          <PanelCard title="Items in order">
            {order.items?.length ? order.items.map((item) => (
              <div className="flex items-center gap-3 border-b border-[#F7D9E2]/70 py-3 last:border-b-0" key={item.id}>
                <span className="grid h-16 w-16 place-items-center rounded-xl bg-gradient-to-br from-[#FDECEF] to-[#FFF5F7] text-[#EC4C84]">
                  <Gift className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1F1720]">{item.productNameSnapshot}</p>
                  <p className="text-xs text-[#6F6570]">{formatCurrency(item.priceSnapshot)} x {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-[#1F1720]">{formatCurrency(asNumber(item.priceSnapshot) * item.quantity)}</span>
              </div>
            )) : <p className="text-sm text-[#6F6570]">No items provided.</p>}
          </PanelCard>
          <PanelCard title="Shipping Address">
            {order.address ? (
              <p className="text-sm leading-6 text-[#6F6570]">
                {order.address.fullName}<br />
                {order.address.streetAddress}<br />
                {order.address.city}, {order.address.district}<br />
                {order.address.province}<br />
                {order.address.phone}
              </p>
            ) : <p className="text-sm text-[#6F6570]">Not provided.</p>}
          </PanelCard>
          <PanelCard title="Gift Info">
            {order.giftOption ? (
              <div className="grid gap-2 text-sm text-[#6F6570]">
                <p><strong className="text-[#1F1720]">Receiver:</strong> {order.giftOption.receiverName}</p>
                <p><strong className="text-[#1F1720]">Sender:</strong> {order.giftOption.senderName}</p>
                <p><strong className="text-[#1F1720]">Message:</strong> {order.giftOption.giftMessage}</p>
                <p><strong className="text-[#1F1720]">Wrap:</strong> {order.giftOption.giftWrapRequired ? "Yes" : "No"}</p>
              </div>
            ) : <p className="text-sm text-[#6F6570]">Not provided.</p>}
          </PanelCard>
          <PanelCard title="Status Timeline">
            {order.statusHistory?.length ? order.statusHistory.map((history) => (
              <div className="border-b border-[#F7D9E2]/70 py-3 text-sm last:border-b-0" key={history.id}>
                <p className="font-bold text-[#1F1720]">{displayStatus(history.newStatus)}</p>
                <p className="mt-1 text-xs text-[#6F6570]">{formatDate(history.createdAt)} · {history.changedBy?.fullName ?? "System"}</p>
                {history.note ? <p className="mt-1 text-xs text-[#9D8F98]">{history.note}</p> : null}
              </div>
            )) : <p className="text-sm text-[#6F6570]">Not provided.</p>}
          </PanelCard>
        </>
      ) : (
        <StatePanel description="Select an order row to view real admin order details." title="No order selected" />
      )}
    </aside>
  );
}

function OrdersTable({
  currentStatus,
  isUpdating,
  onSelect,
  onStatusChange,
  orders,
  selectedOrderId,
}: {
  currentStatus: OrderStatus | "ALL";
  isUpdating: string | null;
  onSelect: (order: CustomerOrder) => void;
  onStatusChange: (order: CustomerOrder, status: OrderStatus) => void;
  orders: CustomerOrder[];
  selectedOrderId: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
      <div className="grid min-w-[82rem] grid-cols-[8rem_1.3fr_8rem_9rem_10rem_8rem_7rem_9rem_10rem] border-b border-[#F7D9E2] px-4 py-3 text-xs font-bold text-[#6F6570]">
        <span>Order</span>
        <span>Customer</span>
        <span>Date</span>
        <span>Status</span>
        <span>Payment</span>
        <span>Total</span>
        <span>Items</span>
        <span>Address</span>
        <span>Actions</span>
      </div>
      <div className="min-w-[82rem]">
        {orders.map((order) => (
          <button
            className={`grid w-full grid-cols-[8rem_1.3fr_8rem_9rem_10rem_8rem_7rem_9rem_10rem] items-center border-b border-[#F7D9E2]/70 px-4 py-4 text-left text-sm last:border-b-0 ${
              selectedOrderId === order.id ? "bg-[#FFF5F7]" : "bg-white"
            }`}
            key={order.id}
            onClick={() => onSelect(order)}
            type="button"
          >
            <span className="font-bold text-[#EC4C84]">#{order.orderNumber}</span>
            <span>
              <span className="block font-bold text-[#1F1720]">{order.user?.fullName ?? "Unknown"}</span>
              <span className="text-xs text-[#6F6570]">{order.user?.email ?? order.user?.phone ?? "No contact"}</span>
            </span>
            <span className="text-xs text-[#6F6570]">{formatDate(order.createdAt)}</span>
            <span><Badge label={order.orderStatus} /></span>
            <span>
              <span className="block text-xs font-semibold text-[#6F6570]">{displayStatus(order.paymentMethod)}</span>
              <span className="mt-1 inline-flex"><Badge label={getDisplayPaymentStatus(order)} /></span>
            </span>
            <span className="font-semibold text-[#1F1720]">{formatCurrency(order.totalAmount)}</span>
            <span className="font-semibold text-[#6F6570]">{getItemCount(order)}</span>
            <span className="text-xs text-[#6F6570]">{order.address ? `${order.address.city}, ${order.address.district}` : "Not provided"}</span>
            <span onClick={(event) => event.stopPropagation()}>
              <select
                className="h-10 w-full rounded-xl border border-[#F7D9E2] bg-white px-3 text-xs font-bold text-[#6F6570] outline-none"
                disabled={isUpdating === order.id}
                onChange={(event) => onStatusChange(order, event.target.value as OrderStatus)}
                value={order.orderStatus}
              >
                {supportedStatuses.map((status) => (
                  <option key={status} value={status}>{displayStatus(status)}</option>
                ))}
              </select>
              {currentStatus !== "ALL" ? <span className="sr-only">{currentStatus}</span> : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [meta, setMeta] = useState<OrderListMeta>(null);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<CustomerOrder | null>(null);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredOrders = orders;
  const pendingCount = orders.filter((order) => order.orderStatus === "PENDING").length;
  const revenue = orders.reduce((sum, order) => sum + asNumber(order.totalAmount), 0);
  const averageOrder = orders.length ? revenue / orders.length : 0;

  const loadOrders = async (status: OrderStatus | "ALL" = activeStatus) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await orderApi.listAdmin({
        page: 1,
        limit: 100,
        ...(status !== "ALL" && { orderStatus: status }),
      });
      setOrders(result.orders);
      setMeta(result.meta);

      if (selectedOrder && !result.orders.some((order) => order.id === selectedOrder.id)) {
        setSelectedOrder(null);
        setDetailOrder(null);
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      setOrders([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders(activeStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  const handleSelectOrder = async (order: CustomerOrder) => {
    setSelectedOrder(order);
    setDetailOrder(null);

    try {
      setIsDetailLoading(true);
      setError(null);
      const detail = await orderApi.getAdmin(order.id);
      setDetailOrder(detail);
    } catch (detailError) {
      setError(getApiErrorMessage(detailError));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleStatusChange = async (order: CustomerOrder, orderStatus: OrderStatus) => {
    if (order.orderStatus === orderStatus) {
      return;
    }

    if (
      (orderStatus === "CANCELLED" || orderStatus === "RETURNED") &&
      !window.confirm(`Change order #${order.orderNumber} to ${displayStatus(orderStatus)}?`)
    ) {
      return;
    }

    const note = `Admin changed status from ${order.orderStatus} to ${orderStatus}`;

    try {
      setUpdatingOrderId(order.id);
      setError(null);
      setSuccessMessage(null);
      const updatedOrder = await orderApi.updateAdminStatus(order.id, {
        orderStatus,
        note,
      });
      setOrders((currentOrders) => currentOrders.map((item) => (
        item.id === updatedOrder.id ? updatedOrder : item
      )));
      setSelectedOrder(updatedOrder);
      setDetailOrder(updatedOrder);
      setSuccessMessage(`Order #${updatedOrder.orderNumber} updated to ${displayStatus(updatedOrder.orderStatus)}.`);
      await loadOrders(activeStatus);
    } catch (updateError) {
      setError(getApiErrorMessage(updateError));
    } finally {
      setUpdatingOrderId(null);
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
                    Orders <Heart className="inline h-5 w-5 text-[#EC4C84]" />
                  </h1>
                  <p className="mt-1 text-sm text-[#6F6570]">Manage and track real customer orders</p>
                </div>
                <div className="flex gap-3">
                  <button className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-5 text-sm font-bold text-[#C8A7B1]" disabled type="button">
                    <Upload className="h-4 w-4" /> Export Soon
                  </button>
                  <button className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-[#FDECEF] px-5 text-sm font-bold text-[#C8A7B1]" disabled type="button">
                    Create Order Soon
                  </button>
                </div>
              </div>

              {error ? (
                <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100">
                  {error}
                </p>
              ) : null}
              {successMessage ? (
                <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-100">
                  {successMessage}
                </p>
              ) : null}

              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={ShoppingBag} label="Total Orders" value={String(meta?.total ?? orders.length)} />
                <StatCard icon={CreditCard} label="Visible Revenue" value={formatCurrency(revenue)} />
                <StatCard icon={TrendingUp} label="Average Order" value={formatCurrency(averageOrder)} />
                <StatCard icon={ClipboardList} label="Pending Orders" value={String(pendingCount)} />
              </div>

              <div className="mt-7 flex gap-3 overflow-x-auto pb-1">
                {tabs.map(([label, status]) => (
                  <button
                    className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold ${
                      activeStatus === status ? "bg-[#FDECEF] text-[#EC4C84]" : "text-[#6F6570] hover:bg-[#FFF5F7]"
                    }`}
                    key={status}
                    onClick={() => setActiveStatus(status)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#F7D9E2] bg-white p-4 shadow-sm shadow-pink-100">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-4">
                    <Search className="h-4 w-4 text-[#9D8F98]" />
                    <input className="min-w-0 flex-1 cursor-not-allowed bg-transparent text-sm outline-none placeholder:text-[#C8A7B1]" disabled placeholder="Search via API filter coming soon" />
                  </div>
                  <button className="flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-5 text-sm font-bold text-[#C8A7B1]" disabled type="button">
                    <Filter className="h-4 w-4" /> Filters Soon
                  </button>
                </div>
                <div className="mt-4">
                  {isLoading ? (
                    <StatePanel description="Loading admin orders from the backend." title="Loading orders" />
                  ) : filteredOrders.length === 0 ? (
                    <StatePanel description="The admin orders API responded successfully, but no orders match this view." title="No orders found" />
                  ) : (
                    <OrdersTable
                      currentStatus={activeStatus}
                      isUpdating={updatingOrderId}
                      onSelect={(order) => void handleSelectOrder(order)}
                      onStatusChange={(order, status) => void handleStatusChange(order, status)}
                      orders={filteredOrders}
                      selectedOrderId={selectedOrder?.id ?? null}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>
          <OrderDetailPanel
            detailOrder={detailOrder}
            isLoading={isDetailLoading}
            onClose={() => {
              setSelectedOrder(null);
              setDetailOrder(null);
            }}
            selectedOrder={selectedOrder}
          />
        </div>
      </div>
    </div>
  );
}
