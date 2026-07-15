import { useEffect, useState, type ReactNode } from "react";
import {
  ClipboardList,
  CreditCard,
  Gift,
  Heart,
  ShoppingBag,
  TrendingUp,
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

const allowedStatusTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["READY_TO_SHIP", "CANCELLED"],
  READY_TO_SHIP: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

const getAllowedNextStatuses = (status: string): readonly OrderStatus[] =>
  allowedStatusTransitions[status as OrderStatus] ?? [];

const getSelectableStatuses = (status: string): OrderStatus[] => [
  status as OrderStatus,
  ...getAllowedNextStatuses(status),
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

function Badge({ displayLabel, label }: { displayLabel?: string; label: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[label] ?? "bg-[#FDECEF] text-[#EC4C84] ring-[#F7D9E2]"}`}>
      {displayLabel ?? displayStatus(label)}
    </span>
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
    <div className="rounded-[1.5rem] border border-white/90 bg-gradient-to-br from-white via-white to-[#FFF5F7] p-5 shadow-[0_14px_35px_rgba(115,72,86,0.08)] ring-1 ring-[#F7D9E2]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#6F6570]">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#1F1720]">{value}</p>
          <p className="mt-1 text-xs font-semibold text-[#9D8F98]">Current view</p>
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
    <aside className="border-t border-[#F7D9E2] bg-gradient-to-b from-[#FFF9FA] to-[#FFF4E8] px-5 py-7 shadow-[0_-10px_30px_rgba(115,72,86,0.05)] sm:px-6 2xl:w-[25rem] 2xl:shrink-0 2xl:border-l 2xl:border-t-0 2xl:shadow-[-12px_0_35px_rgba(115,72,86,0.06)]">
      {order ? (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                Order #{order.orderNumber}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge label={order.orderStatus} />
                <Badge displayLabel={getDisplayPaymentStatusLabel(order)} label={getDisplayPaymentStatus(order)} />
              </div>
              <p className="mt-3 text-sm text-[#6F6570]">{formatDate(order.createdAt)}</p>
            </div>
            <button aria-label="Close order details" className="grid h-10 w-10 place-items-center rounded-xl border border-[#F7D9E2] bg-white text-[#6F6570] transition hover:text-[#EC4C84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84]" onClick={onClose} type="button">
              <X className="h-5 w-5 text-[#6F6570]" />
            </button>
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
      ) : null}
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
    <div className="overflow-x-auto rounded-[1.5rem] border border-[#F7D9E2] bg-white shadow-[0_16px_40px_rgba(115,72,86,0.08)]">
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
              <span className="mt-1 inline-flex">
                <Badge displayLabel={getDisplayPaymentStatusLabel(order)} label={getDisplayPaymentStatus(order)} />
              </span>
            </span>
            <span className="font-semibold text-[#1F1720]">{formatCurrency(order.totalAmount)}</span>
            <span className="font-semibold text-[#6F6570]">{getItemCount(order)}</span>
            <span className="text-xs text-[#6F6570]">{order.address ? `${order.address.city}, ${order.address.district}` : "Not provided"}</span>
            <span onClick={(event) => event.stopPropagation()}>
              <select
                className="h-10 w-full rounded-xl border border-[#F7D9E2] bg-white px-3 text-xs font-bold text-[#6F6570] outline-none"
                disabled={
                  isUpdating === order.id ||
                  getAllowedNextStatuses(order.orderStatus).length === 0
                }
                onChange={(event) => onStatusChange(order, event.target.value as OrderStatus)}
                value={order.orderStatus}
              >
                {getSelectableStatuses(order.orderStatus).map((status) => (
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
    <div className="min-w-0 text-[#1F1720]">
      <div className="min-w-0 flex-1">
        <div className={selectedOrder ? "grid 2xl:grid-cols-[minmax(0,1fr)_25rem]" : "grid"}>
          <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[100rem]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-4xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                    Orders <Heart className="inline h-5 w-5 text-[#EC4C84]" />
                  </h1>
                  <p className="mt-1 text-sm text-[#6F6570]">Manage and track customer orders</p>
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

              <div className="mt-7 flex flex-wrap gap-2 rounded-[1.5rem] border border-white/90 bg-white/70 p-3 shadow-sm shadow-pink-100 ring-1 ring-[#F7D9E2]">
                {tabs.map(([label, status]) => (
                  <button
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] ${
                      activeStatus === status ? "bg-[#EC4C84] text-white shadow-md shadow-pink-200" : "bg-white text-[#6F6570] hover:bg-[#FFF5F7] hover:text-[#EC4C84]"
                    }`}
                    key={status}
                    onClick={() => setActiveStatus(status)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {!selectedOrder && !isLoading && filteredOrders.length > 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-[#F7D9E2] bg-white/60 px-4 py-3 text-sm font-medium text-[#6F6570]">
                  Select an order row to view its customer, items, delivery, and status details.
                </p>
              ) : null}

              <div className="mt-4">
                  {isLoading ? (
                    <StatePanel description="Loading customer orders." title="Loading orders" />
                  ) : filteredOrders.length === 0 ? (
                    <StatePanel description="No orders match this view." title="No orders found" />
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
          </main>
          {selectedOrder ? (
            <OrderDetailPanel
              detailOrder={detailOrder}
              isLoading={isDetailLoading}
              onClose={() => {
                setSelectedOrder(null);
                setDetailOrder(null);
              }}
              selectedOrder={selectedOrder}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
