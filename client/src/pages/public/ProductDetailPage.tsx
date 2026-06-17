import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  Headphones,
  Heart,
  Mail,
  Minus,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  UserRound,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { normalizeApiError } from "../../lib/apiError";
import { cartApi } from "../../services/cartApi";
import { productApi, type PublicProduct } from "../../services/productApi";

type RelatedProduct = {
  title: string;
  badge?: string;
  price: string;
  oldPrice?: string;
  rating: string;
  art: "box" | "necklace" | "candle" | "decor";
};

type Review = {
  name: string;
  text: string;
};

type DetailProduct = {
  id?: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  art: RelatedProduct["art"] | "mug" | "card";
  images: string[];
  isCustomizable: boolean;
  isGiftSupported: boolean;
  material?: string | null;
  careInstructions?: string | null;
  makingTime?: string | null;
};

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const relatedProducts: RelatedProduct[] = [
  { title: "Relax & Unwind Gift Box", badge: "Bestseller", price: "$48.00", oldPrice: "$60.00", rating: "4.9", art: "box" },
  { title: "Personalized Name Necklace", badge: "New", price: "$36.00", oldPrice: "$45.00", rating: "4.8", art: "necklace" },
  { title: "Scented Soy Candle", price: "$18.00", oldPrice: "$22.00", rating: "4.8", art: "candle" },
  { title: "Handmade Decor", price: "$28.00", oldPrice: "$35.00", rating: "4.9", art: "decor" },
];

const reviews: Review[] = [
  {
    name: "Sarah J.",
    text: "Absolutely beautiful! The personalized mug made my sister cry happy tears. Everything was packed so nicely.",
  },
  {
    name: "Emily R.",
    text: "The quality and presentation exceeded my expectations. You can tell it's made with so much love.",
  },
  {
    name: "Jessica M.",
    text: "Perfect gift for any occasion. I'll definitely be ordering again!",
  },
];

const fallbackDetailProduct: DetailProduct = {
  title: "Personalized Gift Box",
  category: "Gift Boxes",
  subtitle: "Thoughtful gifts with a handmade heart.",
  description:
    "A curated gift box made to celebrate life's special moments. Each item is handpicked, beautifully packed, and personalized just for your loved one.",
  price: "$48.00",
  oldPrice: "$60.00",
  badge: "Bestseller",
  art: "box",
  images: [],
  isCustomizable: true,
  isGiftSupported: true,
  material: "Handmade gift assortment",
  careInstructions: "Keep dry and store with care.",
  makingTime: "3-5 business days",
};

const formatPrice = (value: PublicProduct["price"]) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
};

const inferArt = (product: PublicProduct): DetailProduct["art"] => {
  const text = `${product.name} ${product.category?.name ?? ""}`.toLowerCase();

  if (text.includes("candle")) return "candle";
  if (text.includes("mug")) return "mug";
  if (text.includes("necklace") || text.includes("jewelry")) return "necklace";
  if (text.includes("flower") || text.includes("decor")) return "decor";

  return "box";
};

const mapApiProduct = (product: PublicProduct): DetailProduct => {
  const compareAtPrice = product.compareAtPrice;
  const hasCompareAt =
    compareAtPrice !== null &&
    compareAtPrice !== undefined &&
    Number(compareAtPrice) > Number(product.price);

  return {
    id: product.id,
    title: product.name,
    category: product.category?.name ?? "Shop",
    subtitle:
      product.shortDescription ??
      product.category?.name ??
      "Thoughtful gifts with a handmade heart.",
    description: product.description,
    price: formatPrice(product.price),
    oldPrice: hasCompareAt ? formatPrice(compareAtPrice) : undefined,
    badge: product.isCustomizable
      ? "Customizable"
      : product.isGiftSupported
        ? "Gift ready"
        : product.stockType === "READY_STOCK"
          ? "Ready to ship"
          : undefined,
    art: inferArt(product),
    images: product.images?.map((image) => image.imageUrl) ?? [],
    isCustomizable: product.isCustomizable,
    isGiftSupported: product.isGiftSupported,
    material: product.material,
    careInstructions: product.careInstructions,
    makingTime: product.makingTime,
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

function ProductHeader() {
  return (
    <header className="border-b border-[#F7D9E2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-fit items-center gap-3" to="/">
          <span className="grid h-13 w-13 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
            <Gift className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-2xl font-semibold text-[#1F1720]" style={serifStyle}>
              The AMY Shop
            </span>
            <span className="text-xs font-medium text-[#9D8F98]">Handmade custom gifts</span>
          </span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-[#6F6570] lg:flex">
          {["Home", "Shop", "Collections", "Orders", "About", "Contact"].map((item) => (
            <Link key={item} to={item === "Home" ? "/" : item === "Shop" ? "/products" : item === "Orders" ? "/orders" : "/"}>
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

function ProductVisual({ type = "box", className = "" }: { type?: RelatedProduct["art"] | "mug" | "card"; className?: string }) {
  const label = {
    box: "Best Sister Ever",
    mug: "mama",
    candle: "Amazing",
    card: "just for you",
    necklace: "A",
    decor: "Dried florals",
  }[type];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF0DA] ${className}`}>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#EC4C84]/20 blur-2xl" />
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/80 bg-white/70 p-5 text-center shadow-sm backdrop-blur">
        <p className="text-2xl font-semibold text-[#EC4C84]" style={serifStyle}>{label}</p>
        <p className="mt-1 text-xs text-[#9D8F98]">signature handmade detail</p>
      </div>
    </div>
  );
}

function ProductGallery({ product }: { product: DetailProduct }) {
  const fallbackThumbs: Array<RelatedProduct["art"] | "mug" | "card"> = [product.art, "candle", "mug", "card", "decor"];
  const images = product.images.slice(0, 5);

  return (
    <section>
      <div className="relative overflow-hidden rounded-2xl border border-[#F7D9E2] bg-[#FFF5F7] shadow-sm shadow-pink-100">
        {product.badge ? (
          <span className="absolute left-5 top-5 z-10 rounded-full border border-[#EC4C84] bg-[#FFF5F7] px-4 py-2 text-xs font-bold text-[#EC4C84]">{product.badge}</span>
        ) : null}
        <button className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center rounded-full bg-white text-[#1F1720] shadow-sm">
          <Heart className="h-6 w-6" />
        </button>
        <button className="absolute left-5 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1F1720] shadow-sm">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button className="absolute right-5 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1F1720] shadow-sm">
          <ChevronRight className="h-6 w-6" />
        </button>
        {images[0] ? (
          <img alt={product.title} className="aspect-square w-full object-cover" src={images[0]} />
        ) : (
          <ProductVisual className="aspect-square rounded-none" type={product.art} />
        )}
      </div>
      <div className="mt-4 grid grid-cols-5 gap-4">
        {(images.length > 0 ? images : fallbackThumbs).map((thumb, index) => (
          <div
            className={`relative overflow-hidden rounded-xl border-2 ${index === 0 ? "border-[#EC4C84]" : "border-transparent"}`}
            key={`${thumb}-${index}`}
          >
            {images.includes(thumb) ? (
              <img alt={`${product.title} ${index + 1}`} className="aspect-square w-full object-cover" src={thumb} />
            ) : (
              <ProductVisual className="aspect-square rounded-none" type={thumb as RelatedProduct["art"] | "mug" | "card"} />
            )}
            {index === 4 && product.images.length > 5 ? (
              <div className="absolute inset-0 grid place-items-center bg-[#1F1720]/45 text-2xl font-bold text-white">+{product.images.length - 5}</div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function Stars({ small = false }: { small?: boolean }) {
  return (
    <span className="flex text-[#F2B84B]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star className={`${small ? "h-4 w-4" : "h-5 w-5"} fill-current`} key={index} />
      ))}
    </span>
  );
}

function ProductInfoPanel({
  addToCartMessage,
  addToCartStatus,
  onAddToCart,
  onQuantityChange,
  product,
  quantity,
}: {
  addToCartMessage: string | null;
  addToCartStatus: "idle" | "loading" | "success" | "error";
  onAddToCart: () => void;
  onQuantityChange: (quantity: number) => void;
  product: DetailProduct;
  quantity: number;
}) {
  return (
    <section className="lg:pl-6">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#EC4C84]">Made just for you</p>
      <h1 className="mt-4 text-5xl font-semibold leading-tight text-[#1F1720]" style={serifStyle}>
        {product.title}
      </h1>
      <p className="mt-3 text-lg text-[#6F6570]">{product.subtitle}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="font-bold text-[#1F1720]">4.9</span>
        <Stars small />
        <span className="text-sm text-[#6F6570]">(120 reviews)</span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="text-3xl font-bold text-[#1F1720]">{product.price}</span>
        {product.oldPrice ? <span className="text-lg text-[#9D8F98] line-through">{product.oldPrice}</span> : null}
        {product.oldPrice ? (
          <span className="rounded-full bg-[#FDECEF] px-4 py-2 text-sm font-bold text-[#EC4C84]">Special price</span>
        ) : null}
      </div>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-[#6F6570]">
        {product.description}
      </p>
      <FeatureIcons />
      <PersonalizationForm />
      <AccordionRows />
      <ActionButtons
        addToCartMessage={addToCartMessage}
        addToCartStatus={addToCartStatus}
        canAddToCart={Boolean(product.id)}
        onAddToCart={onAddToCart}
        onQuantityChange={onQuantityChange}
        quantity={quantity}
      />
      <DeliveryNote />
    </section>
  );
}

function FeatureIcons() {
  const items: Array<[string, typeof Heart]> = [
    ["Handmade with love", Heart],
    ["Packed with care", Gift],
    ["Made to order", PackageCheck],
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-8 text-sm font-bold text-[#1F1720]">
      {items.map(([label, Icon]) => (
        <span className="inline-flex items-center gap-2" key={label}>
          <Icon className="h-5 w-5 text-[#EC4C84]" />
          {label}
        </span>
      ))}
    </div>
  );
}

function PersonalizationForm() {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-3 font-bold text-[#1F1720]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#EC4C84] text-sm text-white">1</span>
        Personalize your gift
      </h2>
      <div className="mt-5 grid gap-5">
        <Field label="Name on mug *" value="Best Sister Ever" count="15/20" />
        <Field label="Gift message (on card)" value="just for you" count="11/80" />
        <div>
          <p className="mb-3 text-sm font-bold text-[#1F1720]">Accent color</p>
          <div className="flex gap-4">
            {["#EC4C84", "#E9CDBB", "#BFA9E8", "#BEC6B2"].map((color, index) => (
              <button className="grid h-11 w-11 place-items-center rounded-full" style={{ backgroundColor: color }} key={color}>
                {index === 0 ? <Check className="h-5 w-5 text-white" /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ count, label, value }: { count: string; label: string; value: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
      {label}
      <div className="flex h-12 items-center rounded-xl border border-[#F7D9E2] bg-white px-4">
        <input className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#6F6570] outline-none" defaultValue={value} />
        <span className="text-xs text-[#9D8F98]">{count}</span>
      </div>
    </label>
  );
}

function AccordionRows() {
  return (
    <div className="mt-7 divide-y divide-[#F7D9E2] border-y border-[#F7D9E2]">
      {[
        ["2", "Add a special touch (optional)"],
        ["3", "Choose your gift box style"],
      ].map(([number, label]) => (
        <button className="flex w-full items-center justify-between py-5 text-left font-bold text-[#1F1720]" key={label}>
          <span className="flex items-center gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#FDECEF] text-xs text-[#EC4C84]">{number}</span>
            {label}
          </span>
          <ChevronDown className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

function QuantitySelector({
  disabled = false,
  onChange,
  quantity,
}: {
  disabled?: boolean;
  onChange: (quantity: number) => void;
  quantity: number;
}) {
  return (
    <div className="inline-flex h-14 items-center rounded-xl border border-[#F7D9E2] bg-white">
      <button
        className="grid h-14 w-14 place-items-center text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || quantity <= 1}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        type="button"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="grid h-14 w-12 place-items-center font-bold text-[#1F1720]">{quantity}</span>
      <button
        className="grid h-14 w-14 place-items-center text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={() => onChange(quantity + 1)}
        type="button"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function ActionButtons({
  addToCartMessage,
  addToCartStatus,
  canAddToCart,
  onAddToCart,
  onQuantityChange,
  quantity,
}: {
  addToCartMessage: string | null;
  addToCartStatus: "idle" | "loading" | "success" | "error";
  canAddToCart: boolean;
  onAddToCart: () => void;
  onQuantityChange: (quantity: number) => void;
  quantity: number;
}) {
  const isAdding = addToCartStatus === "loading";

  return (
    <div className="mt-7 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <QuantitySelector
          disabled={!canAddToCart || isAdding}
          onChange={onQuantityChange}
          quantity={quantity}
        />
        <button
          className="inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-[#EC4C84] text-base font-bold text-white shadow-lg shadow-pink-200 hover:bg-[#D93D73] disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none"
          disabled={!canAddToCart || isAdding}
          onClick={onAddToCart}
          type="button"
        >
          <ShoppingCart className="h-5 w-5" />
          {isAdding ? "Adding..." : canAddToCart ? "Add to cart" : "Product not available yet"}
        </button>
      </div>
      {addToCartMessage ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            addToCartStatus === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-700"
          }`}
        >
          {addToCartMessage}
        </p>
      ) : null}
      <button
        className="h-14 cursor-not-allowed rounded-xl bg-[#FDECEF] text-base font-bold text-[#C8A7B1]"
        disabled
        title="Coming soon"
        type="button"
      >
        Buy it now Soon
      </button>
    </div>
  );
}

function DeliveryNote() {
  return (
    <div className="mt-5 flex items-center gap-4 rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] p-5">
      <Truck className="h-8 w-8 text-[#EC4C84]" />
      <p className="text-sm leading-6 text-[#1F1720]">
        Order in the next <strong>5h 32m</strong> to get it between
        <br />
        <strong>May 20 - May 23</strong>
      </p>
    </div>
  );
}

function BenefitStrip() {
  const benefits: Array<[string, string, typeof Heart]> = [
    ["Free shipping", "on orders $75+", Truck],
    ["Handmade", "with love", Heart],
    ["Secure payments", "SSL encrypted", ShieldCheck],
    ["24/7 support", "We're here to help", Headphones],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 rounded-2xl border border-[#F7D9E2] bg-[#FFF5F7] p-6 md:grid-cols-4">
        {benefits.map(([title, subtitle, Icon]) => (
          <div className="flex items-center gap-4 md:border-r md:border-[#F7D9E2] md:last:border-r-0" key={title}>
            <Icon className="h-8 w-8 shrink-0 text-[#EC4C84]" />
            <div>
              <p className="font-bold text-[#1F1720]">{title}</p>
              <p className="text-sm text-[#6F6570]">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: RelatedProduct }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
      <div className="relative">
        <ProductVisual className="aspect-[1.15/1] rounded-none" type={product.art} />
        {product.badge ? <span className="absolute left-3 top-3 rounded-full bg-[#FFF5F7] px-3 py-1 text-xs font-bold text-[#EC4C84]">{product.badge}</span> : null}
        <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-[#EC4C84] shadow-sm"><Heart className="h-4 w-4" /></button>
      </div>
      <div className="p-4">
        <h3 className="min-h-10 text-sm font-bold text-[#1F1720]">{product.title}</h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-bold text-[#1F1720]">
            {product.price} {product.oldPrice ? <span className="ml-1 text-sm font-medium text-[#9D8F98] line-through">{product.oldPrice}</span> : null}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#1F1720]"><Star className="h-4 w-4 fill-[#F2B84B] text-[#F2B84B]" /> {product.rating}</span>
        </div>
      </div>
    </div>
  );
}

function RelatedProductsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <h2 className="mb-7 text-center text-4xl font-semibold text-[#1F1720]" style={serifStyle}>You may also love <span className="text-[#EC4C84]">♡</span></h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => <ProductCard key={product.title} product={product} />)}
      </div>
    </section>
  );
}

function ReviewsSection() {
  const bars = [["5", "106", "90%"], ["4", "12", "28%"], ["3", "1", "8%"], ["2", "1", "6%"], ["1", "0", "2%"]];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-2xl border border-[#F7D9E2] bg-white p-6 shadow-sm shadow-pink-100 lg:grid-cols-[16rem_1fr]">
        <div>
          <h2 className="text-xl font-semibold text-[#1F1720]" style={serifStyle}>Customer reviews</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-5xl font-semibold text-[#1F1720]">4.9</span>
            <Stars />
          </div>
          <p className="mt-2 text-sm text-[#6F6570]">Based on 120 reviews</p>
          <div className="mt-5 grid gap-1">
            {bars.map(([label, value, width]) => (
              <div className="grid grid-cols-[1.5rem_1fr_2rem] items-center gap-2 text-xs text-[#6F6570]" key={label}>
                <span>{label}★</span>
                <span className="h-2 rounded-full bg-[#FDECEF]"><span className="block h-2 rounded-full bg-[#F2B84B]" style={{ width }} /></span>
                <span>{value}</span>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white">Write a review</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => <ReviewCard key={review.name} review={review} />)}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-[#F7D9E2] bg-white p-5">
      <Stars small />
      <p className="mt-4 min-h-24 text-sm leading-6 text-[#6F6570]">{review.text}</p>
      <div className="mt-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">{review.name.charAt(0)}</span>
        <div>
          <p className="text-sm font-bold text-[#1F1720]">{review.name}</p>
          <p className="text-xs text-[#6F6570]">Verified Buyer</p>
        </div>
      </div>
    </div>
  );
}

function NewsletterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="grid items-center gap-6 rounded-2xl border border-[#F7D9E2] bg-[#FFF5F7] p-6 md:grid-cols-[auto_1fr_1.4fr]">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200"><Mail className="h-10 w-10" /></span>
        <div>
          <h2 className="text-3xl font-semibold text-[#1F1720]" style={serifStyle}>Stay in the loop</h2>
          <p className="mt-2 text-sm text-[#6F6570]">Be the first to know about new arrivals, exclusive offers, and special surprises.</p>
        </div>
        <div>
          <div className="flex gap-3 rounded-full border border-[#F7D9E2] bg-white p-1">
            <input className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Enter your email address" />
            <button className="rounded-full bg-[#EC4C84] px-7 text-sm font-bold text-white">Subscribe</button>
          </div>
          <p className="mt-2 px-4 text-xs text-[#9D8F98]">No spam, unsubscribe anytime.</p>
        </div>
      </div>
    </section>
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
    <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-8 shadow-sm shadow-pink-100">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
          <Gift className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[#1F1720]" style={serifStyle}>
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6F6570]">
          {description}
        </p>
        <Link className="mt-6 inline-flex h-12 items-center rounded-full bg-[#EC4C84] px-7 text-sm font-bold text-white shadow-lg shadow-pink-200" to="/products">
          Back to shop
        </Link>
      </div>
    </section>
  );
}

function ProductFooter() {
  return (
    <footer className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 border-t border-[#F7D9E2] px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_2fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EC4C84] text-white"><Gift className="h-5 w-5" /></span>
            <div>
              <p className="text-xl font-semibold text-[#1F1720]" style={serifStyle}>The AMY Shop</p>
              <p className="text-xs text-[#9D8F98]">Handmade custom gifts made with love</p>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            {["ig", "fb", "p", "tt"].map((item) => <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-xs font-bold text-white" key={item}>{item}</span>)}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ["Shop", "All Products", "Gift Boxes", "Candles", "Mugs", "Necklaces", "Decor"],
            ["Customer Care", "Contact Us", "Shipping & Returns", "FAQ", "Track Your Order", "Gift Cards"],
            ["About", "Our Story", "Handmade Process", "Reviews", "Blog", "Wholesale"],
          ].map(([title, ...links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-[#1F1720]">{title}</h3>
              <div className="mt-3 grid gap-1 text-xs text-[#6F6570]">{links.map((link) => <span key={link}>{link}</span>)}</div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1F1720]">Let's keep in touch</h3>
          <p className="mt-3 text-xs leading-5 text-[#6F6570]">Join our newsletter for updates and sweet surprises.</p>
          <div className="mt-4 flex rounded-full border border-[#F7D9E2] p-1">
            <input className="min-w-0 flex-1 px-3 text-xs outline-none placeholder:text-[#9D8F98]" placeholder="Enter your email" />
            <button className="grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-white" type="button"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-[#9D8F98] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span>© 2025 The AMY Shop. All rights reserved.</span>
        <span className="flex gap-6"><span>Privacy Policy</span><span>Terms of Service</span></span>
      </div>
    </footer>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [apiProduct, setApiProduct] = useState<DetailProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addToCartStatus, setAddToCartStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [addToCartMessage, setAddToCartMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!slug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);
        const product = await productApi.getBySlug(slug);

        if (isMounted) {
          setApiProduct(mapApiProduct(product));
        }
      } catch (productError) {
        if (!isMounted) {
          return;
        }

        const normalizedError = normalizeApiError(productError);

        if (normalizedError.statusCode === 404) {
          setNotFound(true);
          setApiProduct(null);
        } else {
          setError(normalizedError.message);
          setApiProduct(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const product = useMemo(
    () => apiProduct ?? fallbackDetailProduct,
    [apiProduct],
  );

  const handleAddToCart = async () => {
    if (!product.id) {
      setAddToCartStatus("error");
      setAddToCartMessage("Product not available yet.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      setAddToCartStatus("loading");
      setAddToCartMessage(null);
      await cartApi.addItem(product.id, quantity);
      setAddToCartStatus("success");
      setAddToCartMessage("Added to cart.");
    } catch (cartError) {
      setAddToCartStatus("error");
      setAddToCartMessage(normalizeApiError(cartError).message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1720]">
      <AnnouncementBar />
      <ProductHeader />
      <main>
        {isLoading ? (
          <ProductStatePanel
            description="We are loading the latest product details from the catalog."
            title="Loading product"
          />
        ) : notFound ? (
          <ProductStatePanel
            description="This product could not be found in the live catalog."
            title="Product not found"
          />
        ) : (
          <>
            {error ? (
              <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
                <ProductStatePanel
                  description={`${error}. Showing a sample product while the live catalog is unavailable.`}
                  title="Product details are temporarily unavailable"
                />
              </div>
            ) : null}
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 text-sm text-[#6F6570]">
                <Link to="/">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/products">Shop</Link>
                <ChevronRight className="h-4 w-4" />
                <span>{product.category}</span>
                <ChevronRight className="h-4 w-4" />
                <span>{product.title}</span>
              </div>
              <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.82fr]">
                <ProductGallery product={product} />
                <ProductInfoPanel
                  addToCartMessage={addToCartMessage}
                  addToCartStatus={addToCartStatus}
                  onAddToCart={() => void handleAddToCart()}
                  onQuantityChange={(nextQuantity) => {
                    setQuantity(nextQuantity);
                    setAddToCartStatus("idle");
                    setAddToCartMessage(null);
                  }}
                  product={product}
                  quantity={quantity}
                />
              </div>
            </div>
            <BenefitStrip />
            <RelatedProductsSection />
            <ReviewsSection />
            <NewsletterSection />
          </>
        )}
      </main>
      <ProductFooter />
    </div>
  );
}
