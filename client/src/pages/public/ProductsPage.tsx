import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { normalizeApiError } from "../../lib/apiError";
import { categoryApi, type PublicCategory } from "../../services/categoryApi";
import { productApi, type PublicProduct } from "../../services/productApi";
import type { PaginatedMeta } from "../../types/api";
import { formatCurrency } from "../../utils/formatCurrency";

const serifStyle = { fontFamily: "Georgia, 'Times New Roman', serif" };
const PAGE_SIZE = 12;

const getPrimaryImage = (product: PublicProduct) =>
  product.images?.find((image) => image.isPrimary)?.imageUrl ??
  product.images?.[0]?.imageUrl;

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

function ProductsHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#F7D9E2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" to="/">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EC4C84] text-white"><Gift className="h-6 w-6" /></span>
          <span className="min-w-0"><span className="block truncate text-xl font-semibold" style={serifStyle}>The AMY Shop</span><span className="hidden text-xs text-[#9D8F98] sm:block">Handmade gifts</span></span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-[#6F6570] md:flex">
          <Link to="/">Home</Link><Link className="text-[#EC4C84]" to="/products">Shop</Link><Link to="/orders">Orders</Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link aria-label="Account" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#FFF5F7]" to="/account"><UserRound className="h-5 w-5" /></Link>
          <Link aria-label="Cart" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#FFF5F7]" to="/cart"><ShoppingBag className="h-5 w-5" /></Link>
          <button aria-expanded={open} aria-label="Toggle navigation" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#FFF5F7] md:hidden" onClick={() => setOpen((value) => !value)} type="button">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="grid gap-1 border-t border-[#F7D9E2] px-4 py-3 text-sm font-semibold md:hidden">
          <Link className="rounded-lg px-3 py-2 hover:bg-[#FFF5F7]" onClick={() => setOpen(false)} to="/">Home</Link>
          <Link className="rounded-lg bg-[#FFF5F7] px-3 py-2 text-[#EC4C84]" onClick={() => setOpen(false)} to="/products">Shop</Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-[#FFF5F7]" onClick={() => setOpen(false)} to="/orders">Orders</Link>
        </nav>
      ) : null}
    </header>
  );
}

function ProductCard({ product }: { product: PublicProduct }) {
  const imageUrl = getPrimaryImage(product);
  const [imageFailed, setImageFailed] = useState(false);
  const compareAt = Number(product.compareAtPrice);
  const hasCompareAt = Number.isFinite(compareAt) && compareAt > Number(product.price);

  return (
    <Link className="group overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100 transition hover:-translate-y-1 hover:shadow-lg" to={`/products/${product.slug}`}>
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF0F3]">
        {imageUrl && !imageFailed ? (
          <img alt={product.name} className="h-full w-full object-contain p-3" onError={() => setImageFailed(true)} src={imageUrl} />
        ) : (
          <div className="grid h-full place-items-center p-8 text-center text-[#EC4C84]"><div><Gift className="mx-auto h-10 w-10" /><p className="mt-3 text-sm font-semibold">Image coming soon</p></div></div>
        )}
        {product.isCustomizable ? <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#EC4C84] shadow-sm">Custom orders soon</span> : null}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#EC4C84]">{product.category?.name ?? "Handmade gift"}</p>
        <h2 className="mt-2 font-bold text-[#1F1720]">{product.name}</h2>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[#6F6570]">{product.shortDescription || product.description}</p>
        <p className="mt-4 font-bold text-[#1F1720]">{formatCurrency(product.price)} {hasCompareAt ? <span className="ml-2 text-sm font-normal text-[#9D8F98] line-through">{formatCurrency(compareAt)}</span> : null}</p>
      </div>
    </Link>
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [categorySlug, setCategorySlug] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    categoryApi.list().then((result) => {
      if (active) setCategories(result);
    }).catch(() => {
      if (active) setCategories([]);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await productApi.list({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          categorySlug: categorySlug || undefined,
        });
        if (active) {
          setProducts(result.products);
          setMeta(result.meta);
        }
      } catch (loadError) {
        if (active) {
          setProducts([]);
          setError(normalizeApiError(loadError).message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadProducts();
    return () => { active = false; };
  }, [categorySlug, page, search]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const chooseCategory = (slug: string) => {
    setCategorySlug(slug);
    setPage(1);
  };

  const pageNumbers = Array.from({ length: meta.totalPages }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === meta.totalPages || Math.abs(value - page) <= 1,
  );

  return (
    <div className="min-h-screen bg-white text-[#1F1720]">
      <AnnouncementBar />
      <ProductsHeader />
      <main className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">Shop</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl" style={serifStyle}>Handmade gifts, chosen with care</h1>
          <p className="mt-3 max-w-2xl text-[#6F6570]">Browse the products currently available in The AMY Shop catalog.</p>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          <button className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold ${categorySlug === "" ? "border-[#EC4C84] bg-[#EC4C84] text-white" : "border-[#F7D9E2] bg-white"}`} onClick={() => chooseCategory("")} type="button">All gifts</button>
          {categories.map((category) => (
            <button className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold ${categorySlug === category.slug ? "border-[#EC4C84] bg-[#EC4C84] text-white" : "border-[#F7D9E2] bg-white"}`} key={category.id} onClick={() => chooseCategory(category.slug)} type="button">{category.name}</button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#6F6570]">{loading ? "Loading catalog..." : `${meta.total} product${meta.total === 1 ? "" : "s"}`}</p>
          <form className="flex w-full max-w-md gap-2" onSubmit={submitSearch}>
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#F7D9E2] bg-white px-4">
              <Search className="h-4 w-4 text-[#9D8F98]" />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" onChange={(event) => setSearchInput(event.target.value)} placeholder="Search products" value={searchInput} />
            </label>
            <button className="rounded-full bg-[#EC4C84] px-5 text-sm font-bold text-white" type="submit">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-12 text-center text-[#6F6570]">Loading products...</div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><h2 className="text-xl font-bold text-red-800">Catalog unavailable</h2><p className="mt-2 text-sm text-red-700">{error}</p></div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-12 text-center"><Gift className="mx-auto h-10 w-10 text-[#EC4C84]" /><h2 className="mt-4 text-xl font-bold">No products found</h2><p className="mt-2 text-sm text-[#6F6570]">Try another search or category, or check back after products are added.</p></div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {!loading && !error && meta.totalPages > 1 ? (
          <nav aria-label="Product pages" className="mt-10 flex flex-wrap justify-center gap-2">
            <button aria-label="Previous page" className="grid h-10 w-10 place-items-center rounded-full border border-[#F7D9E2] disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button"><ChevronLeft className="h-4 w-4" /></button>
            {pageNumbers.map((pageNumber, index) => (
              <span className="contents" key={pageNumber}>{index > 0 && pageNumber - pageNumbers[index - 1] > 1 ? <span className="grid h-10 place-items-center px-1">…</span> : null}<button aria-current={pageNumber === page ? "page" : undefined} className={`grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-bold ${pageNumber === page ? "border-[#EC4C84] bg-[#EC4C84] text-white" : "border-[#F7D9E2] bg-white"}`} onClick={() => setPage(pageNumber)} type="button">{pageNumber}</button></span>
            ))}
            <button aria-label="Next page" className="grid h-10 w-10 place-items-center rounded-full border border-[#F7D9E2] disabled:opacity-40" disabled={page >= meta.totalPages} onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))} type="button"><ChevronRight className="h-4 w-4" /></button>
          </nav>
        ) : null}
      </main>
    </div>
  );
}
