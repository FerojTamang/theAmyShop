import { EllipsisVertical, Search, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

const customers = [
  { name: "Sarah Johnson", email: "sarah.j@example.test", orders: 8, spent: "$342.50", status: "ACTIVE", segment: "VIP" },
  { name: "Emily Rose", email: "emily.r@example.test", orders: 5, spent: "$189.90", status: "ACTIVE", segment: "Loyal" },
  { name: "Jessica Miller", email: "jessica.m@example.test", orders: 12, spent: "$556.80", status: "ACTIVE", segment: "VIP" },
  { name: "Amanda Lee", email: "amanda.l@example.test", orders: 3, spent: "$98.00", status: "SUSPENDED", segment: "New" },
];

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const summaryCards: Array<[string, string, typeof UsersRound]> = [
  ["Total customers", "3,892", UsersRound],
  ["Active accounts", "3,744", ShieldCheck],
  ["Reward members", "2,180", Sparkles],
];

export function AdminCustomersPage() {
  return (
    <section className="grid gap-7">
      <div className="rounded-[2rem] border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF0DA] p-7 shadow-sm shadow-pink-100">
        <Badge tone="rose">Admin customers</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-[#1F1720]" style={serifStyle}>
          Customers
        </h1>
        <p className="mt-3 max-w-2xl text-[#6F6570]">
          Search customers, review safe summaries, and prepare status updates using the admin customers API.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {summaryCards.map(([label, value, Icon]) => {
          return (
            <Card className="bg-white/90" key={label}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#6F6570]">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-[#1F1720]">{value}</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white/90">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4 lg:w-96">
            <Search className="h-4 w-4 text-[#9D8F98]" />
            <input className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Search customers..." />
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl border border-[#F7D9E2] px-4 py-3 text-sm font-bold text-[#6F6570]">Status</button>
            <button className="rounded-xl bg-[#EC4C84] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200">Export</button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F7D9E2]">
          <div className="grid min-w-[44rem] grid-cols-[1.5fr_1.7fr_0.6fr_0.9fr_0.8fr_0.9fr_3rem] bg-[#FFF9FA] px-4 py-3 text-xs font-bold text-[#6F6570]">
            <span>Customer</span>
            <span>Email</span>
            <span>Orders</span>
            <span>Total spent</span>
            <span>Segment</span>
            <span>Status</span>
            <span></span>
          </div>
          {customers.map((customer) => (
            <div className="grid min-w-[44rem] grid-cols-[1.5fr_1.7fr_0.6fr_0.9fr_0.8fr_0.9fr_3rem] items-center border-t border-[#F7D9E2] px-4 py-4 text-sm" key={customer.email}>
              <span className="flex items-center gap-3 font-bold text-[#1F1720]">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FDECEF] text-xs text-[#EC4C84]">{customer.name.charAt(0)}</span>
                {customer.name}
              </span>
              <span className="text-[#6F6570]">{customer.email}</span>
              <span>{customer.orders}</span>
              <span className="font-semibold">{customer.spent}</span>
              <Badge tone={customer.segment === "VIP" ? "rose" : "amber"}>{customer.segment}</Badge>
              <Badge tone={customer.status === "ACTIVE" ? "green" : "stone"}>{customer.status}</Badge>
              <EllipsisVertical className="h-4 w-4 text-[#6F6570]" />
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
