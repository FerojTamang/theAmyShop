import { Gift, PackageCheck, Search, Truck } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

const orders = [
  { id: "AMY-1048", date: "May 12, 2026", status: "Processing", total: "$62.81", items: "3 gifts" },
  { id: "AMY-1032", date: "May 4, 2026", status: "Delivered", total: "$48.00", items: "1 gift box" },
  { id: "AMY-1019", date: "Apr 26, 2026", status: "Delivered", total: "$36.00", items: "1 keepsake" },
];

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
};

export function OrdersPage() {
  return (
    <section className="grid gap-7">
      <div className="rounded-[2rem] border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF0DA] p-7 shadow-sm shadow-pink-100">
        <Badge tone="rose">Order history</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-[#1F1720]" style={serifStyle}>
          My orders
        </h1>
        <p className="mt-3 text-[#6F6570]">
          Track handmade gifts, payment status, delivery progress, and gift notes from one calm view.
        </p>
      </div>

      <Card className="bg-white/90">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4 sm:w-80">
            <Search className="h-4 w-4 text-[#9D8F98]" />
            <input className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Search orders..." />
          </div>
          <button className="rounded-xl border border-[#F7D9E2] px-4 py-3 text-sm font-bold text-[#EC4C84]">
            View payment history
          </button>
        </div>

        <div className="grid gap-4">
          {orders.map((order) => (
            <div className="grid gap-4 rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-5 md:grid-cols-[1fr_auto_auto]" key={order.id}>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FDECEF] text-[#EC4C84]">
                  <PackageCheck className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-bold text-[#1F1720]">Order #{order.id}</h2>
                  <p className="mt-1 text-sm text-[#6F6570]">{order.date} · {order.items}</p>
                </div>
              </div>
              <Badge tone={order.status === "Delivered" ? "green" : "amber"}>{order.status}</Badge>
              <div className="text-left md:text-right">
                <p className="font-bold text-[#1F1720]">{order.total}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-[#6F6570]">
                  {order.status === "Delivered" ? <Gift className="h-4 w-4 text-[#EC4C84]" /> : <Truck className="h-4 w-4 text-[#EC4C84]" />}
                  {order.status === "Delivered" ? "Gift delivered" : "Being prepared"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
