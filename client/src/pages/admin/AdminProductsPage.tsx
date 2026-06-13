import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  Edit3,
  EllipsisVertical,
  Filter,
  Gift,
  Heart,
  Home,
  Menu,
  PackageCheck,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Tags,
  Trash2,
  Upload,
  UsersRound,
  X,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  compareAt?: string;
  discount?: string;
  stock: number;
  stockState: "In Stock" | "Low Stock" | "Out of Stock";
  status: "Active" | "Inactive";
  art: "box" | "candle" | "mug" | "necklace" | "soap" | "decor" | "journal";
};

const products: Product[] = [
  {
    id: "1",
    name: "Relax & Unwind Gift Box",
    sku: "GBOX-001",
    category: "Gift Boxes",
    price: "$48.00",
    compareAt: "$60.00",
    discount: "20% OFF",
    stock: 35,
    stockState: "In Stock",
    status: "Active",
    art: "box",
  },
  {
    id: "2",
    name: "Scented Soy Candle",
    sku: "CANDLE-003",
    category: "Candles",
    price: "$18.00",
    stock: 62,
    stockState: "In Stock",
    status: "Active",
    art: "candle",
  },
  {
    id: "3",
    name: "Mama Ceramic Mug",
    sku: "MUG-002",
    category: "Mugs",
    price: "$24.00",
    stock: 18,
    stockState: "Low Stock",
    status: "Active",
    art: "mug",
  },
  {
    id: "4",
    name: "Personalized Name Necklace",
    sku: "NECK-001",
    category: "Necklaces",
    price: "$36.00",
    compareAt: "$45.00",
    discount: "20% OFF",
    stock: 8,
    stockState: "Low Stock",
    status: "Active",
    art: "necklace",
  },
  {
    id: "5",
    name: "Custom Engraved Heart Soap",
    sku: "SOAP-001",
    category: "Bath & Body",
    price: "$12.00",
    stock: 0,
    stockState: "Out of Stock",
    status: "Inactive",
    art: "soap",
  },
  {
    id: "6",
    name: "Handmade Decor Vase",
    sku: "DECOR-001",
    category: "Decor",
    price: "$28.00",
    stock: 26,
    stockState: "In Stock",
    status: "Active",
    art: "decor",
  },
  {
    id: "7",
    name: "Gratitude Journal",
    sku: "JOURNAL-001",
    category: "Stationery",
    price: "$16.00",
    stock: 41,
    stockState: "In Stock",
    status: "Active",
    art: "journal",
  },
];

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Products", icon: Gift, active: true, open: true },
  { label: "All Products", child: true, active: true },
  { label: "Add New Product", child: true },
  { label: "Categories", child: true },
  { label: "Tags", child: true },
  { label: "Collections", child: true },
  { label: "Orders", icon: ShoppingCart, count: "24" },
  { label: "Customers", icon: UsersRound },
  { label: "Gift Orders", icon: Gift },
  { label: "Reviews", icon: Heart },
  { label: "Marketing", icon: Tags },
  { label: "Discounts", icon: Star },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const tabs = [
  ["All", "128"],
  ["Best Sellers", "16"],
  ["Candles", "18"],
  ["Mugs", "12"],
  ["Gift Boxes", "24"],
  ["Necklaces", "14"],
  ["Decor", "12"],
  ["More", ""],
];

const categoryColors: Record<string, string> = {
  "Gift Boxes": "bg-pink-100 text-pink-700",
  Candles: "bg-orange-100 text-orange-700",
  Mugs: "bg-purple-100 text-purple-700",
  Necklaces: "bg-rose-100 text-rose-700",
  "Bath & Body": "bg-blue-100 text-blue-700",
  Decor: "bg-teal-100 text-teal-700",
  Stationery: "bg-violet-100 text-violet-700",
};

function ProductArt({ type, compact = false }: { type: Product["art"]; compact?: boolean }) {
  const label: Record<Product["art"], string> = {
    box: "Gift Box",
    candle: "Candle",
    mug: "mama",
    necklace: "A",
    soap: "Love",
    decor: "Decor",
    journal: "Notes",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF0DA] ${
        compact ? "h-14 w-14" : "aspect-square w-full"
      }`}
    >
      <div className="absolute -right-5 -top-5 h-14 w-14 rounded-full bg-[#EC4C84]/20 blur-lg" />
      <div className="absolute bottom-2 left-2 right-2 rounded-lg border border-white/80 bg-white/70 p-2 text-center shadow-sm">
        <p className="truncate text-xs font-bold text-[#EC4C84]">{label[type]}</p>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-[21rem] shrink-0 border-r border-[#F7D9E2] bg-[#FFF5F7] px-5 py-6 xl:block">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
            <Gift className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
              The AMY Shop
            </h1>
            <p className="text-sm font-medium text-[#6F6570]">Admin</p>
          </div>
        </div>
        <Menu className="h-5 w-5 text-[#6F6570]" />
      </div>

      <nav className="grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.child) {
            return (
              <div
                className={`ml-12 rounded-xl px-4 py-3 text-sm font-bold ${
                  item.active
                    ? "bg-[#FDECEF] text-[#EC4C84] ring-1 ring-[#F7D9E2]"
                    : "text-[#6F6570] hover:bg-white/70"
                }`}
                key={item.label}
              >
                {item.label}
              </div>
            );
          }

          return (
            <div
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ${
                item.active ? "bg-[#FDECEF] text-[#EC4C84]" : "text-[#5E5962] hover:bg-white/80"
              }`}
              key={item.label}
            >
              <span className="flex items-center gap-3">
                {Icon ? <Icon className="h-5 w-5" /> : null}
                {item.label}
              </span>
              {item.open ? <ChevronDown className="h-4 w-4" /> : null}
              {item.count ? (
                <span className="rounded-full bg-[#EC4C84] px-2 py-0.5 text-xs text-white">{item.count}</span>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="mt-16 rounded-2xl border border-[#F7D9E2] bg-white/72 p-5 text-center shadow-sm shadow-pink-100">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-[#FDECEF] text-[#EC4C84]">
          <Gift className="h-10 w-10" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-[#1F1720]">Make every gift extra special</h2>
        <p className="mt-3 text-sm leading-6 text-[#6F6570]">
          Create memorable experiences with thoughtful gifts.
        </p>
        <button className="mt-5 w-full rounded-xl bg-[#EC4C84] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200">
          View Store
        </button>
      </div>
    </aside>
  );
}

function TopHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#F7D9E2] bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="hidden h-11 w-full max-w-lg items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4 shadow-sm lg:flex">
          <Search className="h-5 w-5 text-[#9D8F98]" />
          <input
            className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]"
            placeholder="Search products, SKU, category..."
          />
          <span className="rounded-lg bg-[#FFF5F7] px-2 py-1 text-xs font-bold text-[#6F6570]">Ctrl K</span>
        </div>
        <div className="ml-auto flex items-center gap-5">
          <Gift className="h-6 w-6 text-[#EC4C84]" />
          <button className="relative text-[#EC4C84]">
            <Bell className="h-6 w-6" />
            <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#EC4C84] text-[10px] font-bold text-white">
              6
            </span>
          </button>
          <div className="flex items-center gap-3 border-l border-[#F7D9E2] pl-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">SJ</span>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#1F1720]">Sarah J.</p>
              <p className="text-xs text-[#6F6570]">Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#6F6570]" />
          </div>
        </div>
      </div>
    </header>
  );
}

function FilterControl({ label }: { label: string }) {
  return (
    <button className="flex h-12 items-center justify-between gap-8 rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm font-semibold text-[#6F6570]">
      {label}
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

function Toggle({ enabled = true }: { enabled?: boolean }) {
  return (
    <span className={`flex h-6 w-11 items-center rounded-full p-1 ${enabled ? "bg-[#EC4C84]" : "bg-[#F7D9E2]"}`}>
      <span className={`h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
    </span>
  );
}

function StockDot({ state }: { state: Product["stockState"] }) {
  const color =
    state === "In Stock" ? "bg-[#39B86D]" : state === "Low Stock" ? "bg-amber-500" : "bg-red-500";

  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}

function ProductTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
      <div className="grid min-w-[58rem] grid-cols-[3rem_2fr_1fr_1fr_1fr_1fr_6rem] border-b border-[#F7D9E2] px-4 py-3 text-xs font-bold text-[#6F6570]">
        <span><input className="h-4 w-4 accent-[#EC4C84]" type="checkbox" /></span>
        <span>Product</span>
        <span>Category</span>
        <span>Price</span>
        <span>Stock</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {products.map((product) => (
        <div
          className="grid min-w-[58rem] grid-cols-[3rem_2fr_1fr_1fr_1fr_1fr_6rem] items-center border-b border-[#F7D9E2]/70 px-4 py-4 text-sm last:border-b-0"
          key={product.id}
        >
          <span><input className="h-4 w-4 accent-[#EC4C84]" type="checkbox" /></span>
          <div className="flex items-center gap-4">
            <ProductArt compact type={product.art} />
            <div>
              <p className="font-bold text-[#1F1720]">{product.name}</p>
              <p className="mt-1 text-xs text-[#6F6570]">SKU: {product.sku}</p>
            </div>
          </div>
          <span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${categoryColors[product.category] ?? "bg-[#FDECEF] text-[#EC4C84]"}`}>
              {product.category}
            </span>
          </span>
          <span>
            <span className="block font-bold text-[#1F1720]">{product.price}</span>
            {product.compareAt ? <span className="block text-xs text-[#9D8F98] line-through">{product.compareAt}</span> : null}
            {product.discount ? <span className="mt-1 inline-flex rounded-md bg-[#FDECEF] px-2 py-0.5 text-[10px] font-bold text-[#EC4C84]">{product.discount}</span> : null}
          </span>
          <span className="flex items-start gap-3">
            <StockDot state={product.stockState} />
            <span>
              <span className="block font-bold text-[#1F1720]">{product.stock}</span>
              <span className="text-xs text-[#6F6570]">{product.stockState}</span>
            </span>
          </span>
          <span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${product.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
              {product.status}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#F7D9E2] text-[#EC4C84] hover:bg-[#FFF5F7]">
              <Edit3 className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#F7D9E2] text-[#EC4C84] hover:bg-[#FFF5F7]">
              <EllipsisVertical className="h-4 w-4" />
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

function AddProductPanel() {
  return (
    <aside className="border-l border-[#F7D9E2] bg-white px-5 py-7 xl:w-[29rem] xl:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1F1720]">Add Product</h2>
        <X className="h-5 w-5 text-[#9D8F98]" />
      </div>

      <FormSection title="Basic Information">
        <Field label="Product Name *" placeholder="e.g., Relax & Unwind Gift Box" />
        <Field label="Category *" placeholder="Select category" select />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Price (USD) *" placeholder="$    0.00" />
          <Field label="Compare at Price (USD)" placeholder="$    0.00" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="SKU *" placeholder="e.g., GBOX-001" />
          <Field label="Stock Quantity *" placeholder="0" />
        </div>
      </FormSection>

      <FormSection title="Stock & Inventory">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Stock Type" placeholder="Physical Product" select />
          <label className="flex items-center justify-between gap-4 pb-3 text-sm font-semibold text-[#6F6570]">
            Track Inventory
            <Toggle />
          </label>
        </div>
      </FormSection>

      <FormSection title="Product Options">
        <OptionRow description="This product can be sent as a gift." label="Supports Gift Packaging" />
        <OptionRow description="Customers can personalize this product." label="Customizable" />
        <Field label="Customization Note (Optional)" placeholder="e.g., Add name, date, or special message" />
      </FormSection>

      <FormSection title="Product Images">
        <p className="mb-3 text-sm font-semibold text-[#6F6570]">Image URLs</p>
        {["https://example.com/image1.jpg", "https://example.com/image2.jpg", "https://example.com/image3.jpg"].map((url, index) => (
          <div className="mb-3 flex items-center gap-2" key={url}>
            <input className="h-10 min-w-0 flex-1 rounded-xl border border-[#F7D9E2] px-3 text-xs outline-none" defaultValue={url} />
            {index === 0 ? <span className="rounded-lg bg-[#FDECEF] px-2 py-1 text-[10px] font-bold text-[#EC4C84]">Primary</span> : null}
            <Trash2 className="h-4 w-4 text-[#C8A7B1]" />
          </div>
        ))}
        <button className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl border border-[#F7D9E2] px-4 text-sm font-bold text-[#EC4C84]">
          <Plus className="h-4 w-4" /> Add Image URL
        </button>
      </FormSection>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button className="h-12 rounded-xl border border-[#F7D9E2] bg-white text-sm font-bold text-[#6F6570]">Cancel</button>
        <button className="h-12 rounded-xl bg-[#EC4C84] text-sm font-bold text-white shadow-lg shadow-pink-200">Save Product</button>
      </div>
    </aside>
  );
}

function Field({ label, placeholder, select = false }: { label: string; placeholder: string; select?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
      {label}
      <div className="relative">
        <input
          className="h-11 w-full rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm outline-none placeholder:text-[#9D8F98] focus:border-[#EC4C84]"
          placeholder={placeholder}
        />
        {select ? <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-[#9D8F98]" /> : null}
      </div>
    </label>
  );
}

function FormSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="mt-5 rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100">
      <h3 className="mb-5 font-bold text-[#1F1720]">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function OptionRow({ description, label }: { description: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#6F6570]">{label}</p>
        <p className="mt-1 text-xs text-[#9D8F98]">{description}</p>
      </div>
      <Toggle />
    </div>
  );
}

function EditProductModal() {
  return (
    <div className="pointer-events-none fixed bottom-8 left-1/2 z-30 hidden w-[42rem] -translate-x-1/2 rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-[0_28px_90px_rgba(31,23,32,0.18)] xl:block">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F1720]">Edit Product</h2>
        <X className="h-4 w-4 text-[#9D8F98]" />
      </div>
      <div className="grid gap-5 sm:grid-cols-[13rem_1fr]">
        <div>
          <ProductArt type="box" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            <ProductArt compact type="candle" />
            <ProductArt compact type="box" />
            <button className="rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] text-xs font-bold text-[#EC4C84]">
              + Image
            </button>
          </div>
        </div>
        <div className="grid gap-3">
          <Field label="Product Name *" placeholder="Relax & Unwind Gift Box" />
          <Field label="Category *" placeholder="Gift Boxes" select />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (USD) *" placeholder="$   48.00" />
            <Field label="Compare at Price (USD)" placeholder="$   60.00" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU *" placeholder="GBOX-001" />
            <Field label="Stock Quantity *" placeholder="35" />
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3 border-t border-[#F7D9E2] pt-5">
        <button className="h-10 rounded-xl border border-[#F7D9E2] px-6 text-sm font-bold text-[#6F6570]">Cancel</button>
        <button className="h-10 rounded-xl bg-[#EC4C84] px-6 text-sm font-bold text-white shadow-lg shadow-pink-200">Update Product</button>
      </div>
    </div>
  );
}

function SummaryCards() {
  const cards = [
    ["Total Products", "128", "12.5%", Gift],
    ["Active Products", "110", "8.3%", PackageCheck],
    ["Low Stock", "7", "2 since yesterday", Bell],
    ["Out of Stock", "3", "Needs attention", Boxes],
  ] as const;

  return (
    <div className="mt-7 grid gap-5 md:grid-cols-4">
      {cards.map(([label, value, delta, Icon]) => (
        <div className="rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100" key={label}>
          <span className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
            <Icon className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#6F6570]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#1F1720]">{value}</p>
          <p className={`mt-3 text-xs font-bold ${label.includes("Low") || label.includes("Out") ? "text-red-500" : "text-[#39B86D]"}`}>
            {label.includes("Low") || label.includes("Out") ? "↓" : "↑"} {delta}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-white text-[#1F1720] xl:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopHeader />
        <div className="grid min-h-[calc(100vh-4.8rem)] xl:grid-cols-[minmax(0,1fr)_29rem]">
          <main className="min-w-0 bg-white px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#1F1720]">Products</h1>
                  <p className="mt-2 text-sm text-[#6F6570]">Manage and organize your store products.</p>
                </div>
                <div className="flex gap-3">
                  <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#F7D9E2] bg-white px-5 text-sm font-bold text-[#6F6570]">
                    <Upload className="h-4 w-4 text-[#EC4C84]" /> Export
                  </button>
                  <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#EC4C84] px-5 text-sm font-bold text-white shadow-lg shadow-pink-200">
                    <Plus className="h-4 w-4" /> Add Product
                  </button>
                </div>
              </div>

              <div className="mt-7 flex gap-3 overflow-x-auto rounded-2xl border border-[#F7D9E2] bg-white p-3 shadow-sm shadow-pink-100">
                {tabs.map(([label, count], index) => (
                  <button
                    className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold ${
                      index === 0 ? "bg-[#FDECEF] text-[#EC4C84]" : "text-[#6F6570] hover:bg-[#FFF5F7]"
                    }`}
                    key={label}
                  >
                    {label} {count ? <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-[#EC4C84]">{count}</span> : null}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#F7D9E2] bg-white p-4 shadow-sm shadow-pink-100">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4">
                    <Search className="h-4 w-4 text-[#9D8F98]" />
                    <input className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Search product name, SKU..." />
                    <Search className="h-4 w-4 text-[#9D8F98]" />
                  </div>
                  <FilterControl label="All Categories" />
                  <FilterControl label="Stock Status" />
                  <FilterControl label="Price Range" />
                  <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#F7D9E2] bg-white px-5 text-sm font-bold text-[#6F6570]">
                    <Filter className="h-4 w-4 text-[#EC4C84]" /> Filters
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <ProductTable />
              </div>
              <p className="mt-5 text-sm text-[#6F6570]">Showing 1 to 7 of 128 products</p>

              <SummaryCards />
            </div>
          </main>
          <AddProductPanel />
        </div>
      </div>
      <EditProductModal />
    </div>
  );
}
