import { ArrowRight, Gift, PackageCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { normalizeApiError } from "../../lib/apiError";
import { productApi, type PublicProduct } from "../../services/productApi";
import { formatCurrency } from "../../utils/formatCurrency";

const serifStyle = { fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif' };

const getPrimaryImage = (product: PublicProduct) =>
  product.images?.find((image) => image.isPrimary)?.imageUrl ?? product.images?.[0]?.imageUrl;

function HeroSection({ product }: { product?: PublicProduct }) {
  const imageUrl = product ? getPrimaryImage(product) : undefined;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-7 sm:px-6 sm:pt-10 lg:px-8">
      <div className="grid overflow-hidden rounded-[2rem] border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF0F4] shadow-[0_28px_90px_rgba(143,64,88,0.13)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#F7D9E2] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#EC4C84] shadow-sm shadow-pink-100">
            <Sparkles className="h-3.5 w-3.5" /> Gifts for meaningful moments
          </span>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-tight text-[#1F1720] sm:text-6xl" style={serifStyle}>
            Thoughtful gifts, chosen with heart.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#6F6570] sm:text-lg">
            Discover The AMY Shop’s currently available gifts for birthdays, celebrations, and everyday moments worth remembering.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#EC4C84] px-7 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-[#D93D73]" to="/products">
              Shop gifts <ArrowRight className="h-4 w-4" />
            </Link>
            <a className="inline-flex min-h-12 items-center rounded-full px-4 text-sm font-bold text-[#6F6570] hover:bg-white hover:text-[#EC4C84]" href="#featured-gifts">
              Explore the collection
            </a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#6F6570]">
            <span className="inline-flex items-center gap-2"><PackageCheck className="h-4 w-4 text-[#EC4C84]" /> Gift-ready experience</span>
            <span className="inline-flex items-center gap-2"><Gift className="h-4 w-4 text-[#EC4C84]" /> Live catalog selections</span>
          </div>
        </div>

        <div className="relative grid min-h-[25rem] place-items-center overflow-hidden bg-[radial-gradient(circle_at_20%_80%,rgba(236,76,132,0.24),transparent_15rem),linear-gradient(145deg,#fff6f8,#ffe4ec)] p-7 sm:p-10 lg:min-h-[38rem]">
          <div className="absolute -right-16 top-8 h-56 w-56 rounded-full bg-[#F7B8C8]/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-white/80 blur-3xl" />
          {product && imageUrl && !imageFailed ? (
            <Link className="group relative w-full max-w-md" to={`/products/${product.slug}`}>
              <div className="rotate-2 overflow-hidden rounded-[1.75rem] border border-white/90 bg-white p-5 shadow-[0_32px_90px_rgba(143,64,88,0.22)] transition duration-300 group-hover:rotate-0">
                <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#FFF9FA] to-white">
                  <img alt={product.name} className="h-full w-full object-contain p-5" onError={() => setImageFailed(true)} src={imageUrl} />
                </div>
                <div className="flex items-end justify-between gap-4 px-2 pb-1 pt-5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#EC4C84]">Featured gift</p>
                    <p className="mt-1 truncate text-lg font-bold text-[#1F1720]">{product.name}</p>
                  </div>
                  <p className="shrink-0 font-bold text-[#1F1720]">{formatCurrency(product.price)}</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative grid aspect-square w-full max-w-md place-items-center rounded-[1.75rem] border border-white bg-white/80 text-center shadow-[0_32px_90px_rgba(143,64,88,0.18)] backdrop-blur">
              <div>
                <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
                  <Gift className="h-11 w-11" />
                </span>
                <p className="mt-6 text-3xl font-semibold text-[#1F1720]" style={serifStyle}>A gift chosen for them</p>
                <p className="mt-2 text-sm text-[#6F6570]">Browse the latest available collection.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: PublicProduct }) {
  const imageUrl = getPrimaryImage(product);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link className="group overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100 transition hover:-translate-y-1 hover:shadow-lg" to={`/products/${product.slug}`}>
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF0F3]">
        {imageUrl && !imageFailed ? (
          <img alt={product.name} className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]" onError={() => setImageFailed(true)} src={imageUrl} />
        ) : (
          <div className="grid h-full place-items-center text-center text-[#EC4C84]"><div><Gift className="mx-auto h-9 w-9" /><p className="mt-2 text-sm font-semibold">Image coming soon</p></div></div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#EC4C84]">{product.category?.name || "Gift"}</p>
        <h3 className="mt-2 line-clamp-2 font-bold text-[#1F1720]">{product.name}</h3>
        <p className="mt-3 font-bold text-[#1F1720]">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  );
}

function FeaturedProducts({ error, loading, products }: { error: string; loading: boolean; products: PublicProduct[] }) {
  return (
    <section className="mx-auto max-w-7xl scroll-mt-32 px-4 py-14 sm:px-6 lg:px-8" id="featured-gifts">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">From the live catalog</p>
          <h2 className="mt-2 text-4xl font-semibold text-[#1F1720]" style={serifStyle}>Gifts available now</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F6570]">A closer look at items currently available from The AMY Shop.</p>
        </div>
        <Link className="hidden items-center gap-2 text-sm font-bold text-[#EC4C84] sm:inline-flex" to="/products">Shop all <ArrowRight className="h-4 w-4" /></Link>
      </div>
      {loading ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-10 text-center text-[#6F6570]">Loading available gifts...</div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{error}</div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-10 text-center"><Gift className="mx-auto h-9 w-9 text-[#EC4C84]" /><p className="mt-3 font-bold">No gifts are available yet.</p><p className="mt-1 text-sm text-[#6F6570]">Please check back after the catalog is updated.</p></div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      )}
    </section>
  );
}

function PersonalTouchNotice() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-[#F7D9E2] bg-[#FFF5F7] px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#EC4C84]">A personal touch is on the way.</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6F6570]">More personalization options are being prepared. For now, explore the gifts currently available in our shop.</p>
        </div>
        <Link className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#EC4C84] bg-white px-5 py-2.5 text-sm font-bold text-[#EC4C84] sm:self-auto" to="/products">
          Browse gifts <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function HomePage() {
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

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-[#FFFDFB] text-[#1F1720]">
      <HeroSection product={products[0]} />
      <FeaturedProducts error={error} loading={loading} products={products} />
      <PersonalTouchNotice />
    </div>
  );
}
