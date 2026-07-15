import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Maximize2,
  Minus,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  Plus,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { normalizeApiError } from "../../lib/apiError";
import { cartApi } from "../../services/cartApi";
import { orderApi, type CustomerOrder } from "../../services/orderApi";
import { productApi, type PublicProduct } from "../../services/productApi";
import { reviewApi, type ProductReview, type ProductReviewListResult } from "../../services/reviewApi";
import { formatCurrency } from "../../utils/formatCurrency";

type ProductArt = "box" | "necklace" | "candle" | "decor";

type RelatedProduct = {
  title: string;
  badge?: string;
  price: string;
  oldPrice?: string;
  rating: string;
  art: ProductArt;
};

const relatedProducts: RelatedProduct[] = [];

type DetailProduct = {
  id?: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  art: ProductArt | "mug" | "card";
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

const formatDate = (date: string) => (
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
);

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

  const orderedImages = [...(product.images ?? [])].sort((left, right) =>
    Number(right.isPrimary) - Number(left.isPrimary),
  );

  return {
    id: product.id,
    title: product.name,
    category: product.category?.name ?? "Shop",
    subtitle:
      product.shortDescription ??
      product.category?.name ??
      "Thoughtful gifts with a handmade heart.",
    description: product.description,
    price: formatCurrency(product.price),
    oldPrice: hasCompareAt ? formatCurrency(compareAtPrice) : undefined,
    badge: product.isCustomizable
      ? "Personal touch planned"
      : product.isGiftSupported
        ? "Gift ready"
        : product.stockType === "READY_STOCK"
          ? "Ready to ship"
          : undefined,
    art: inferArt(product),
    images: orderedImages.map((image) => image.imageUrl),
    isCustomizable: product.isCustomizable,
    isGiftSupported: product.isGiftSupported,
    material: product.material,
    careInstructions: product.careInstructions,
    makingTime: product.makingTime,
  };
};

function ProductVisual({ type = "box", className = "" }: { type?: ProductArt | "mug" | "card"; className?: string }) {
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
  const images = product.images;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [isHoverCapable, setIsHoverCapable] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const selectedImage = images[selectedImageIndex];

  useEffect(() => {
    setSelectedImageIndex(0);
    setFailedImages(new Set());
    setIsHoveringImage(false);
    setIsLightboxOpen(false);
    setLightboxZoom(1);
  }, [product.id, product.title]);

  useEffect(() => {
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverCapability = () => setIsHoverCapable(hoverMedia.matches);

    updateHoverCapability();
    hoverMedia.addEventListener("change", updateHoverCapability);

    return () => hoverMedia.removeEventListener("change", updateHoverCapability);
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (event.key === "ArrowLeft" && images.length > 1) {
        setSelectedImageIndex((current) => (current - 1 + images.length) % images.length);
        setLightboxZoom(1);
      } else if (event.key === "ArrowRight" && images.length > 1) {
        setSelectedImageIndex((current) => (current + 1) % images.length);
        setLightboxZoom(1);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, isLightboxOpen]);

  const markImageFailed = (imageUrl: string) => {
    setFailedImages((current) => {
      const next = new Set(current);
      next.add(imageUrl);
      return next;
    });
  };

  const selectPreviousImage = () => {
    if (images.length > 1) {
      setSelectedImageIndex((current) => (current - 1 + images.length) % images.length);
      setLightboxZoom(1);
    }
  };

  const selectNextImage = () => {
    if (images.length > 1) {
      setSelectedImageIndex((current) => (current + 1) % images.length);
      setLightboxZoom(1);
    }
  };

  const handleImageMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isHoverCapable) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    setZoomOrigin({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  const openLightbox = () => {
    if (selectedImage && !failedImages.has(selectedImage)) {
      setLightboxZoom(1);
      setIsLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxZoom(1);
  };

  return (
    <section className="mx-auto w-full max-w-[560px]">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF5F7] shadow-sm shadow-pink-100">
        {product.badge ? (
          <span className="absolute left-5 top-5 z-10 rounded-full border border-[#EC4C84] bg-[#FFF5F7] px-4 py-2 text-xs font-bold text-[#EC4C84]">{product.badge}</span>
        ) : null}
        <button
          className="absolute right-5 top-5 z-20 grid h-12 w-12 place-items-center rounded-full bg-white text-[#1F1720] shadow-sm"
          onClick={(event) => event.stopPropagation()}
          type="button"
        >
          <Heart className="h-6 w-6" />
        </button>
        <button
          aria-label="View previous product image"
          className="absolute left-5 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1F1720] shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
          disabled={images.length <= 1}
          onClick={(event) => {
            event.stopPropagation();
            selectPreviousImage();
          }}
          type="button"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          aria-label="View next product image"
          className="absolute right-5 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1F1720] shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
          disabled={images.length <= 1}
          onClick={(event) => {
            event.stopPropagation();
            selectNextImage();
          }}
          type="button"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        {selectedImage && !failedImages.has(selectedImage) ? (
          <button
            aria-label={`Open larger view of ${product.title}`}
            className="absolute inset-0 cursor-zoom-in overflow-hidden"
            onClick={openLightbox}
            onMouseEnter={() => isHoverCapable && setIsHoveringImage(true)}
            onMouseLeave={() => setIsHoveringImage(false)}
            onMouseMove={handleImageMouseMove}
            type="button"
          >
            <img
              alt={`${product.title} image ${selectedImageIndex + 1}`}
              className="h-full w-full object-contain p-3 transition-transform duration-200 ease-out sm:p-5"
              onError={() => markImageFailed(selectedImage)}
              src={selectedImage}
              style={{
                transform: isHoverCapable && isHoveringImage ? "scale(1.9)" : "scale(1)",
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              }}
            />
          </button>
        ) : (
          <ProductVisual className="h-full w-full rounded-none" type={product.art} />
        )}
        {selectedImage && !failedImages.has(selectedImage) ? (
          <span className="pointer-events-none absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#F7D9E2] bg-white/90 px-3 py-2 text-[11px] font-bold text-[#6F6570] shadow-sm backdrop-blur">
            <Maximize2 className="h-3.5 w-3.5 text-[#EC4C84]" />
            {isHoverCapable ? "Hover to zoom Â· Click to view larger" : "Tap to view larger"}
          </span>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-5 gap-4">
        {(images.length > 0 ? images : fallbackThumbs).map((thumb, index) => (
          <button
            aria-label={images.length > 0 ? `View product image ${index + 1}` : undefined}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-gradient-to-br from-white to-[#FFF5F7] ${index === selectedImageIndex ? "border-[#EC4C84]" : "border-[#F7D9E2]"}`}
            key={`${thumb}-${index}`}
            onClick={() => {
              if (images.length > 0) {
                setSelectedImageIndex(index);
                setIsHoveringImage(false);
                setLightboxZoom(1);
              }
            }}
            type="button"
          >
            {images.includes(thumb) && !failedImages.has(thumb) ? (
              <img
                alt={`${product.title} thumbnail ${index + 1}`}
                className="h-full w-full object-contain p-1"
                onError={() => markImageFailed(thumb)}
                src={thumb}
              />
            ) : (
              <ProductVisual className="h-full w-full rounded-none" type={thumb as RelatedProduct["art"] | "mug" | "card"} />
            )}
          </button>
        ))}
      </div>
      {isLightboxOpen && selectedImage ? (
        <div
          aria-label={`${product.title} image viewer`}
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-[#1F1720]/85 p-3 backdrop-blur-md sm:p-6"
          onClick={closeLightbox}
          role="dialog"
        >
          <div
            className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF5F7] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7D9E2] bg-white/90 px-3 py-3 sm:px-5">
              <div>
                <p className="text-sm font-bold text-[#1F1720]">{product.title}</p>
                <p className="text-xs font-semibold text-[#9D8F98]">
                  Image {selectedImageIndex + 1} of {images.length} Â· {lightboxZoom.toFixed(1)}x
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Zoom out"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#6F6570] disabled:opacity-40"
                  disabled={lightboxZoom <= 1}
                  onClick={() => setLightboxZoom((current) => Math.max(1, current - 0.5))}
                  type="button"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  aria-label="Reset zoom"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#6F6570] disabled:opacity-40"
                  disabled={lightboxZoom === 1}
                  onClick={() => setLightboxZoom(1)}
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  aria-label="Zoom in"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#6F6570] disabled:opacity-40"
                  disabled={lightboxZoom >= 3}
                  onClick={() => setLightboxZoom((current) => Math.min(3, current + 0.5))}
                  type="button"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  aria-label="Close image viewer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-[#EC4C84] text-white shadow-sm"
                  onClick={closeLightbox}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF5F7]">
              <button
                aria-label="View previous image"
                className="absolute left-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#1F1720] shadow-lg disabled:opacity-40 sm:left-5 sm:h-12 sm:w-12"
                disabled={images.length <= 1}
                onClick={selectPreviousImage}
                type="button"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="flex h-full w-full items-center justify-center overflow-hidden p-12 sm:p-16">
                {failedImages.has(selectedImage) ? (
                  <ProductVisual className="h-full w-full max-w-3xl" type={product.art} />
                ) : (
                  <img
                    alt={`${product.title} enlarged image ${selectedImageIndex + 1}`}
                    className="h-full w-full object-contain transition-transform duration-200 ease-out"
                    onError={() => markImageFailed(selectedImage)}
                    src={selectedImage}
                    style={{ transform: `scale(${lightboxZoom})` }}
                  />
                )}
              </div>
              <button
                aria-label="View next image"
                className="absolute right-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#1F1720] shadow-lg disabled:opacity-40 sm:right-5 sm:h-12 sm:w-12"
                disabled={images.length <= 1}
                onClick={selectNextImage}
                type="button"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Stars({ rating = 5, small = false }: { rating?: number; small?: boolean }) {
  return (
    <span className="flex text-[#F2B84B]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          className={`${small ? "h-4 w-4" : "h-5 w-5"} ${index < Math.round(rating) ? "fill-current" : ""}`}
          key={index}
        />
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
  reviewSummary,
}: {
  addToCartMessage: string | null;
  addToCartStatus: "idle" | "loading" | "success" | "error";
  onAddToCart: () => void;
  onQuantityChange: (quantity: number) => void;
  product: DetailProduct;
  quantity: number;
  reviewSummary: ProductReviewListResult["summary"] | null;
}) {
  const averageRating = reviewSummary?.averageRating ?? 0;
  const reviewCount = reviewSummary?.reviewCount ?? 0;

  return (
    <section className="lg:pl-6">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#EC4C84]">Made just for you</p>
      <h1 className="mt-4 text-5xl font-semibold leading-tight text-[#1F1720]" style={serifStyle}>
        {product.title}
      </h1>
      <p className="mt-3 text-lg text-[#6F6570]">{product.subtitle}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="font-bold text-[#1F1720]">{averageRating ? averageRating.toFixed(1) : "New"}</span>
        <Stars rating={averageRating || 0} small />
        <span className="text-sm text-[#6F6570]">({reviewCount} reviews)</span>
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
      {product.isCustomizable ? <CustomizationNotice /> : null}
      <ActionButtons
        addToCartMessage={addToCartMessage}
        addToCartStatus={addToCartStatus}
        canAddToCart={Boolean(product.id)}
        onAddToCart={onAddToCart}
        onQuantityChange={onQuantityChange}
        quantity={quantity}
      />
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

function CustomizationNotice() {
  return (
    <section className="mt-6 rounded-xl border border-[#F7D9E2] bg-[#FFF9FA] px-4 py-3">
      <p className="text-sm leading-6 text-[#6F6570]">
        Personalization options vary by product. The available options for this gift are shown above.
      </p>
    </section>
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
    </div>
  );
}

function BenefitStrip() {
  const benefits: Array<[string, string, typeof Heart]> = [
    ["Free shipping", "on every order", Truck],
    ["Handmade", "with love", Heart],
    ["Cash on Delivery", "active at checkout", ShieldCheck],
    ["Order tracking", "from your account", ShoppingBag],
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

export function RelatedProductsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <h2 className="mb-7 text-center text-4xl font-semibold text-[#1F1720]" style={serifStyle}>You may also love <span className="text-[#EC4C84]">â™¡</span></h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => <ProductCard key={product.title} product={product} />)}
      </div>
    </section>
  );
}

function ReviewsSection({
  eligibleOrders,
  isAuthenticated,
  isLoading,
  isSubmitting,
  onReviewSubmit,
  productId,
  reviewComment,
  reviewError,
  reviewRating,
  reviewResult,
  reviewSuccess,
  selectedOrderId,
  setReviewComment,
  setReviewRating,
  setSelectedOrderId,
}: {
  eligibleOrders: CustomerOrder[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  onReviewSubmit: () => void;
  productId?: string;
  reviewComment: string;
  reviewError: string | null;
  reviewRating: number;
  reviewResult: ProductReviewListResult | null;
  reviewSuccess: string | null;
  selectedOrderId: string;
  setReviewComment: (value: string) => void;
  setReviewRating: (value: number) => void;
  setSelectedOrderId: (value: string) => void;
}) {
  const loadedReviews = reviewResult?.reviews ?? [];
  const summary = reviewResult?.summary ?? { averageRating: 0, reviewCount: 0 };
  const [ratingFilter, setRatingFilter] = useState<"ALL" | "5" | "4">("ALL");
  const [reviewSort, setReviewSort] = useState<"LATEST" | "TOP_RATED">("LATEST");
  const starDistribution = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((rating) => ({
      count: loadedReviews.filter((review) => review.rating === rating).length,
      rating,
    }));
    const highestCount = Math.max(...counts.map((item) => item.count), 1);

    return counts.map((item) => ({
      ...item,
      width: `${Math.round((item.count / highestCount) * 100)}%`,
    }));
  }, [loadedReviews]);
  const visibleReviews = useMemo(() => {
    const filteredReviews = loadedReviews.filter((review) => (
      ratingFilter === "ALL" ? true : review.rating === Number(ratingFilter)
    ));

    return [...filteredReviews].sort((first, second) => {
      if (reviewSort === "TOP_RATED") {
        return second.rating - first.rating || new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
      }

      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });
  }, [loadedReviews, ratingFilter, reviewSort]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-2xl border border-[#F7D9E2] bg-white p-6 shadow-sm shadow-pink-100 lg:grid-cols-[19rem_1fr]">
        <div>
          <h2 className="text-xl font-semibold text-[#1F1720]" style={serifStyle}>Customer reviews</h2>
          <div className="mt-4 rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-4">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-semibold leading-none text-[#1F1720]">{summary.averageRating ? summary.averageRating.toFixed(1) : "0.0"}</span>
              <span className="pb-1 text-sm font-bold text-[#6F6570]">/ 5</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Stars rating={summary.averageRating} />
              <span className="text-xs font-bold text-[#EC4C84]">{summary.reviewCount} approved reviews</span>
            </div>
            <div className="mt-5 grid gap-2">
              {starDistribution.map((item) => (
                <div className="grid grid-cols-[3.3rem_1fr_2rem] items-center gap-2 text-xs font-semibold text-[#6F6570]" key={item.rating}>
                  <span>{item.rating} star</span>
                  <span className="h-2 overflow-hidden rounded-full bg-[#FDECEF]">
                    <span className="block h-2 rounded-full bg-[#F2B84B]" style={{ width: item.width }} />
                  </span>
                  <span className="text-right">{item.count}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#9D8F98]">Based on customer reviews</p>
          </div>
          <div className="mt-6 rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] p-4">
            <p className="font-bold text-[#1F1720]">Write a review</p>
            {!productId ? (
              <p className="mt-2 text-sm text-[#6F6570]">Reviews are available only for live catalog products.</p>
            ) : !isAuthenticated ? (
              <Link className="mt-4 inline-flex rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white" to="/login">
                Login to review
              </Link>
            ) : eligibleOrders.length === 0 ? (
              <p className="mt-2 text-sm leading-6 text-[#6F6570]">
                You can review this product after a delivered order containing it is available.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                <select
                  className="h-11 rounded-xl border border-[#F7D9E2] bg-white px-3 text-sm font-semibold text-[#6F6570] outline-none"
                  onChange={(event) => setSelectedOrderId(event.target.value)}
                  value={selectedOrderId}
                >
                  {eligibleOrders.map((order) => (
                    <option key={order.id} value={order.id}>Order #{order.orderNumber}</option>
                  ))}
                </select>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D8F98]">Your rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        aria-label={`${rating} star rating`}
                        className="rounded-full p-1 text-[#F2B84B] transition hover:scale-105"
                        key={rating}
                        onClick={() => setReviewRating(rating)}
                        type="button"
                      >
                        <Star className={`h-7 w-7 ${rating <= reviewRating ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="min-h-24 rounded-xl border border-[#F7D9E2] bg-white px-3 py-3 text-sm outline-none placeholder:text-[#9D8F98]"
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Share your thoughts"
                  value={reviewComment}
                />
                <button
                  className="rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none"
                  disabled={isSubmitting}
                  onClick={onReviewSubmit}
                  type="button"
                >
                  {isSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </div>
            )}
            {reviewSuccess ? <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{reviewSuccess}</p> : null}
          </div>
        </div>
        <div>
          {isLoading ? (
            <ReviewState title="Loading reviews" description="Fetching approved product reviews." />
          ) : reviewError ? (
            <ReviewState title="Reviews unavailable" description={reviewError} />
          ) : loadedReviews.length === 0 ? (
            <ReviewState title="No reviews yet" description="Customer reviews will appear here once published." />
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { label: "All reviews", value: "ALL" as const },
                  { label: "5 Star", value: "5" as const },
                  { label: "4 Star", value: "4" as const },
                ].map((filter) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-xs font-bold ${
                      ratingFilter === filter.value
                        ? "border-[#EC4C84] bg-[#EC4C84] text-white"
                        : "border-[#F7D9E2] bg-white text-[#6F6570]"
                    }`}
                    key={filter.value}
                    onClick={() => setRatingFilter(filter.value)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
                {[
                  { label: "Latest", value: "LATEST" as const },
                  { label: "Top rated", value: "TOP_RATED" as const },
                ].map((sort) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-xs font-bold ${
                      reviewSort === sort.value
                        ? "border-[#1F1720] bg-[#1F1720] text-white"
                        : "border-[#F7D9E2] bg-white text-[#6F6570]"
                    }`}
                    key={sort.value}
                    onClick={() => setReviewSort(sort.value)}
                    type="button"
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
              {visibleReviews.length === 0 ? (
                <ReviewState title="No matching reviews" description="Try another rating filter to see more customer feedback." />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {visibleReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewState({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-6 text-center">
      <h3 className="font-bold text-[#1F1720]">{title}</h3>
      <p className="mt-2 text-sm text-[#6F6570]">{description}</p>
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  const customerName = review.user?.fullName ?? "Customer";
  const initials = customerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "C";
  const hasVerifiedOrder = Boolean(review.order?.id);

  return (
    <div className="rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">{initials}</span>
          <div>
            <p className="text-sm font-bold text-[#1F1720]">{customerName}</p>
            <p className="text-xs text-[#6F6570]">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        {hasVerifiedOrder ? (
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
            Verified purchase
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Stars rating={review.rating} small />
        {review.order?.orderNumber ? (
          <span className="rounded-full bg-[#FFF5F7] px-3 py-1 text-[11px] font-bold text-[#9D4867]">Order #{review.order.orderNumber}</span>
        ) : null}
      </div>
      <p className="mt-4 min-h-20 text-sm leading-6 text-[#6F6570]">{review.comment ?? "No written comment provided."}</p>
    </div>
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
  const [reviewResult, setReviewResult] = useState<ProductReviewListResult | null>(null);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [eligibleReviewOrders, setEligibleReviewOrders] = useState<CustomerOrder[]>([]);
  const [selectedReviewOrderId, setSelectedReviewOrderId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

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

  const product = apiProduct;

  const loadProductReviews = async (productId: string) => {
    try {
      setIsReviewsLoading(true);
      setReviewError(null);
      const result = await reviewApi.listProductReviews(productId, {
        limit: 20,
        page: 1,
      });
      setReviewResult(result);
    } catch (reviewsError) {
      setReviewError(normalizeApiError(reviewsError).message);
      setReviewResult(null);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!apiProduct?.id) {
      setReviewResult(null);
      setReviewError(null);
      setIsReviewsLoading(false);
      return;
    }

    void loadProductReviews(apiProduct.id);
  }, [apiProduct?.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadEligibleOrders(productId: string) {
      if (!isAuthenticated) {
        setEligibleReviewOrders([]);
        setSelectedReviewOrderId("");
        return;
      }

      try {
        const result = await orderApi.listMine({
          limit: 100,
          orderStatus: "DELIVERED",
          page: 1,
        });
        const eligibleOrders = result.orders.filter((order) => (
          order.items?.some((item) => item.productId === productId) ?? false
        ));

        if (!isMounted) {
          return;
        }

        setEligibleReviewOrders(eligibleOrders);
        setSelectedReviewOrderId((current) => (
          current && eligibleOrders.some((order) => order.id === current)
            ? current
            : eligibleOrders[0]?.id ?? ""
        ));
      } catch {
        if (isMounted) {
          setEligibleReviewOrders([]);
          setSelectedReviewOrderId("");
        }
      }
    }

    if (apiProduct?.id) {
      void loadEligibleOrders(apiProduct.id);
    } else {
      setEligibleReviewOrders([]);
      setSelectedReviewOrderId("");
    }

    return () => {
      isMounted = false;
    };
  }, [apiProduct?.id, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!product?.id) {
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

  const handleReviewSubmit = async () => {
    if (!apiProduct?.id) {
      setReviewError("Reviews are available only for live catalog products.");
      return;
    }

    if (!selectedReviewOrderId) {
      setReviewError("Select a delivered order for this product before reviewing.");
      return;
    }

    if (!Number.isInteger(reviewRating) || reviewRating < 1 || reviewRating > 5) {
      setReviewError("Rating must be between 1 and 5 stars.");
      return;
    }

    try {
      setIsReviewSubmitting(true);
      setReviewError(null);
      setReviewSuccess(null);
      await reviewApi.create({
        productId: apiProduct.id,
        orderId: selectedReviewOrderId,
        rating: reviewRating,
        ...(reviewComment.trim() && { comment: reviewComment.trim() }),
      });
      setReviewComment("");
      setReviewRating(5);
      setReviewSuccess("Your review was submitted and is waiting for approval.");
      await loadProductReviews(apiProduct.id);
    } catch (submitError) {
      setReviewError(normalizeApiError(submitError).message);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1720]">
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
        ) : error ? (
          <ProductStatePanel
            description={error}
            title="Product details are temporarily unavailable"
          />
        ) : !product ? (
          <ProductStatePanel
            description="This product is not available in the catalog."
            title="Product unavailable"
          />
        ) : (
          <>
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
                  reviewSummary={reviewResult?.summary ?? null}
                />
              </div>
            </div>
            <BenefitStrip />
            <ReviewsSection
              eligibleOrders={eligibleReviewOrders}
              isAuthenticated={isAuthenticated}
              isLoading={isReviewsLoading}
              isSubmitting={isReviewSubmitting}
              onReviewSubmit={() => void handleReviewSubmit()}
              productId={apiProduct?.id}
              reviewComment={reviewComment}
              reviewError={reviewError}
              reviewRating={reviewRating}
              reviewResult={reviewResult}
              reviewSuccess={reviewSuccess}
              selectedOrderId={selectedReviewOrderId}
              setReviewComment={setReviewComment}
              setReviewRating={setReviewRating}
              setSelectedOrderId={setSelectedReviewOrderId}
            />
          </>
        )}
      </main>
    </div>
  );
}
