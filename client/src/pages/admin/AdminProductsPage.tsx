import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  Edit3,
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
import { normalizeApiError } from "../../lib/apiError";
import { categoryApi, type PublicCategory } from "../../services/categoryApi";
import {
  productApi,
  type ProductPayload,
  type PublicProduct,
  type StockType,
} from "../../services/productApi";

type ProductArtType = "box" | "candle" | "mug" | "necklace" | "soap" | "decor" | "journal";

type ProductFormState = {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  productStory: string;
  material: string;
  careInstructions: string;
  makingTime: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  stockType: StockType;
  isCustomizable: boolean;
  isGiftSupported: boolean;
  isActive: boolean;
  images: Array<{
    imageUrl: string;
    publicId: string;
    isPrimary: boolean;
  }>;
};

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Products", icon: Gift, active: true, open: true },
  { label: "All Products", child: true, active: true },
  { label: "Add New Product", child: true },
  { label: "Categories", child: true, comingSoon: true },
  { label: "Tags", child: true, comingSoon: true },
  { label: "Collections", child: true, comingSoon: true },
  { label: "Orders", icon: ShoppingCart, count: "24" },
  { label: "Customers", icon: UsersRound },
  { label: "Gift Orders", icon: Gift, comingSoon: true },
  { label: "Reviews", icon: Heart, comingSoon: true },
  { label: "Marketing", icon: Tags, comingSoon: true },
  { label: "Discounts", icon: Star, comingSoon: true },
  { label: "Analytics", icon: BarChart3, comingSoon: true },
  { label: "Settings", icon: Settings, comingSoon: true },
];

const fallbackProducts: PublicProduct[] = [
  {
    id: "demo-1",
    categoryId: "demo-gift-boxes",
    name: "Relax & Unwind Gift Box",
    slug: "relax-unwind-gift-box",
    shortDescription: "Demo fallback product",
    description: "Fallback product shown only when the API is unavailable.",
    price: 48,
    compareAtPrice: 60,
    stock: 35,
    stockType: "READY_STOCK",
    isCustomizable: true,
    isGiftSupported: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: "demo-gift-boxes",
      name: "Gift Boxes",
      slug: "gift-boxes",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    images: [],
  },
  {
    id: "demo-2",
    categoryId: "demo-candles",
    name: "Scented Soy Candle",
    slug: "scented-soy-candle",
    shortDescription: "Demo fallback product",
    description: "Fallback product shown only when the API is unavailable.",
    price: 18,
    stock: 6,
    stockType: "READY_STOCK",
    isCustomizable: false,
    isGiftSupported: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: "demo-candles",
      name: "Candles",
      slug: "candles",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    images: [],
  },
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

const stockTypeLabels: Record<StockType, string> = {
  READY_STOCK: "Ready stock",
  MADE_TO_ORDER: "Made to order",
  PRE_ORDER: "Pre-order",
  OUT_OF_STOCK: "Out of stock",
};

const emptyForm: ProductFormState = {
  categoryId: "",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  productStory: "",
  material: "",
  careInstructions: "",
  makingTime: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  stockType: "READY_STOCK",
  isCustomizable: false,
  isGiftSupported: true,
  isActive: true,
  images: [{ imageUrl: "", publicId: "", isPrimary: true }],
};

const formatCurrency = (value: PublicProduct["price"]) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
};

const optionalString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const inferArt = (product: PublicProduct): ProductArtType => {
  const text = `${product.name} ${product.category?.name ?? ""}`.toLowerCase();

  if (text.includes("candle")) return "candle";
  if (text.includes("mug")) return "mug";
  if (text.includes("necklace") || text.includes("jewelry")) return "necklace";
  if (text.includes("soap")) return "soap";
  if (text.includes("decor") || text.includes("flower")) return "decor";
  if (text.includes("journal")) return "journal";

  return "box";
};

const getProductImage = (product: PublicProduct) => {
  return (
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.images?.[0]?.imageUrl
  );
};

const getStockState = (product: PublicProduct) => {
  if (!product.isActive || product.stockType === "OUT_OF_STOCK" || product.stock <= 0) {
    return "Out of Stock";
  }

  if (product.stock <= 10) {
    return "Low Stock";
  }

  return "In Stock";
};

const formFromProduct = (product: PublicProduct): ProductFormState => {
  const images = product.images?.length
    ? product.images.map((image, index) => ({
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        isPrimary: image.isPrimary || index === 0,
      }))
    : [{ imageUrl: "", publicId: "", isPrimary: true }];

  return {
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description,
    productStory: product.productStory ?? "",
    material: product.material ?? "",
    careInstructions: product.careInstructions ?? "",
    makingTime: product.makingTime ?? "",
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    stock: String(product.stock),
    stockType: product.stockType ?? "READY_STOCK",
    isCustomizable: product.isCustomizable,
    isGiftSupported: product.isGiftSupported,
    isActive: product.isActive,
    images,
  };
};

const buildPayload = (form: ProductFormState): ProductPayload => {
  const price = Number(form.price);
  const compareAtPrice = form.compareAtPrice.trim()
    ? Number(form.compareAtPrice)
    : undefined;
  const stock = Number(form.stock);
  const images = form.images
    .filter((image) => image.imageUrl.trim() && image.publicId.trim())
    .map((image) => ({
      imageUrl: image.imageUrl.trim(),
      publicId: image.publicId.trim(),
      isPrimary: image.isPrimary,
    }));

  return {
    categoryId: form.categoryId,
    name: form.name.trim(),
    ...(optionalString(form.slug) && { slug: optionalString(form.slug) }),
    ...(optionalString(form.shortDescription) && {
      shortDescription: optionalString(form.shortDescription),
    }),
    description: form.description.trim(),
    ...(optionalString(form.productStory) && {
      productStory: optionalString(form.productStory),
    }),
    ...(optionalString(form.material) && { material: optionalString(form.material) }),
    ...(optionalString(form.careInstructions) && {
      careInstructions: optionalString(form.careInstructions),
    }),
    ...(optionalString(form.makingTime) && {
      makingTime: optionalString(form.makingTime),
    }),
    price,
    ...(compareAtPrice !== undefined && { compareAtPrice }),
    stock,
    stockType: form.stockType,
    isCustomizable: form.isCustomizable,
    isGiftSupported: form.isGiftSupported,
    isActive: form.isActive,
    ...(images.length > 0 && { images }),
  };
};

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
                    : item.comingSoon
                      ? "cursor-not-allowed text-[#C8A7B1]"
                      : "text-[#6F6570] hover:bg-white/70"
                }`}
                key={item.label}
                title={item.comingSoon ? "Coming soon" : undefined}
              >
                {item.label}
                {item.comingSoon ? <span className="ml-2 text-[10px] font-bold text-[#C8A7B1]">Soon</span> : null}
              </div>
            );
          }

          return (
            <div
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ${
                item.active
                  ? "bg-[#FDECEF] text-[#EC4C84]"
                  : item.comingSoon
                    ? "cursor-not-allowed text-[#C8A7B1]"
                    : "text-[#5E5962] hover:bg-white/80"
              }`}
              key={item.label}
              title={item.comingSoon ? "Coming soon" : undefined}
            >
              <span className="flex items-center gap-3">
                {Icon ? <Icon className="h-5 w-5" /> : null}
                {item.label}
                {item.comingSoon ? <span className="text-[10px] font-bold text-[#C8A7B1]">Soon</span> : null}
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
        <button
          className="mt-5 w-full cursor-not-allowed rounded-xl bg-[#FDECEF] px-4 py-3 text-sm font-bold text-[#C8A7B1]"
          disabled
          title="Coming soon"
          type="button"
        >
          View Store Soon
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
            placeholder="Search products, category, slug..."
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
    <button
      className="flex h-12 cursor-not-allowed items-center justify-between gap-5 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-4 text-sm font-semibold text-[#C8A7B1]"
      disabled
      title="Coming soon"
      type="button"
    >
      <span>{label}</span>
      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#C8A7B1]">Soon</span>
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

function Toggle({
  enabled = true,
  onClick,
}: {
  enabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex h-6 w-11 items-center rounded-full p-1 ${enabled ? "bg-[#EC4C84]" : "bg-[#F7D9E2]"}`}
      onClick={onClick}
      type="button"
    >
      <span className={`h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
    </button>
  );
}

function ProductArt({
  product,
  compact = false,
}: {
  compact?: boolean;
  product: PublicProduct;
}) {
  const imageUrl = getProductImage(product);
  const type = inferArt(product);
  const label: Record<ProductArtType, string> = {
    box: "Gift Box",
    candle: "Candle",
    mug: "mama",
    necklace: "A",
    soap: "Love",
    decor: "Decor",
    journal: "Notes",
  };

  if (imageUrl) {
    return (
      <img
        alt={product.name}
        className={`shrink-0 rounded-xl object-cover ${compact ? "h-14 w-14" : "aspect-square w-full"}`}
        src={imageUrl}
      />
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF0DA] ${
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

function StockDot({ product }: { product: PublicProduct }) {
  const state = getStockState(product);
  const color =
    state === "In Stock" ? "bg-[#39B86D]" : state === "Low Stock" ? "bg-amber-500" : "bg-red-500";

  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}

function StateCard({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-8 text-center shadow-sm shadow-pink-100">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
        <Gift className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-[#1F1720]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6F6570]">{description}</p>
    </div>
  );
}

function ProductTable({
  isFallback,
  onArchive,
  onEdit,
  products,
}: {
  isFallback: boolean;
  onArchive: (product: PublicProduct) => void;
  onEdit: (product: PublicProduct) => void;
  products: PublicProduct[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
      <div className="grid min-w-[62rem] grid-cols-[3rem_minmax(13rem,1.6fr)_8rem_7rem_7rem_7rem_12rem] border-b border-[#F7D9E2] px-4 py-3 text-xs font-bold text-[#6F6570]">
        <span><input className="h-4 w-4 accent-[#EC4C84]" type="checkbox" /></span>
        <span>Product</span>
        <span>Category</span>
        <span>Price</span>
        <span>Stock</span>
        <span>Status</span>
        <span className="sticky right-0 z-10 bg-white pl-3">Actions</span>
      </div>
      {products.map((product) => (
        <div
          className="grid min-w-[62rem] grid-cols-[3rem_minmax(13rem,1.6fr)_8rem_7rem_7rem_7rem_12rem] items-center border-b border-[#F7D9E2]/70 px-4 py-4 text-sm last:border-b-0"
          key={product.id}
        >
          <span><input className="h-4 w-4 accent-[#EC4C84]" type="checkbox" /></span>
          <div className="flex items-center gap-4">
            <ProductArt compact product={product} />
            <div>
              <p className="font-bold text-[#1F1720]">{product.name}</p>
              <p className="mt-1 text-xs text-[#6F6570]">Slug: {product.slug}</p>
            </div>
          </div>
          <span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${categoryColors[product.category?.name ?? ""] ?? "bg-[#FDECEF] text-[#EC4C84]"}`}>
              {product.category?.name ?? "Uncategorized"}
            </span>
          </span>
          <span>
            <span className="block font-bold text-[#1F1720]">{formatCurrency(product.price)}</span>
            {product.compareAtPrice ? <span className="block text-xs text-[#9D8F98] line-through">{formatCurrency(product.compareAtPrice)}</span> : null}
          </span>
          <span className="flex items-start gap-3">
            <StockDot product={product} />
            <span>
              <span className="block font-bold text-[#1F1720]">{product.stock}</span>
              <span className="text-xs text-[#6F6570]">{getStockState(product)}</span>
            </span>
          </span>
          <span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </span>
          <span className="sticky right-0 z-10 flex items-center gap-2 bg-white pl-3">
            <button
              aria-label="Edit product"
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#F7D9E2] bg-white px-3 text-xs font-bold text-[#EC4C84] hover:bg-[#FFF5F7] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isFallback}
              onClick={() => onEdit(product)}
              title={isFallback ? "Edit product unavailable for demo data" : "Edit product"}
              type="button"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
            <button
              aria-label="Archive product"
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#F7D9E2] bg-white px-3 text-xs font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isFallback}
              onClick={() => onArchive(product)}
              title={isFallback ? "Archive product unavailable for demo data" : "Archive product"}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              Archive
            </button>
            {isFallback ? <span className="text-[10px] font-bold text-[#C8A7B1]">Demo only</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
      {label}
      <input
        className="h-11 w-full rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm outline-none placeholder:text-[#9D8F98] focus:border-[#EC4C84]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
  label,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
      {label}
      <textarea
        className="min-h-24 w-full rounded-xl border border-[#F7D9E2] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9D8F98] focus:border-[#EC4C84]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  );
}

function SelectField({
  children,
  label,
  onChange,
  required = false,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
      {label}
      <select
        className="h-11 w-full rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm outline-none focus:border-[#EC4C84]"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        {children}
      </select>
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

function OptionRow({
  description,
  enabled,
  label,
  onToggle,
}: {
  description: string;
  enabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#6F6570]">{label}</p>
        <p className="mt-1 text-xs text-[#9D8F98]">{description}</p>
      </div>
      <Toggle enabled={enabled} onClick={onToggle} />
    </div>
  );
}

function ProductFormPanel({
  categories,
  editingProduct,
  form,
  formError,
  isSubmitting,
  onCancelEdit,
  onFormChange,
  onSubmit,
}: {
  categories: PublicCategory[];
  editingProduct: PublicProduct | null;
  form: ProductFormState;
  formError: string | null;
  isSubmitting: boolean;
  onCancelEdit: () => void;
  onFormChange: (form: ProductFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const updateForm = (updates: Partial<ProductFormState>) => {
    onFormChange({ ...form, ...updates });
  };

  const updateImage = (
    index: number,
    updates: Partial<ProductFormState["images"][number]>,
  ) => {
    const nextImages = form.images.map((image, imageIndex) => (
      imageIndex === index ? { ...image, ...updates } : image
    ));

    onFormChange({ ...form, images: nextImages });
  };

  const setPrimaryImage = (index: number) => {
    onFormChange({
      ...form,
      images: form.images.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      })),
    });
  };

  return (
    <aside className="border-l border-[#F7D9E2] bg-white px-5 py-7 xl:w-[29rem] xl:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1F1720]">{editingProduct ? "Edit Product" : "Add Product"}</h2>
        {editingProduct ? (
          <button onClick={onCancelEdit} type="button">
            <X className="h-5 w-5 text-[#9D8F98]" />
          </button>
        ) : (
          <X className="h-5 w-5 text-[#9D8F98]" />
        )}
      </div>

      <form onSubmit={onSubmit}>
        <FormSection title="Basic Information">
          <TextField
            label="Product Name *"
            onChange={(name) => updateForm({ name })}
            placeholder="e.g., Relax & Unwind Gift Box"
            required
            value={form.name}
          />
          <SelectField
            label="Category *"
            onChange={(categoryId) => updateForm({ categoryId })}
            required
            value={form.categoryId}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Slug"
            onChange={(slug) => updateForm({ slug })}
            placeholder="relax-unwind-gift-box"
            value={form.slug}
          />
          <TextField
            label="Short Description"
            onChange={(shortDescription) => updateForm({ shortDescription })}
            placeholder="A sweet one-line product summary"
            value={form.shortDescription}
          />
          <TextAreaField
            label="Description *"
            onChange={(description) => updateForm({ description })}
            placeholder="Describe the product clearly"
            required
            value={form.description}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Price *"
              onChange={(price) => updateForm({ price })}
              placeholder="1200"
              required
              type="number"
              value={form.price}
            />
            <TextField
              label="Compare-at price"
              onChange={(compareAtPrice) => updateForm({ compareAtPrice })}
              placeholder="1500"
              type="number"
              value={form.compareAtPrice}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Stock *"
              onChange={(stock) => updateForm({ stock })}
              placeholder="0"
              required
              type="number"
              value={form.stock}
            />
            <SelectField
              label="Stock Type"
              onChange={(stockType) => updateForm({ stockType: stockType as StockType })}
              value={form.stockType}
            >
              {Object.entries(stockTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </div>
        </FormSection>

        <FormSection title="Product Details">
          <TextAreaField
            label="Product Story"
            onChange={(productStory) => updateForm({ productStory })}
            placeholder="Optional story shown on product pages"
            value={form.productStory}
          />
          <TextField
            label="Material"
            onChange={(material) => updateForm({ material })}
            placeholder="Cotton, ceramic, soy wax..."
            value={form.material}
          />
          <TextField
            label="Care Instructions"
            onChange={(careInstructions) => updateForm({ careInstructions })}
            placeholder="Handle with care"
            value={form.careInstructions}
          />
          <TextField
            label="Making Time"
            onChange={(makingTime) => updateForm({ makingTime })}
            placeholder="3-5 business days"
            value={form.makingTime}
          />
        </FormSection>

        <FormSection title="Product Options">
          <OptionRow
            description="Customers can personalize this product."
            enabled={form.isCustomizable}
            label="Customizable"
            onToggle={() => updateForm({ isCustomizable: !form.isCustomizable })}
          />
          <OptionRow
            description="This product can be sent as a gift."
            enabled={form.isGiftSupported}
            label="Supports Gift Packaging"
            onToggle={() => updateForm({ isGiftSupported: !form.isGiftSupported })}
          />
          <OptionRow
            description="Inactive products are hidden from the public catalog."
            enabled={form.isActive}
            label="Active Product"
            onToggle={() => updateForm({ isActive: !form.isActive })}
          />
        </FormSection>

        <FormSection title="Product Images">
          <p className="mb-1 text-sm font-semibold text-[#6F6570]">Manual imageUrl / publicId pairs</p>
          {form.images.map((image, index) => (
            <div className="grid gap-2 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] p-3" key={index}>
              <TextField
                label={`Image URL ${index + 1}`}
                onChange={(imageUrl) => updateImage(index, { imageUrl })}
                placeholder="https://example.test/image.jpg"
                value={image.imageUrl}
              />
              <TextField
                label="Public ID"
                onChange={(publicId) => updateImage(index, { publicId })}
                placeholder="amy-products/example"
                value={image.publicId}
              />
              <label className="flex items-center gap-2 text-xs font-bold text-[#6F6570]">
                <input
                  checked={image.isPrimary}
                  className="accent-[#EC4C84]"
                  onChange={() => setPrimaryImage(index)}
                  type="radio"
                />
                Primary image
              </label>
            </div>
          ))}
          <button
            className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl border border-[#F7D9E2] px-4 text-sm font-bold text-[#EC4C84]"
            onClick={() => onFormChange({
              ...form,
              images: [...form.images, { imageUrl: "", publicId: "", isPrimary: false }],
            })}
            type="button"
          >
            <Plus className="h-4 w-4" /> Add Image URL
          </button>
        </FormSection>

        {formError ? (
          <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100">
            {formError}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-12 rounded-xl border border-[#F7D9E2] bg-white text-sm font-bold text-[#6F6570]"
            onClick={
              editingProduct
                ? onCancelEdit
                : () => onFormChange({ ...emptyForm, categoryId: categories[0]?.id ?? "" })
            }
            type="button"
          >
            {editingProduct ? "Cancel edit" : "Reset"}
          </button>
          <button
            className="h-12 rounded-xl bg-[#EC4C84] text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </aside>
  );
}

function SummaryCards({ products }: { products: PublicProduct[] }) {
  const activeCount = products.filter((product) => product.isActive).length;
  const lowStockCount = products.filter((product) => getStockState(product) === "Low Stock").length;
  const outOfStockCount = products.filter((product) => getStockState(product) === "Out of Stock").length;
  const cards = [
    ["Total Products", String(products.length), "Live catalog rows", Gift],
    ["Active Products", String(activeCount), "Visible publicly", PackageCheck],
    ["Low Stock", String(lowStockCount), "10 or fewer left", Bell],
    ["Out of Stock", String(outOfStockCount), "Needs attention", Boxes],
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
            {delta}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<PublicProduct | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs = useMemo(() => {
    const categoryCounts = categories.slice(0, 5).map((category) => [
      category.name,
      String(products.filter((product) => product.categoryId === category.id).length),
    ]);

    return [["All", String(products.length)], ...categoryCounts, ["More", ""]];
  }, [categories, products]);

  const displayedProducts = isFallback ? fallbackProducts : products;

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setIsFallback(false);
      const result = await productApi.list({ page: 1, limit: 100 });
      setProducts(result.products);
    } catch (error) {
      setLoadError(normalizeApiError(error).message);
      setProducts([]);
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoryError(null);
      const result = await categoryApi.list();
      setCategories(result);
      setForm((currentForm) => ({
        ...currentForm,
        categoryId: currentForm.categoryId || result[0]?.id || "",
      }));
    } catch (error) {
      setCategoryError(normalizeApiError(error).message);
      setCategories([]);
    }
  };

  useEffect(() => {
    void loadProducts();
    void loadCategories();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!form.categoryId) {
      setFormError("Select a category before saving.");
      return;
    }

    if (!form.name.trim() || !form.description.trim()) {
      setFormError("Product name and description are required.");
      return;
    }

    const price = Number(form.price);
    const compareAtPrice = form.compareAtPrice.trim()
      ? Number(form.compareAtPrice)
      : undefined;
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      setFormError("Price must be a valid positive number.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("Stock must be a whole number of zero or more.");
      return;
    }

    if (compareAtPrice !== undefined && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
      setFormError("Compare-at price must be a valid positive number.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload(form);

      if (editingProduct) {
        const updatedProduct = await productApi.update(editingProduct.id, payload);
        setProducts((currentProducts) => currentProducts.map((product) => (
          product.id === updatedProduct.id ? updatedProduct : product
        )));
        setSuccessMessage("Product updated successfully.");
      } else {
        const createdProduct = await productApi.create(payload);
        setProducts((currentProducts) => [createdProduct, ...currentProducts]);
        setSuccessMessage("Product created successfully.");
      }

      setEditingProduct(null);
      setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
      await loadProducts();
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: PublicProduct) => {
    setEditingProduct(product);
    setForm(formFromProduct(product));
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setFormError(null);
  };

  const handleArchive = async (product: PublicProduct) => {
    const confirmed = window.confirm(
      `Archive "${product.name}"? This uses the backend delete endpoint and deactivates the product.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSuccessMessage(null);
      setLoadError(null);
      await productApi.archive(product.id);
      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id));
      setSuccessMessage("Product archived successfully. It is now hidden from the public product list.");
      await loadProducts();
    } catch (error) {
      setLoadError(normalizeApiError(error).message);
    }
  };

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
                  <button
                    className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-5 text-sm font-bold text-[#C8A7B1]"
                    disabled
                    title="Coming soon"
                    type="button"
                  >
                    <Upload className="h-4 w-4" /> Export <span className="text-[10px]">Soon</span>
                  </button>
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#EC4C84] px-5 text-sm font-bold text-white shadow-lg shadow-pink-200"
                    onClick={handleCancelEdit}
                    type="button"
                  >
                    <Plus className="h-4 w-4" /> Add Product
                  </button>
                </div>
              </div>

              {successMessage ? (
                <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-100">
                  {successMessage}
                </p>
              ) : null}
              {loadError ? (
                <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100">
                  {loadError}. {isFallback ? "Showing demo fallback products." : null}
                </p>
              ) : null}
              {categoryError ? (
                <p className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 shadow-sm shadow-amber-100">
                  Categories could not be loaded: {categoryError}
                </p>
              ) : null}
              {isFallback ? (
                <p className="mt-5 rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] px-4 py-3 text-sm font-semibold text-[#EC4C84] shadow-sm shadow-pink-100">
                  Demo fallback mode is active because the product API failed. Create, edit, and archive actions are disabled for demo rows.
                </p>
              ) : null}

              <div className="mt-7 flex gap-3 overflow-x-auto rounded-2xl border border-[#F7D9E2] bg-white p-3 shadow-sm shadow-pink-100">
                {tabs.map(([label, count], index) => (
                  <button
                    className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold ${
                      index === 0 ? "bg-[#FDECEF] text-[#EC4C84]" : "cursor-not-allowed text-[#C8A7B1]"
                    }`}
                    disabled={index !== 0}
                    key={label}
                    title={index === 0 ? "All products" : "Coming soon"}
                    type="button"
                  >
                    {label} {count ? <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-[#EC4C84]">{count}</span> : null}
                    {index !== 0 ? <span className="ml-2 text-[10px] text-[#C8A7B1]">Soon</span> : null}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#F7D9E2] bg-white p-4 shadow-sm shadow-pink-100">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4">
                    <Search className="h-4 w-4 text-[#9D8F98]" />
                    <input className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Search product name, category, slug..." />
                    <Search className="h-4 w-4 text-[#9D8F98]" />
                  </div>
                  <FilterControl label="All Categories" />
                  <FilterControl label="Stock Status" />
                  <FilterControl label="Price Range" />
                  <button
                    className="flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-5 text-sm font-bold text-[#C8A7B1]"
                    disabled
                    title="Coming soon"
                    type="button"
                  >
                    <Filter className="h-4 w-4" /> Filters <span className="text-[10px]">Soon</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                {isLoading ? (
                  <StateCard
                    description="Loading products from the real product API."
                    title="Loading products"
                  />
                ) : displayedProducts.length > 0 ? (
                  <ProductTable
                    isFallback={isFallback}
                    onArchive={handleArchive}
                    onEdit={handleEdit}
                    products={displayedProducts}
                  />
                ) : (
                  <StateCard
                    description="The product API responded successfully, but there are no active products to show yet."
                    title="No products yet"
                  />
                )}
              </div>
              <p className="mt-5 text-sm text-[#6F6570]">
                Showing {displayedProducts.length} products{isFallback ? " in demo fallback mode" : ""}
              </p>

              <SummaryCards products={displayedProducts} />
            </div>
          </main>
          <ProductFormPanel
            categories={categories}
            editingProduct={editingProduct}
            form={form}
            formError={formError}
            isSubmitting={isSubmitting}
            onCancelEdit={handleCancelEdit}
            onFormChange={setForm}
            onSubmit={(event) => void handleSubmit(event)}
          />
        </div>
      </div>
    </div>
  );
}
