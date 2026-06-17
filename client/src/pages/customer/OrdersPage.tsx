import { useEffect, useMemo, useState } from "react";
import { Gift, PackageCheck, Search, Truck } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { normalizeApiError } from "../../lib/apiError";
import { orderApi, type CustomerOrder } from "../../services/orderApi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
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

const itemCount = (order: CustomerOrder) => (
  order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
);

const statusTone = (status: string): "green" | "amber" | "stone" => {
  if (status === "DELIVERED" || status === "PAID") return "green";
  if (status === "CANCELLED" || status === "FAILED" || status === "REFUNDED") return "stone";
  return "amber";
};

function StatePanel({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Card className="bg-[#FFF9FA] text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
        <Gift className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-[#1F1720]" style={serifStyle}>{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6F6570]">{description}</p>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4 text-sm">
      <span className="text-[#6F6570]">{label}</span>
      <span className="font-semibold text-[#1F1720]">{value}</span>
    </p>
  );
}

function OrderDetail({
  isLoading,
  order,
}: {
  isLoading: boolean;
  order: CustomerOrder;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-[#F7D9E2] bg-white p-5">
      {isLoading ? (
        <p className="text-sm font-semibold text-[#6F6570]">Loading order details...</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
          <div>
            <h3 className="font-bold text-[#1F1720]">Ordered items</h3>
            <div className="mt-3 grid gap-3">
              {(order.items ?? []).map((item) => (
                <div className="grid gap-2 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] p-4 sm:grid-cols-[1fr_auto]" key={item.id}>
                  <div>
                    <p className="font-bold text-[#1F1720]">{item.productNameSnapshot}</p>
                    <p className="mt-1 text-sm text-[#6F6570]">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-[#1F1720]">{formatCurrency(item.priceSnapshot)}</p>
                    <p className="text-xs text-[#6F6570]">each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid content-start gap-3">
            <h3 className="font-bold text-[#1F1720]">Order summary</h3>
            <DetailRow label="Subtotal" value={formatCurrency(order.subtotal)} />
            <DetailRow label="Shipping" value={formatCurrency(order.shippingFee)} />
            <DetailRow label="Gift wrap" value={formatCurrency(order.giftWrapFee)} />
            <DetailRow label="Discount" value={`-${formatCurrency(order.couponDiscount)}`} />
            <DetailRow label="Total" value={formatCurrency(order.totalAmount)} />
            {order.address ? (
              <div className="mt-3 rounded-xl bg-[#FFF5F7] p-4 text-sm leading-6 text-[#6F6570]">
                <p className="font-bold text-[#1F1720]">{order.address.fullName}</p>
                <p>{order.address.streetAddress}</p>
                <p>{order.address.city}, {order.address.district}</p>
                <p>{order.address.province}</p>
                <p>{order.address.phone}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [detailOrders, setDetailOrders] = useState<Record<string, CustomerOrder>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => (
      order.orderNumber.toLowerCase().includes(query) ||
      order.orderStatus.toLowerCase().includes(query) ||
      order.paymentStatus.toLowerCase().includes(query)
    ));
  }, [orders, search]);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await orderApi.listMine({ page: 1, limit: 50 });
        setOrders(result.orders);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, []);

  const handleToggleDetail = async (order: CustomerOrder) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);

    if (detailOrders[order.id]) {
      return;
    }

    try {
      setLoadingDetailId(order.id);
      setError(null);
      const detailOrder = await orderApi.getMine(order.id);
      setDetailOrders((current) => ({ ...current, [order.id]: detailOrder }));
    } catch (detailError) {
      setError(getApiErrorMessage(detailError));
    } finally {
      setLoadingDetailId(null);
    }
  };

  return (
    <section className="grid gap-7">
      <div className="rounded-[2rem] border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF0DA] p-7 shadow-sm shadow-pink-100">
        <Badge tone="rose">Order history</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-[#1F1720]" style={serifStyle}>
          My orders
        </h1>
        <p className="mt-3 text-[#6F6570]">
          Track handmade gifts, payment status, delivery progress, and address details from real checkout orders.
        </p>
      </div>

      <Card className="bg-white/90">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4 sm:w-80">
            <Search className="h-4 w-4 text-[#9D8F98]" />
            <input
              className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders..."
              value={search}
            />
          </div>
          <button className="cursor-not-allowed rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-4 py-3 text-sm font-bold text-[#C8A7B1]" disabled type="button">
            Payment history Soon
          </button>
        </div>

        {error ? (
          <p className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <StatePanel description="Loading your real order history from the backend." title="Loading orders" />
        ) : orders.length === 0 ? (
          <StatePanel description="Checkout with Cash on Delivery to see your first real order here." title="No orders yet" />
        ) : filteredOrders.length === 0 ? (
          <StatePanel description="No order matches your search." title="No matching orders" />
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => {
              const detailOrder = detailOrders[order.id] ?? order;
              const count = itemCount(order);

              return (
                <div className="rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-5" key={order.id}>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                    <div className="flex items-start gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FDECEF] text-[#EC4C84]">
                        <PackageCheck className="h-6 w-6" />
                      </span>
                      <div>
                        <h2 className="font-bold text-[#1F1720]">Order #{order.orderNumber}</h2>
                        <p className="mt-1 text-sm text-[#6F6570]">
                          {formatDate(order.createdAt)} · {count} {count === 1 ? "item" : "items"}
                        </p>
                        {order.address ? (
                          <p className="mt-1 text-xs text-[#9D8F98]">
                            {order.address.city}, {order.address.district}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      <Badge tone={statusTone(order.orderStatus)}>{order.orderStatus}</Badge>
                      <Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-bold text-[#1F1720]">{formatCurrency(order.totalAmount)}</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm text-[#6F6570]">
                        {order.orderStatus === "DELIVERED" ? <Gift className="h-4 w-4 text-[#EC4C84]" /> : <Truck className="h-4 w-4 text-[#EC4C84]" />}
                        {order.paymentMethod}
                      </p>
                      <button
                        className="mt-3 rounded-xl border border-[#F7D9E2] bg-white px-4 py-2 text-sm font-bold text-[#EC4C84]"
                        onClick={() => void handleToggleDetail(order)}
                        type="button"
                      >
                        {expandedOrderId === order.id ? "Hide details" : "View details"}
                      </button>
                    </div>
                  </div>
                  {expandedOrderId === order.id ? (
                    <OrderDetail
                      isLoading={loadingDetailId === order.id}
                      order={detailOrder}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}
