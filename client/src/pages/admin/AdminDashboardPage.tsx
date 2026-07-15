import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Gift,
  Package,
  ShoppingBag,
  Star,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { normalizeApiError } from "../../lib/apiError";
import {
  adminApi,
  type AdminDashboardOrder,
  type AdminDashboardSummary,
  type AdminLowStockProduct,
  type AdminReviewSummary,
  type AdminSalesPoint,
} from "../../services/adminApi";
import { formatCurrency } from "../../utils/formatCurrency";

type DashboardData = {
  summary: AdminDashboardSummary;
  orders: AdminDashboardOrder[];
  lowStock: AdminLowStockProduct[];
  sales: AdminSalesPoint[];
  reviews: AdminReviewSummary;
};

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100 ${className}`}>
      {children}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#6F6570]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#1F1720]">{value}</p>
          <p className="mt-1 text-xs text-[#8B7D86]">{detail}</p>
        </div>
      </div>
    </Card>
  );
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NP", { dateStyle: "medium" }).format(new Date(value));

const labelStatus = (value: string) => value.toLowerCase().replaceAll("_", " ");

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const [summaryResult, ordersResult, stockResult, salesResult, reviewsResult] =
          await Promise.all([
            adminApi.dashboard.summary(),
            adminApi.dashboard.recentOrders(5),
            adminApi.dashboard.lowStock(5),
            adminApi.dashboard.salesOverview(7),
            adminApi.dashboard.reviewSummary(),
          ]);

        if (active) {
          setData({
            summary: summaryResult.summary,
            orders: ordersResult.orders,
            lowStock: stockResult.products,
            sales: salesResult.sales,
            reviews: reviewsResult,
          });
        }
      } catch (loadError) {
        if (active) setError(normalizeApiError(loadError).message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const maxSales = useMemo(
    () => Math.max(1, ...(data?.sales.map((point) => point.revenue) ?? [])),
    [data?.sales],
  );

  const pendingReviews =
    data?.reviews.statuses.find((item) => item.status === "PENDING")?.count ?? 0;

  return (
    <section className="px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
                Dashboard
              </h1>
              <p className="mt-2 text-[#6F6570]">Live store data.</p>
            </div>

            {loading ? (
              <Card className="mt-8 text-center text-[#6F6570]">Loading dashboard data...</Card>
            ) : error ? (
              <Card className="mt-8 border-red-200 bg-red-50 text-red-700">{error}</Card>
            ) : data ? (
              <>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={WalletCards} label="Paid revenue" value={formatCurrency(data.summary.totalRevenue)} detail={`${formatCurrency(data.summary.todayRevenue)} today`} />
                  <StatCard icon={ShoppingBag} label="Total orders" value={String(data.summary.totalOrders)} detail={`${data.summary.todayOrders} created today`} />
                  <StatCard icon={UsersRound} label="Customers" value={String(data.summary.totalCustomers)} detail="Registered customer accounts" />
                  <StatCard icon={Gift} label="Products" value={String(data.summary.totalProducts)} detail={`${data.summary.lowStockProducts} currently low in stock`} />
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                  <Card>
                    <p className="text-sm font-semibold text-[#6F6570]">Pending orders</p>
                    <p className="mt-2 text-3xl font-bold">{data.summary.pendingOrders}</p>
                    <Link className="mt-4 inline-flex text-sm font-bold text-[#EC4C84]" to="/admin/orders">Manage orders</Link>
                  </Card>
                  <Card>
                    <p className="text-sm font-semibold text-[#6F6570]">Pending reviews</p>
                    <p className="mt-2 text-3xl font-bold">{pendingReviews}</p>
                    <Link className="mt-4 inline-flex text-sm font-bold text-[#EC4C84]" to="/admin/reviews">Moderate reviews</Link>
                  </Card>
                  <Card>
                    <p className="text-sm font-semibold text-[#6F6570]">Low-stock products</p>
                    <p className="mt-2 text-3xl font-bold">{data.summary.lowStockProducts}</p>
                    <Link className="mt-4 inline-flex text-sm font-bold text-[#EC4C84]" to="/admin/products">Manage products</Link>
                  </Card>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                  <Card>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>Recent orders</h2>
                      <Link className="text-sm font-bold text-[#EC4C84]" to="/admin/orders">View all</Link>
                    </div>
                    {data.orders.length === 0 ? (
                      <p className="mt-6 rounded-xl bg-[#FFF5F7] p-5 text-sm text-[#6F6570]">No orders have been placed yet.</p>
                    ) : (
                      <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[38rem] text-left text-sm">
                          <thead className="border-b border-[#F7D9E2] text-xs uppercase tracking-wide text-[#6F6570]">
                            <tr><th className="py-3">Order</th><th>Customer</th><th>Status</th><th>Date</th><th className="text-right">Total</th></tr>
                          </thead>
                          <tbody>
                            {data.orders.map((order) => (
                              <tr className="border-b border-[#F7D9E2]/70 last:border-0" key={order.id}>
                                <td className="py-4 font-bold text-[#EC4C84]">{order.orderNumber}</td>
                                <td>{order.user.fullName || order.user.email || order.user.phone || "Customer"}</td>
                                <td className="capitalize">{labelStatus(order.orderStatus)}</td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td className="text-right font-bold">{formatCurrency(order.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>

                  <Card>
                    <h2 className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>Last 7 days paid sales</h2>
                    {data.sales.every((point) => point.orderCount === 0) ? (
                      <p className="mt-6 rounded-xl bg-[#FFF5F7] p-5 text-sm text-[#6F6570]">No paid sales recorded in this period.</p>
                    ) : (
                      <div className="mt-6 grid gap-4">
                        {data.sales.map((point) => (
                          <div key={point.date}>
                            <div className="mb-1 flex justify-between gap-4 text-xs text-[#6F6570]">
                              <span>{formatDate(point.date)}</span>
                              <span>{point.orderCount} order{point.orderCount === 1 ? "" : "s"} · {formatCurrency(point.revenue)}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#FDECEF]">
                              <div className="h-full rounded-full bg-[#EC4C84]" style={{ width: `${Math.max(3, (point.revenue / maxSales) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  <Card>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>Low stock</h2>
                      <Package className="h-5 w-5 text-[#EC4C84]" />
                    </div>
                    {data.lowStock.length === 0 ? (
                      <p className="mt-6 rounded-xl bg-[#FFF5F7] p-5 text-sm text-[#6F6570]">No low-stock products.</p>
                    ) : (
                      <div className="mt-5 grid gap-3">
                        {data.lowStock.map((product) => (
                          <div className="flex items-center gap-4 rounded-xl border border-[#F7D9E2] p-3" key={product.id}>
                            {product.primaryImage?.imageUrl ? (
                              <img alt="" className="h-12 w-12 rounded-lg bg-[#FFF5F7] object-contain" src={product.primaryImage.imageUrl} />
                            ) : (
                              <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#FFF5F7] text-[#EC4C84]"><Gift className="h-5 w-5" /></span>
                            )}
                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{product.name}</p><p className="text-xs text-[#6F6570]">{product.category?.name || "Uncategorized"}</p></div>
                            <span className="text-sm font-bold text-[#EC4C84]">{product.stock} left</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>Review summary</h2>
                      <Star className="h-5 w-5 text-[#EC4C84]" />
                    </div>
                    {data.reviews.reviewCount === 0 ? (
                      <p className="mt-6 rounded-xl bg-[#FFF5F7] p-5 text-sm text-[#6F6570]">No customer reviews yet.</p>
                    ) : (
                      <div className="mt-6">
                        <p className="text-4xl font-bold">{data.reviews.averageRating.toFixed(1)}</p>
                        <p className="mt-1 text-sm text-[#6F6570]">Average across {data.reviews.reviewCount} review{data.reviews.reviewCount === 1 ? "" : "s"}</p>
                        <div className="mt-5 grid gap-2">
                          {data.reviews.statuses.map((item) => (
                            <div className="flex justify-between rounded-lg bg-[#FFF5F7] px-4 py-2 text-sm" key={item.status}>
                              <span className="capitalize">{labelStatus(item.status)}</span><strong>{item.count}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </>
            ) : (
              <Card className="mt-8 flex items-center gap-3 text-[#6F6570]"><AlertTriangle className="h-5 w-5" />Dashboard data is unavailable.</Card>
            )}
          </div>
    </section>
  );
}
