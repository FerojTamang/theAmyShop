import {
  ArrowRight,
  Gift,
  Heart,
  Menu,
  PackageCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { normalizeApiError } from "../../lib/apiError";
import { productApi, type PublicProduct } from "../../services/productApi";
import { formatCurrency } from "../../utils/formatCurrency";

const serifStyle = { fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif' };

const getPrimaryImage = (product: PublicProduct) =>
  product.images?.find((image) => image.isPrimary)?.imageUrl ?? product.images?.[0]?.imageUrl;

function AnnouncementBar() {
  return (
    <div className="border-b border-[#F7D9E2] bg-[#FFF5F7]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs font-medium text-[#6F6570] sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 text-[#EC4C84]" /> Handmade with love.</span>
        <span className="hidden items-center gap-2 sm:inline-flex"><Truck className="h-4 w-4 text-[#EC4C84]" /> Free standard shipping on every order.</span>
      </div>
    </div>
  );
}

function HomeHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#F7D9E2]/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" to="/">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EC4C84] text-white"><Gift className="h-6 w-6" /></span>
          <span className="min-w-0"><span className="block truncate text-xl font-semibold" style={serifStyle}>The AMY Shop</span><span className="hidden text-xs text-[#9D8F98] sm:block">Handmade gifts</span></span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-[#6F6570] md:flex">
          <Link className="text-[#EC4C84]" to="/">Home</Link><Link to="/products">Shop</Link><Link to="/orders">Orders</Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link aria-label="Account" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#FFF5F7]" to="/account"><UserRound className="h-5 w-5" /></Link>
          <Link aria-label="Cart" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#FFF5F7]" to="/cart"><ShoppingBag className="h-5 w-5" /></Link>
          <button aria-expanded={open} aria-label="Toggle navigation" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#FFF5F7] md:hidden" onClick={() => setOpen((value) => !value)} type="button">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open ? <nav className="grid gap-1 border-t border-[#F7D9E2] px-4 py-3 text-sm font-semibold md:hidden"><Link className="rounded-lg bg-[#FFF5F7] px-3 py-2 text-[#EC4C84]" onClick={() => setOpen(false)} to="/">Home</Link><Link className="rounded-lg px-3 py-2 hover:bg-[#FFF5F7]" onClick={() => setOpen(false)} to="/products">Shop</Link><Link className="rounded-lg px-3 py-2 hover:bg-[#FFF5F7]" onClick={() => setOpen(false)} to="/orders">Orders</Link></nav> : null}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[1.8rem] border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF1F4] shadow-[0_24px_80px_rgba(236,76,132,0.12)] lg:grid-cols-[1fr_0.85fr]">
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14">
          <span className="w-fit rounded-full border border-[#F7D9E2] bg-[#FDECEF] px-4 py-2 text-xs font-semibold text-[#EC4C84]">Handmade gifts</span>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl" style={serifStyle}>Thoughtful gifts with a handmade heart.</h1>
          <p className="mt-6 max-w-xl leading-7 text-[#6F6570]">Browse the live The AMY Shop catalog for meaningful creations made to celebrate special moments.</p>
          <Link className="mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#EC4C84] px-7 text-sm font-bold text-white shadow-lg shadow-pink-200 hover:bg-[#D93D73]" to="/products">Shop available gifts <ArrowRight className="h-4 w-4" /></Link>
          <div className="mt-9 flex flex-wrap gap-4 text-sm font-semibold text-[#6F6570]">
            <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 text-[#EC4C84]" /> Handmade with care</span>
            <span className="inline-flex items-center gap-2"><PackageCheck className="h-4 w-4 text-[#EC4C84]" /> Gift-ready experience</span>
            <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-[#EC4C84]" /> Free standard shipping</span>
          </div>
        </div>
        <div className="relative grid min-h-[24rem] place-items-center overflow-hidden bg-[radial-gradient(circle_at_20%_75%,rgba(236,76,132,0.22),transparent_14rem),linear-gradient(135deg,#fff,#ffe3eb)] p-8 lg:min-h-[34rem]">
          <div className="absolute -right-10 top-8 h-44 w-44 rounded-full bg-[#F7B8C8]/35 blur-2xl" />
          <div className="relative w-full max-w-md rotate-2 rounded-[1.5rem] border border-[#eebbc8] bg-[#efb3bf] p-5 shadow-[0_30px_90px_rgba(143,64,88,0.22)]">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-[#FFF7F9] via-white to-[#FFF0DA] p-7">
              <div className="grid h-full place-items-center rounded-2xl border border-white bg-white/65 text-center shadow-sm backdrop-blur">
                <div><Gift className="mx-auto h-16 w-16 text-[#EC4C84]" /><p className="mt-5 text-3xl text-[#EC4C84]" style={serifStyle}>made with love</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: PublicProduct }) {
  const imageUrl = getPrimaryImage(product);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100 transition hover:-translate-y-1 hover:shadow-lg" to={`/products/${product.slug}`}>
      <div className="aspect-square bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF0F3]">
        {imageUrl && !imageFailed ? <img alt={product.name} className="h-full w-full object-contain p-3" onError={() => setImageFailed(true)} src={imageUrl} /> : <div className="grid h-full place-items-center text-center text-[#EC4C84]"><div><Gift className="mx-auto h-9 w-9" /><p className="mt-2 text-sm font-semibold">Image coming soon</p></div></div>}
      </div>
      <div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#EC4C84]">{product.category?.name || "Handmade gift"}</p><h3 className="mt-2 font-bold">{product.name}</h3><p className="mt-3 font-bold">{formatCurrency(product.price)}</p></div>
    </Link>
  );
}

function FeaturedProducts() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    productApi.list({ page: 1, limit: 5 }).then((result) => {
      if (active) setProducts(result.products);
    }).catch((loadError) => {
      if (active) setError(normalizeApiError(loadError).message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">Live catalog</p><h2 className="mt-2 text-4xl font-semibold" style={serifStyle}>Available gifts</h2></div><Link className="hidden items-center gap-2 text-sm font-bold text-[#EC4C84] sm:inline-flex" to="/products">View all <ArrowRight className="h-4 w-4" /></Link></div>
      {loading ? <div className="mt-8 rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-10 text-center text-[#6F6570]">Loading products...</div> : error ? <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{error}</div> : products.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-10 text-center"><Gift className="mx-auto h-9 w-9 text-[#EC4C84]" /><p className="mt-3 font-bold">No products are available yet.</p><p className="mt-1 text-sm text-[#6F6570]">Please check back after the catalog is updated.</p></div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
    </section>
  );
}

function CustomOrdersNotice() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#F7D9E2] bg-[#FFF5F7] p-8 text-center sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">Custom orders</p><h2 className="mt-3 text-3xl font-semibold" style={serifStyle}>Personalized ordering is coming soon.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6F6570]">The storefront does not currently save customization selections. For custom gift requests, contact us after placing your order.</p><Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#EC4C84] px-6 py-3 text-sm font-bold text-white" to="/products">Browse available products <ArrowRight className="h-4 w-4" /></Link></div>
    </section>
  );
}

function HomeFooter() {
  return <footer className="border-t border-[#F7D9E2] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-sm text-[#6F6570] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span className="inline-flex items-center gap-2 font-bold text-[#1F1720]"><Gift className="h-5 w-5 text-[#EC4C84]" /> The AMY Shop</span><nav className="flex gap-5"><Link to="/products">Shop</Link><Link to="/orders">Orders</Link><Link to="/account">Account</Link></nav><span>© {new Date().getFullYear()} The AMY Shop</span></div></footer>;
}

export function HomePage() {
  return <div className="min-h-screen bg-[#FFFDFB] text-[#1F1720]"><AnnouncementBar /><HomeHeader /><HeroSection /><FeaturedProducts /><CustomOrdersNotice /><HomeFooter /></div>;
}
