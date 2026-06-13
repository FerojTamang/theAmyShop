import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Eye,
  Gift,
  Heart,
  Home,
  Mail,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tags,
  UsersRound,
} from "lucide-react";

type OrderStatus = "Completed" | "Processing" | "Unfulfilled";
type FulfillmentStatus = "Fulfilled" | "Paid" | "Unfulfilled";

type RecentOrder = {
  id: string;
  customer: string;
  date: string;
  total: string;
  payment: "Visa" | "Mastercard" | "Apple Pay";
  fulfillment: FulfillmentStatus;
  status: OrderStatus;
};

const navItems = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Orders", icon: ClipboardList, count: "12" },
  { label: "Products", icon: ShoppingBag },
  { label: "Collections", icon: Package },
  { label: "Customers", icon: UsersRound },
  { label: "Analytics", icon: BarChart3 },
  { label: "Marketing", icon: Mail },
  { label: "Discounts", icon: Tags },
  { label: "Reviews", icon: Star },
  { label: "Content", icon: ClipboardList },
  { label: "Settings", icon: Settings },
];

const salesChannels = [
  { label: "Online Store", icon: ShoppingBag, iconClass: "text-[#6F6570]", trailing: Eye },
  { label: "Instagram Shop", icon: Gift, iconClass: "text-[#EC4C84]" },
  { label: "Facebook Shop", icon: UsersRound, iconClass: "text-blue-500" },
  { label: "Pinterest Shop", icon: Heart, iconClass: "text-[#EC4C84]" },
];

const kpis = [
  {
    label: "Total Revenue",
    value: "$24,820.50",
    growth: "18.6%",
    compare: "vs Apr 28 - May 4, 2025",
    icon: DollarSign,
  },
  {
    label: "Total Orders",
    value: "432",
    growth: "12.4%",
    compare: "vs Apr 28 - May 4, 2025",
    icon: ShoppingBag,
  },
  {
    label: "Total Customers",
    value: "368",
    growth: "9.8%",
    compare: "vs Apr 28 - May 4, 2025",
    icon: UsersRound,
  },
  {
    label: "Avg. Order Value",
    value: "$57.45",
    growth: "5.3%",
    compare: "vs Apr 28 - May 4, 2025",
    icon: ShoppingCart,
  },
];

const recentOrders: RecentOrder[] = [
  {
    id: "#AMY1032",
    customer: "Sarah Johnson",
    date: "May 11, 2025",
    total: "$68.90",
    payment: "Visa",
    fulfillment: "Fulfilled",
    status: "Completed",
  },
  {
    id: "#AMY1031",
    customer: "Emily Davis",
    date: "May 11, 2025",
    total: "$42.50",
    payment: "Mastercard",
    fulfillment: "Fulfilled",
    status: "Completed",
  },
  {
    id: "#AMY1030",
    customer: "Jessica Miller",
    date: "May 10, 2025",
    total: "$87.00",
    payment: "Apple Pay",
    fulfillment: "Paid",
    status: "Processing",
  },
  {
    id: "#AMY1029",
    customer: "Olivia Brown",
    date: "May 10, 2025",
    total: "$35.20",
    payment: "Visa",
    fulfillment: "Unfulfilled",
    status: "Unfulfilled",
  },
  {
    id: "#AMY1028",
    customer: "Sophia Wilson",
    date: "May 9, 2025",
    total: "$64.40",
    payment: "Mastercard",
    fulfillment: "Fulfilled",
    status: "Completed",
  },
];

const lowStockProducts = [
  { name: "Scented Soy Candle - Amazing", category: "Candles", stock: "5 left", art: "candle" },
  { name: "Personalized Necklace - Gold Disc", category: "Personalized Keepsakes", stock: "3 left", art: "necklace" },
  { name: "Mug - Mama", category: "Mugs", stock: "4 left", art: "mug" },
  { name: "Relax & Unwind Gift Box", category: "Gift Boxes", stock: "2 left", art: "box" },
  { name: "Dried Flower Bouquet", category: "Handmade Decor", stock: "6 left", art: "flowers" },
];

const quickActions = [
  { label: "Add new product", icon: Gift },
  { label: "Create discount", icon: Tags },
  { label: "Add collection", icon: Package },
  { label: "Send marketing email", icon: Mail },
  { label: "View sales analytics", icon: BarChart3 },
  { label: "Manage reviews", icon: Heart },
];

const statusClasses: Record<OrderStatus | FulfillmentStatus, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Processing: "bg-orange-100 text-orange-700",
  Unfulfilled: "bg-pink-100 text-pink-700",
  Fulfilled: "bg-emerald-100 text-emerald-700",
  Paid: "bg-orange-100 text-orange-700",
};

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-[21rem] shrink-0 border-r border-[#F7D9E2] bg-[#FFF5F7] px-6 py-7 xl:block">
      <div className="mb-9 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full text-[#EC4C84]">
          <Gift className="h-9 w-9" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
            The AMY Shop
          </h1>
          <p className="text-sm font-medium text-[#6F6570]">Admin Dashboard</p>
        </div>
      </div>

      <nav className="grid gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className={`flex items-center justify-between rounded-full px-5 py-3 text-sm font-bold ${
                item.active ? "bg-[#FDECEF] text-[#EC4C84]" : "text-[#5E5962] hover:bg-white/75"
              }`}
              key={item.label}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {item.label}
              </span>
              {item.count ? (
                <span className="rounded-full bg-[#FDECEF] px-3 py-1 text-xs text-[#EC4C84]">
                  {item.count}
                </span>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-[#F7D9E2] pt-6">
        <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6F6570]">
          Sales Channels
        </p>
        <div className="grid gap-2">
          {salesChannels.map((channel) => {
            const Icon = channel.icon;
            const Trailing = channel.trailing;

            return (
              <div
                className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold text-[#5E5962] hover:bg-white/75"
                key={channel.label}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${channel.iconClass}`} />
                  {channel.label}
                </span>
                {Trailing ? <Trailing className="h-4 w-4 text-[#6F6570]" /> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
        <div className="h-32 bg-[radial-gradient(circle_at_25%_25%,rgba(236,76,132,0.28),transparent_6rem),linear-gradient(135deg,#FDECEF,#FFF5F7_48%,#FFF0DA)]" />
        <div className="p-5">
          <h2 className="text-lg font-bold text-[#1F1720]">Grow your store</h2>
          <p className="mt-3 text-sm leading-6 text-[#6F6570]">
            Explore powerful tools and resources to grow your business.
          </p>
          <button className="mt-5 rounded-full bg-[#EC4C84] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200">
            Explore now
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#F7D9E2] bg-white/95 px-4 py-5 backdrop-blur sm:px-8">
      <div className="flex items-center justify-end gap-6">
        <Search className="h-6 w-6 text-[#1F1720]" />
        <button className="relative text-[#1F1720]">
          <Bell className="h-6 w-6" />
          <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#EC4C84] text-[10px] font-bold text-white">
            5
          </span>
        </button>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">
            AJ
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-[#1F1720]">Amy Johnson</p>
            <p className="text-xs text-[#6F6570]">Administrator</p>
          </div>
          <ChevronDown className="h-4 w-4 text-[#6F6570]" />
        </div>
      </div>
    </header>
  );
}

function StatCard({ stat }: { stat: (typeof kpis)[number] }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-[#F7D9E2] bg-white p-6 shadow-sm shadow-pink-100">
      <div className="flex items-center gap-5">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
          <Icon className="h-8 w-8" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#6F6570]">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-[#1F1720]">{stat.value}</p>
          <p className="mt-3 text-sm font-bold text-[#39B86D]">↑ {stat.growth}</p>
          <p className="mt-1 text-xs text-[#6F6570]">{stat.compare}</p>
        </div>
      </div>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#F7D9E2] bg-white p-6 shadow-sm shadow-pink-100 ${className}`}>
      {children}
    </section>
  );
}

function SalesOverviewCard() {
  const points = "20,145 138,105 222,70 302,118 386,78 476,70 555,72";

  return (
    <Card className="lg:col-span-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
            Sales overview
          </h2>
          <div className="mt-6 grid grid-cols-3 gap-10">
            <Metric label="Revenue" value="$24,820.50" active />
            <Metric label="Orders" value="432" />
            <Metric label="Avg. Order Value" value="$57.45" />
          </div>
        </div>
        <button className="flex h-11 items-center gap-3 rounded-xl border border-[#F7D9E2] px-5 text-sm font-bold text-[#5E5962]">
          Last 7 days <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="relative h-64">
        <div className="absolute inset-0 grid grid-rows-6 text-xs text-[#6F6570]">
          {["$30K", "$25K", "$20K", "$15K", "$10K", "$5K"].map((label) => (
            <div className="flex items-start gap-3 border-t border-[#F7D9E2]/70" key={label}>
              <span className="w-10 pt-1">{label}</span>
            </div>
          ))}
        </div>
        <svg className="absolute bottom-8 left-12 right-0 top-4 h-[13rem] w-[calc(100%-3rem)] overflow-visible" viewBox="0 0 580 180">
          <defs>
            <linearGradient id="pinkFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#EC4C84" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#EC4C84" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M ${points} L 555 180 L 20 180 Z`} fill="url(#pinkFill)" />
          <polyline fill="none" points={points} stroke="#EC4C84" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          {points.split(" ").map((pair) => {
            const [x, y] = pair.split(",");
            return <circle cx={x} cy={y} fill="#EC4C84" key={pair} r="4" />;
          })}
        </svg>
        <div className="absolute bottom-0 left-14 right-2 grid grid-cols-7 text-xs text-[#6F6570]">
          {["May 5", "May 6", "May 7", "May 8", "May 9", "May 10", "May 11"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}

function Metric({ active = false, label, value }: { active?: boolean; label: string; value: string }) {
  return (
    <div>
      <p className={`text-sm font-bold ${active ? "text-[#EC4C84]" : "text-[#6F6570]"}`}>{label}</p>
      <p className="mt-2 text-xl font-bold text-[#1F1720]">{value}</p>
    </div>
  );
}

function StatusBadge({ label }: { label: OrderStatus | FulfillmentStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[label]}`}>
      {label}
    </span>
  );
}

function RecentOrdersCard() {
  return (
    <Card className="lg:col-span-5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
          Recent orders
        </h2>
        <button className="text-sm font-bold text-[#EC4C84]">View all orders</button>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[42rem] grid-cols-[1fr_1.3fr_1fr_0.8fr_0.9fr_1fr_1fr] border-b border-[#F7D9E2] py-3 text-xs font-bold text-[#6F6570]">
          <span>Order</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Fulfillment</span>
          <span>Status</span>
        </div>
        {recentOrders.map((order) => (
          <div className="grid min-w-[42rem] grid-cols-[1fr_1.3fr_1fr_0.8fr_0.9fr_1fr_1fr] items-center border-b border-[#F7D9E2]/70 py-4 text-sm last:border-b-0" key={order.id}>
            <span className="font-bold text-[#EC4C84]">{order.id}</span>
            <span className="font-semibold text-[#1F1720]">{order.customer}</span>
            <span className="text-[#6F6570]">{order.date}</span>
            <span className="font-semibold text-[#1F1720]">{order.total}</span>
            <span className="font-semibold text-[#5E5962]">{order.payment}</span>
            <span><StatusBadge label={order.fulfillment} /></span>
            <span><StatusBadge label={order.status} /></span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-[#6F6570]">
        <span>Showing 1 to 5 of 12 orders</span>
        <button className="rounded-xl border border-[#F7D9E2] px-6 py-3 font-bold text-[#1F1720]">
          View all orders
        </button>
      </div>
    </Card>
  );
}

function ProductThumb({ type }: { type: string }) {
  const label = type === "mug" ? "mama" : type === "necklace" ? "A" : type === "box" ? "Gift" : "Amy";

  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF0DA] text-xs font-bold text-[#EC4C84] shadow-sm">
      {label}
    </span>
  );
}

function LowStockProductsCard() {
  return (
    <Card className="lg:col-span-4">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
          Low stock products
        </h2>
        <button className="text-sm font-bold text-[#EC4C84]">View all products</button>
      </div>
      <div className="grid gap-4">
        {lowStockProducts.map((product) => (
          <div className="flex items-center gap-4" key={product.name}>
            <ProductThumb type={product.art} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#1F1720]">{product.name}</p>
              <p className="text-sm text-[#6F6570]">{product.category}</p>
            </div>
            <span className="font-bold text-[#EC4C84]">{product.stock}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReviewSummaryCard() {
  const bars = [
    ["5 stars", "1,090", "88%"],
    ["4 stars", "98", "28%"],
    ["3 stars", "28", "14%"],
    ["2 stars", "9", "6%"],
    ["1 star", "5", "4%"],
  ];

  return (
    <Card className="lg:col-span-4">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
          Review summary
        </h2>
        <button className="text-sm font-bold text-[#EC4C84]">View all reviews</button>
      </div>
      <div className="grid gap-6 sm:grid-cols-[7rem_1fr]">
        <div>
          <p className="text-5xl font-bold text-[#1F1720]">4.9</p>
          <Stars />
          <p className="mt-3 text-xs text-[#6F6570]">Based on 1,230 reviews</p>
        </div>
        <div className="grid gap-2">
          {bars.map(([label, value, width]) => (
            <div className="grid grid-cols-[4rem_1fr_3rem] items-center gap-3 text-xs text-[#6F6570]" key={label}>
              <span>{label}</span>
              <span className="h-2 rounded-full bg-[#FDECEF]">
                <span className="block h-2 rounded-full bg-[#EC4C84]" style={{ width }} />
              </span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">SJ</span>
            <div>
              <p className="font-bold text-[#1F1720]">Sarah J.</p>
              <p className="text-xs text-[#39B86D]">Verified Buyer</p>
            </div>
          </div>
          <Stars small />
        </div>
        <p className="mt-4 text-sm leading-6 text-[#5E5962]">
          Absolutely love my personalized gift! The quality is amazing and
          shipping was super fast.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <ProductThumb type="necklace" />
          <span className="text-sm text-[#6F6570]">Personalized Necklace - Gold Disc</span>
        </div>
      </div>
    </Card>
  );
}

function Stars({ small = false }: { small?: boolean }) {
  return (
    <span className="mt-3 flex text-[#F2B84B]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star className={`${small ? "h-4 w-4" : "h-5 w-5"} fill-current`} key={index} />
      ))}
    </span>
  );
}

function QuickActionsCard() {
  return (
    <Card className="lg:col-span-4">
      <h2 className="mb-5 text-xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
        Quick actions
      </h2>
      <div className="grid gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              className="flex items-center justify-between rounded-xl border border-[#F7D9E2] px-5 py-4 text-sm font-semibold text-[#5E5962] hover:bg-[#FFF5F7]"
              key={action.label}
            >
              <span className="flex items-center gap-4">
                <Icon className="h-5 w-5 text-[#EC4C84]" />
                {action.label}
              </span>
              <ChevronRight className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-white text-[#1F1720] xl:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopHeader />
        <main className="bg-white px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-4xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                  Welcome back, Amy!
                </h1>
                <p className="mt-2 text-lg text-[#5E5962]">
                  Here's what's happening with your store today.
                </p>
              </div>
              <button className="flex h-12 w-fit items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-5 text-sm font-bold text-[#5E5962]">
                <CalendarDays className="h-5 w-5" />
                May 5 - May 11, 2025
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-12">
              <SalesOverviewCard />
              <RecentOrdersCard />
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-12">
              <LowStockProductsCard />
              <ReviewSummaryCard />
              <QuickActionsCard />
            </div>
          </div>
        </main>
        <footer className="border-t border-[#F7D9E2] px-4 py-7 text-sm text-[#6F6570] sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2025 The AMY Shop. All rights reserved.</span>
            <span>Made with love by The AMY Shop</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
