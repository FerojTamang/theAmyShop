import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Filter,
  Gift,
  Headphones,
  Heart,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { normalizeApiError } from "../../lib/apiError";
import { categoryApi } from "../../services/categoryApi";
import { productApi, type PublicProduct } from "../../services/productApi";

type Product = {
  title: string;
  slug: string;
  subtitle: string;
  badge?: string;
  price: string;
  oldPrice?: string;
  rating: string;
  reviews: number;
  art: "box" | "candle" | "mug" | "necklace" | "frame" | "star-map" | "decor";
  imageUrl?: string;
};

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const fallbackProducts: Product[] = [
  { title: "Relax & Unwind Gift Box", slug: "relax-unwind-gift-box", subtitle: "Spa gift set with candle & tumbler", badge: "Bestseller", price: "$48.00", oldPrice: "$60.00", rating: "4.9", reviews: 128, art: "box" },
  { title: "Scented Soy Candle", slug: "scented-soy-candle", subtitle: "Hand-poured with love", badge: "New", price: "$18.00", rating: "4.8", reviews: 96, art: "candle" },
  { title: "Mama Mug", slug: "mama-mug", subtitle: "Ceramic mug, 15oz", price: "$16.00", rating: "4.9", reviews: 74, art: "mug" },
  { title: "Initial Necklace", slug: "initial-necklace", subtitle: "Gold filled - Custom initial", badge: "Bestseller", price: "$24.00", oldPrice: "$30.00", rating: "4.9", reviews: 213, art: "necklace" },
  { title: "Pressed Flower Frame", slug: "pressed-flower-frame", subtitle: "Real flowers - Wooden frame", badge: "10% OFF", price: "$27.00", oldPrice: "$30.00", rating: "4.8", reviews: 57, art: "frame" },
  { title: "Bridesmaid Gift Box", slug: "bridesmaid-gift-box", subtitle: "Personalized - Spa & self-care", badge: "New", price: "$52.00", rating: "4.9", reviews: 41, art: "box" },
  { title: "Custom Star Map", slug: "custom-star-map", subtitle: "Your special date & place", price: "$26.00", rating: "4.9", reviews: 63, art: "star-map" },
  { title: "Best Friend Mug", slug: "best-friend-mug", subtitle: "Ceramic mug, 15oz", price: "$16.00", rating: "4.8", reviews: 88, art: "mug" },
  { title: "Dried Flower Bouquet", slug: "dried-flower-bouquet", subtitle: "Hand-tied - Everlasting blooms", price: "$22.00", rating: "4.9", reviews: 112, art: "decor" },
];

const fallbackCategories = ["Gift Boxes", "Candles", "Mugs", "Keepsakes", "Jewelry", "Home Decor", "Accessories"];

const formatPrice = (value: PublicProduct["price"]) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
};

const getPrimaryImage = (product: PublicProduct) => {
  return (
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.images?.[0]?.imageUrl
  );
};

const inferArt = (product: PublicProduct, index: number): Product["art"] => {
  const text = `${product.name} ${product.category?.name ?? ""}`.toLowerCase();

  if (text.includes("candle")) return "candle";
  if (text.includes("mug")) return "mug";
  if (text.includes("necklace") || text.includes("jewelry")) return "necklace";
  if (text.includes("frame")) return "frame";
  if (text.includes("star")) return "star-map";
  if (text.includes("flower") || text.includes("decor")) return "decor";
  if (text.includes("box")) return "box";

  return fallbackProducts[index % fallbackProducts.length].art;
};

const mapApiProduct = (product: PublicProduct, index: number): Product => {
  const compareAtPrice = product.compareAtPrice;
  const hasCompareAt =
    compareAtPrice !== null &&
    compareAtPrice !== undefined &&
    Number(compareAtPrice) > Number(product.price);

  return {
    title: product.name,
    slug: product.slug,
    subtitle:
      product.shortDescription ??
      product.category?.name ??
      "Thoughtful handmade gift",
    badge: product.isCustomizable
      ? "Customizable"
      : product.isGiftSupported
        ? "Gift ready"
        : product.stockType === "READY_STOCK"
          ? "Ready to ship"
          : undefined,
    price: formatPrice(product.price),
    oldPrice: hasCompareAt ? formatPrice(compareAtPrice) : undefined,
    rating: "4.9",
    reviews: 0,
    art: inferArt(product, index),
    imageUrl: getPrimaryImage(product),
  };
};

function AnnouncementBar() {
  return (
    <div className="border-b border-[#F7D9E2] bg-[#FFF5F7]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs font-medium text-[#6F6570] sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2">
          <Heart className="h-4 w-4 text-[#EC4C84]" />
          Handmade with love. Made just for you.
        </span>
        <span className="hidden items-center gap-2 sm:inline-flex">
          <Truck className="h-4 w-4 text-[#EC4C84]" />
          Free shipping on orders over $75
        </span>
      </div>
    </div>
  );
}

function ProductsHeader() {
  return (
    <header className="border-b border-[#F7D9E2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-fit items-center gap-3" to="/">
          <span className="grid h-13 w-13 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
            <Gift className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-2xl font-semibold text-[#1F1720]" style={serifStyle}>The AMY Shop</span>
            <span className="text-xs font-medium text-[#9D8F98]">Handmade custom gifts</span>
          </span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-[#6F6570] lg:flex">
          {["Home", "Shop", "Collections", "Orders", "About", "Contact"].map((item) => (
            <Link className={item === "Shop" ? "text-[#EC4C84]" : ""} key={item} to={item === "Home" ? "/" : item === "Shop" ? "/products" : item === "Orders" ? "/orders" : "/"}>
              {item}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden h-10 w-52 items-center gap-2 rounded-full border border-[#F7D9E2] bg-white px-4 text-sm text-[#9D8F98] md:flex">
          <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9D8F98]" placeholder="Search gifts..." />
          <Search className="h-4 w-4 text-[#1F1720]" />
        </div>
        <Link className="grid h-10 w-10 place-items-center rounded-full text-[#1F1720] hover:bg-[#FFF5F7]" to="/account">
          <UserRound className="h-5 w-5" />
        </Link>
        <Link className="relative grid h-10 w-10 place-items-center rounded-full text-[#1F1720] hover:bg-[#FFF5F7]" to="/cart">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[#EC4C84] text-[10px] font-bold text-white">2</span>
        </Link>
      </div>
    </header>
  );
}

function PageIntro({ categories }: { categories: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-[#6F6570]">
        <Link to="/">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Shop</span>
        <ChevronRight className="h-4 w-4" />
        <span>All Products</span>
      </div>
      <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-[#1F1720]" style={serifStyle}>
            Handmade gifts, made just for them <span className="text-[#EC4C84]">♡</span>
          </h1>
          <p className="mt-3 text-lg text-[#6F6570]">
            Thoughtful, personalized gifts for every moment and every person.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex -space-x-3">
            {["A", "S", "E", "J", "M"].map((avatar) => (
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#FDECEF] text-xs font-bold text-[#EC4C84]" key={avatar}>{avatar}</span>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1F1720]">4.9</span>
              <Stars small />
            </div>
            <p className="text-sm text-[#6F6570]">Loved by 10,000+ customers</p>
          </div>
        </div>
      </div>
      <CategoryChips categories={categories} />
    </section>
  );
}

function CategoryChips({ categories }: { categories: string[] }) {
  const chips = ["All Gifts", ...categories];

  return (
    <div className="mt-8 flex gap-3 overflow-x-auto pb-1">
      {chips.map((chip, index) => (
        <button className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-full border px-6 text-sm font-bold ${index === 0 ? "border-[#EC4C84] bg-[#EC4C84] text-white" : "border-[#F7D9E2] bg-white text-[#1F1720]"}`} key={chip}>
          {index === 0 ? <Gift className="h-4 w-4" /> : null}
          {chip}
        </button>
      ))}
    </div>
  );
}

function FilterSidebar() {
  return (
    <aside className="rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-6 shadow-sm shadow-pink-100 lg:sticky lg:top-6 lg:self-start">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F1720]">Filter by</h2>
        <button className="text-sm font-bold text-[#EC4C84]">Clear all</button>
      </div>
      <FilterSection title="Occasion" items={["Birthday", "Anniversary", "Thank You", "Bridesmaid", "New Baby", "Mother's Day", "Christmas", "Just Because"]} />
      <FilterSection title="Product Type" items={["Gift Boxes", "Candles", "Mugs", "Necklaces", "Keepsakes", "Home Decor", "Accessories"]} />
      <section className="border-b border-[#F7D9E2] py-5">
        <HeaderRow title="Price Range" />
        <div className="mt-6 h-1 rounded-full bg-[#F7D9E2]">
          <div className="h-1 w-4/5 rounded-full bg-[#EC4C84]" />
        </div>
        <div className="mt-3 flex justify-between text-sm text-[#6F6570]">
          <span>$10</span>
          <span>$80+</span>
        </div>
      </section>
      <FilterSection title="Personalization" items={["Customizable (152)"]} />
      <FilterSection title="Ready to Ship" items={["Ships in 1-3 days (86)"]} />
      <section className="py-5">
        <HeaderRow title="Rating" />
        <div className="mt-4 grid gap-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label className="flex items-center gap-3 text-sm text-[#6F6570]" key={rating}>
              <span className="h-5 w-5 rounded border border-[#F7D9E2] bg-white" />
              <span className="flex text-[#F2B84B]">{Array.from({ length: rating }).map((_, i) => <Star className="h-4 w-4 fill-current" key={i} />)}</span>
              <span>& up</span>
            </label>
          ))}
        </div>
      </section>
      <button className="mt-3 h-12 w-full rounded-full border border-[#EC4C84] text-sm font-bold text-[#EC4C84]">Clear all filters</button>
    </aside>
  );
}

function FilterSection({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="border-b border-[#F7D9E2] py-5">
      <HeaderRow title={title} />
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <label className="flex items-center gap-3 text-sm text-[#6F6570]" key={item}>
            <span className="h-5 w-5 rounded border border-[#F7D9E2] bg-white" />
            {item}
          </label>
        ))}
      </div>
    </section>
  );
}

function HeaderRow({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-[#1F1720]">{title}</h3>
      <ChevronDown className="h-4 w-4 rotate-180 text-[#1F1720]" />
    </div>
  );
}

function ProductToolbar({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-4 shadow-sm shadow-pink-100 md:flex-row md:items-center">
      <p className="min-w-fit text-sm font-bold text-[#1F1720]">{count} products</p>
      <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4">
        <input className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Search in results..." />
        <Search className="h-4 w-4 text-[#1F1720]" />
      </div>
      <button className="flex h-12 items-center justify-between gap-8 rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm font-semibold text-[#1F1720]">
        Sort by: Best selling <ChevronDown className="h-4 w-4" />
      </button>
      <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#F7D9E2] bg-white px-5 text-sm font-bold text-[#1F1720]">
        <Filter className="h-4 w-4" /> Filter
      </button>
    </div>
  );
}

function ProductVisual({ type, className = "" }: { type: Product["art"] | "promo"; className?: string }) {
  const label = {
    box: "Gift Box",
    candle: "Amazing",
    mug: "mama",
    necklace: "A",
    frame: "Pressed flower",
    "star-map": "Star Map",
    decor: "Dried florals",
    promo: "Best Sister Ever",
  }[type];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF0DA] ${className}`}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#EC4C84]/20 blur-2xl" />
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/80 bg-white/72 p-4 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#EC4C84]" style={serifStyle}>{label}</p>
        <p className="mt-1 text-xs text-[#9D8F98]">handmade detail</p>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showProductImage = Boolean(
    product.imageUrl && failedImageUrl !== product.imageUrl,
  );

  return (
    <Link className="group overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100" to={`/products/${product.slug}`}>
      <div className="relative aspect-[1.1/1] overflow-hidden bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF5F7]">
        {showProductImage ? (
          <img
            alt={product.title}
            className="h-full w-full object-contain p-3"
            onError={() => setFailedImageUrl(product.imageUrl ?? null)}
            src={product.imageUrl}
          />
        ) : (
          <ProductVisual className="h-full w-full rounded-none" type={product.art} />
        )}
        {product.badge ? <span className="absolute left-4 top-4 rounded-full bg-[#FFF5F7] px-3 py-1 text-xs font-bold text-[#EC4C84]">{product.badge}</span> : null}
        <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-[#EC4C84] shadow-sm" type="button"><Heart className="h-5 w-5" /></button>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-[#1F1720]">{product.title}</h3>
        <p className="mt-1 text-sm text-[#6F6570]">{product.subtitle}</p>
        <div className="mt-4 flex items-center gap-2">
          <Stars small />
          <span className="text-sm font-bold text-[#1F1720]">{product.rating}</span>
          <span className="text-sm text-[#6F6570]">({product.reviews})</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-bold text-[#1F1720]">
            {product.price} {product.oldPrice ? <span className="ml-2 text-sm font-medium text-[#9D8F98] line-through">{product.oldPrice}</span> : null}
          </p>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-[#F7D9E2] bg-[#FFF5F7] text-[#EC4C84]" type="button"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
    </Link>
  );
}

function ProductStatePanel({
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
      <h2 className="mt-4 text-2xl font-semibold text-[#1F1720]" style={serifStyle}>
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6F6570]">
        {description}
      </p>
    </div>
  );
}

function Stars({ small = false }: { small?: boolean }) {
  return (
    <span className="flex text-[#F2B84B]">
      {Array.from({ length: 5 }).map((_, index) => <Star className={`${small ? "h-4 w-4" : "h-5 w-5"} fill-current`} key={index} />)}
    </span>
  );
}

function PromoBanner() {
  return (
    <section className="grid overflow-hidden rounded-2xl border border-[#F7D9E2] bg-gradient-to-r from-white via-[#FFF5F7] to-white shadow-sm shadow-pink-100 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">Made just for you</p>
        <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight text-[#1F1720]" style={serifStyle}>Custom gifts they'll never forget.</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-[#6F6570]">Personalized with love. Packed with care. Made to celebrate life's special moments.</p>
        <Link className="mt-7 inline-flex h-12 items-center gap-3 rounded-full bg-[#EC4C84] px-7 text-sm font-bold text-white shadow-lg shadow-pink-200" to="/products/personalized-gift-box">
          Create a custom gift <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ProductVisual className="min-h-72 rounded-none" type="promo" />
    </section>
  );
}

function Pagination() {
  return (
    <div className="mt-8 flex justify-center gap-3">
      {["1", "2", "3", "4", "...", "8"].map((page, index) => (
        <button className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-bold ${index === 0 ? "border-[#EC4C84] bg-[#EC4C84] text-white" : "border-[#F7D9E2] bg-white text-[#1F1720]"}`} key={`${page}-${index}`}>{page}</button>
      ))}
      <button className="grid h-10 w-10 place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#1F1720]"><ChevronRight className="h-4 w-4" /></button>
    </div>
  );
}

function FeatureStrip() {
  const features: Array<[string, string, typeof Heart]> = [
    ["Handmade with love", "Every item is crafted by hand with care", Heart],
    ["Gift ready", "Beautiful packaging, ready to impress", Gift],
    ["Secure payments", "Safe & trusted checkout with multiple options", ShieldCheck],
    ["24/7 support", "We're here to help you anytime", Headphones],
  ];

  return (
    <section className="border-t border-[#F7D9E2] bg-[#FFF5F7]">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {features.map(([title, subtitle, Icon]) => (
          <div className="flex gap-4 lg:border-r lg:border-[#F7D9E2] lg:last:border-r-0" key={title}>
            <Icon className="h-10 w-10 shrink-0 text-[#EC4C84]" />
            <div>
              <h3 className="text-sm font-bold text-[#1F1720]">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-[#6F6570]">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductsPage() {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        setIsLoading(true);
        setError(null);

        const [productResult, categoryResult] = await Promise.all([
          productApi.list({ page: 1, limit: 20 }),
          categoryApi.list(),
        ]);

        if (!isMounted) {
          return;
        }

        const mappedProducts = productResult.products.map(mapApiProduct);
        const apiCategories = categoryResult
          .map((category) => category.name)
          .filter((name, index, all) => all.indexOf(name) === index);

        setApiProducts(mappedProducts);
        setCategories(apiCategories.length > 0 ? apiCategories : fallbackCategories);
        setUsedFallback(mappedProducts.length === 0);
      } catch (catalogError) {
        if (!isMounted) {
          return;
        }

        setError(normalizeApiError(catalogError).message);
        setApiProducts([]);
        setCategories(fallbackCategories);
        setUsedFallback(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProducts = useMemo(
    () => (apiProducts.length > 0 ? apiProducts : fallbackProducts),
    [apiProducts],
  );

  return (
    <div className="min-h-screen bg-white text-[#1F1720]">
      <AnnouncementBar />
      <ProductsHeader />
      <PageIntro categories={categories} />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
        <FilterSidebar />
        <section>
          <ProductToolbar count={visibleProducts.length} />
          {isLoading ? (
            <div className="mt-6">
              <ProductStatePanel
                description="We are gathering the latest handmade gifts from the catalog."
                title="Loading products"
              />
            </div>
          ) : null}
          {!isLoading && error ? (
            <div className="mt-6">
              <ProductStatePanel
                description={`${error}. Showing our curated fallback collection for now.`}
                title="Catalog is temporarily unavailable"
              />
            </div>
          ) : null}
          {!isLoading && !error && usedFallback ? (
            <div className="mt-6">
              <ProductStatePanel
                description="The live catalog is empty, so we are showing a sample collection until products are added."
                title="No live products yet"
              />
            </div>
          ) : null}
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
          <div className="mt-8">
            <PromoBanner />
          </div>
          <Pagination />
        </section>
      </main>
      <FeatureStrip />
    </div>
  );
}
