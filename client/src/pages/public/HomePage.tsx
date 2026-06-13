import {
  ArrowRight,
  ChevronRight,
  Gift,
  Headphones,
  Heart,
  Mail,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const pink = {
  primary: "#EC4C84",
  hover: "#D93D73",
  blush: "#FFF5F7",
  surface: "#FDECEF",
  border: "#F7D9E2",
  text: "#1F1720",
  secondary: "#6F6570",
  muted: "#9D8F98",
  success: "#39B86D",
  amber: "#F2B84B",
};

const categories = [
  { title: "Gift Boxes", subtitle: "Curated with love", art: "box" },
  { title: "Candles", subtitle: "Hand-poured goodness", art: "candle" },
  { title: "Mugs", subtitle: "Sip with love", art: "mug" },
  { title: "Personalized Keepsakes", subtitle: "Treasures to hold", art: "frame" },
  { title: "Handmade Decor", subtitle: "For every space", art: "decor" },
];

const products = [
  {
    title: "Relax & Unwind Gift Box",
    badge: "Bestseller",
    price: "$48.00",
    oldPrice: "$60.00",
    rating: "4.9",
    art: "box",
  },
  {
    title: "Personalized Name Necklace",
    badge: "10% off",
    price: "$36.00",
    oldPrice: "$40.00",
    rating: "4.8",
    art: "necklace",
  },
  {
    title: "Custom Embroidered Hoop",
    badge: "New",
    price: "$42.00",
    oldPrice: "",
    rating: "4.9",
    art: "hoop",
  },
  {
    title: "Best Friend Mug",
    badge: "Bestseller",
    price: "$24.00",
    oldPrice: "$28.00",
    rating: "4.9",
    art: "mug",
  },
  {
    title: "Scented Soy Candle",
    badge: "",
    price: "$18.00",
    oldPrice: "",
    rating: "4.8",
    art: "candle",
  },
];

const testimonials = [
  {
    text: "The gift box was absolutely perfect. My friend cried happy tears. You can feel the love and care in every detail.",
    name: "Sarah J.",
  },
  {
    text: "Beautifully packaged and amazing quality. I will definitely be ordering again for all my special occasions.",
    name: "Emily R.",
  },
  {
    text: "The custom necklace is stunning and so meaningful. It exceeded my expectations!",
    name: "Jessica M.",
  },
];

const serifStyle = {
  fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
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

function HomeHeader() {
  return (
    <header className="border-b border-[#F7D9E2]/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-fit items-center gap-3" to="/">
          <span className="grid h-13 w-13 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
            <Gift className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-2xl font-semibold text-[#1F1720]" style={serifStyle}>
              The AMY Shop
            </span>
            <span className="text-xs font-medium text-[#9D8F98]">
              Handmade custom gifts
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          {["Home", "Shop", "Collections", "Orders", "About", "Contact"].map((item) => (
            <Link
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                item === "Home"
                  ? "bg-[#FDECEF] text-[#EC4C84]"
                  : "text-[#6F6570] hover:bg-[#FFF5F7] hover:text-[#EC4C84]"
              }`}
              key={item}
              to={item === "Shop" ? "/products" : item === "Orders" ? "/orders" : "/"}
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden h-10 w-48 items-center gap-2 rounded-full border border-[#F7D9E2] bg-white px-4 text-sm text-[#9D8F98] shadow-sm sm:flex">
          <input
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9D8F98]"
            placeholder="Search gifts..."
          />
          <Search className="h-4 w-4 text-[#1F1720]" />
        </div>
        <Link className="grid h-10 w-10 place-items-center rounded-full text-[#1F1720] hover:bg-[#FFF5F7]" to="/account">
          <UserRound className="h-5 w-5" />
        </Link>
        <Link className="relative grid h-10 w-10 place-items-center rounded-full text-[#1F1720] hover:bg-[#FFF5F7]" to="/cart">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-[#EC4C84] text-[10px] font-bold text-white">
            0
          </span>
        </Link>
      </div>
    </header>
  );
}

function VisualTile({ type, className = "" }: { type: string; className?: string }) {
  const content = {
    box: "Amazing",
    candle: "You are amazing",
    mug: "mama",
    frame: "Love grows here",
    decor: "soft stems",
    necklace: "A",
    hoop: "Ame & Love",
  }[type] ?? "Gift";

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF2DF] ${className}`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#F7B8C8]/45 blur-xl" />
      <div className="absolute -bottom-8 left-4 h-24 w-24 rounded-full bg-[#F2B84B]/18 blur-xl" />
      <div className="flex h-full min-h-36 items-end p-4">
        <div className="w-full rounded-2xl border border-white/85 bg-white/72 p-4 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold text-[#EC4C84]" style={serifStyle}>
            {content}
          </p>
          <p className="mt-1 text-xs text-[#9D8F98]">handmade detail</p>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[1.7rem] border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF1F4] shadow-[0_24px_80px_rgba(236,76,132,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
          <span className="w-fit rounded-full border border-[#F7D9E2] bg-[#FDECEF] px-4 py-2 text-xs font-semibold text-[#EC4C84]">
            Handmade custom gifts
          </span>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[0.98] tracking-tight text-[#1F1720] sm:text-6xl lg:text-7xl" style={serifStyle}>
            Thoughtful gifts with a handmade heart.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#6F6570]">
            Personalized keepsakes, custom gift boxes, and meaningful creations
            made to celebrate life's special moments.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#EC4C84] px-7 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-[#D93D73]"
              to="/products"
            >
              Shop all gifts <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#EC4C84] bg-white px-7 text-sm font-bold text-[#EC4C84] transition hover:bg-[#FFF5F7]"
              to="/register"
            >
              Create a custom gift
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex -space-x-3">
              {["S", "E", "J", "M", "A"].map((avatar) => (
                <span
                  className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#FDECEF] text-xs font-bold text-[#EC4C84] shadow-sm"
                  key={avatar}
                >
                  {avatar}
                </span>
              ))}
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#EC4C84] text-lg font-bold text-white">
                +
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1F1720]">4.9</span>
                <span className="flex text-[#F2B84B]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star className="h-4 w-4 fill-current" key={index} />
                  ))}
                </span>
              </div>
              <p className="text-sm text-[#6F6570]">Loved by 10,000+ customers</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[32rem] overflow-hidden bg-[radial-gradient(circle_at_18%_75%,rgba(236,76,132,0.22),transparent_14rem),linear-gradient(135deg,#fff,#ffe3eb)] p-6 lg:p-10">
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#F7B8C8]/45 blur-xl" />
          <div className="absolute bottom-12 right-5 h-28 w-28 rounded-full border-[18px] border-[#F7B8C8]/60" />
          <div className="absolute left-8 top-12 rotate-[-8deg] text-4xl text-[#EC4C84]">♡</div>
          <div className="relative ml-auto max-w-xl rotate-2 rounded-[1.4rem] border border-[#eebbc8] bg-[#efb3bf] p-4 shadow-[0_30px_90px_rgba(143,64,88,0.22)]">
            <div className="grid aspect-[1.25/1] grid-cols-[1fr_0.85fr] gap-4 rounded-xl bg-[#F8D1D9] p-4">
              <VisualTile className="row-span-2 min-h-64" type="mug" />
              <VisualTile type="candle" />
              <div className="rounded-2xl bg-[#FDECEF] p-4 shadow-sm">
                <p className="text-3xl leading-tight text-[#EC4C84]" style={serifStyle}>
                  just for you
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-10 left-10 hidden rounded-full bg-[#F7B8C8]/70 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200 sm:block">
            soft blush wrapping
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureStrip() {
  const features = [
    { title: "Handmade with love", text: "Every item is crafted by hand with care", icon: Heart },
    { title: "Gift ready", text: "Beautiful packaging, ready to impress", icon: Gift },
    { title: "Secure payments", text: "Safe and trusted checkout with multiple options", icon: ShieldCheck },
    { title: "24/7 support", text: "We're here to help you anytime", icon: Headphones },
  ];

  return (
    <section className="border-y border-[#F7D9E2] bg-[#FFF5F7]">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div className={`flex gap-4 ${index ? "lg:border-l lg:border-[#F7D9E2] lg:pl-8" : ""}`} key={feature.title}>
              <Icon className="h-9 w-9 shrink-0 text-[#EC4C84]" />
              <div>
                <h3 className="text-sm font-bold text-[#1F1720]">{feature.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#6F6570]">{feature.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-semibold text-[#1F1720]" style={serifStyle}>
        {title} <span className="text-[#EC4C84]">♡</span>
      </h2>
      {subtitle ? <p className="mt-2 text-sm text-[#6F6570]">{subtitle}</p> : null}
    </div>
  );
}

function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading subtitle="Find the perfect gift for every occasion." title="Shop by category" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => (
          <div className="group overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100" key={category.title}>
            <VisualTile className="rounded-none" type={category.art} />
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <h3 className="text-sm font-bold text-[#1F1720]">{category.title}</h3>
                <p className="mt-1 text-xs text-[#6F6570]">{category.subtitle}</p>
              </div>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: (typeof products)[number] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
      <div className="relative">
        <VisualTile className="rounded-none" type={product.art} />
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#FFF5F7] px-3 py-1 text-[11px] font-bold text-[#EC4C84]">
            {product.badge}
          </span>
        ) : null}
        <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[#EC4C84] shadow-sm">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="min-h-10 text-sm font-semibold text-[#1F1720]">{product.title}</h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1F1720]">{product.price}</span>
            {product.oldPrice ? <span className="text-sm text-[#9D8F98] line-through">{product.oldPrice}</span> : null}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1F1720]">
            <Star className="h-4 w-4 fill-[#F2B84B] text-[#F2B84B]" /> {product.rating}
          </span>
        </div>
      </div>
    </div>
  );
}

function BestSellingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-4xl font-semibold text-[#1F1720]" style={serifStyle}>
          Best selling gifts
        </h2>
        <Link className="hidden items-center gap-2 text-sm font-bold text-[#EC4C84] sm:inline-flex" to="/products">
          View all products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.title} product={product} />
        ))}
      </div>
    </section>
  );
}

function CustomGiftCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-2xl border border-[#F7D9E2] bg-gradient-to-r from-white via-[#FFF5F7] to-white shadow-sm shadow-pink-100 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="p-7 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">
            Made just for you
          </p>
          <h2 className="mt-4 max-w-sm text-4xl font-semibold leading-tight text-[#1F1720]" style={serifStyle}>
            Create a custom gift they'll never forget.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#6F6570]">
            From names and dates to personal messages, we bring your ideas to life
            with care and creativity.
          </p>
          <Link className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#EC4C84] px-6 text-sm font-bold text-white shadow-lg shadow-pink-200 hover:bg-[#D93D73]" to="/register">
            Create your custom gift <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-7 grid gap-3 text-xs font-semibold text-[#6F6570] sm:grid-cols-3">
            {["Personalized just for them", "Beautifully packaged", "Made by hand"].map((item) => (
              <span className="inline-flex items-center gap-2" key={item}>
                <PackageCheck className="h-4 w-4 text-[#EC4C84]" /> {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3 lg:p-6">
          <VisualTile className="min-h-56 sm:min-h-full" type="box" />
          <VisualTile className="min-h-56 sm:min-h-full" type="candle" />
          <VisualTile className="min-h-56 sm:min-h-full" type="necklace" />
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
      <SectionHeading subtitle="Real stories from real customers." title="Our customers love us" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div className="rounded-2xl border border-[#F7D9E2] bg-white p-6 shadow-sm shadow-pink-100" key={testimonial.name}>
            <div className="flex text-[#F2B84B]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className="h-4 w-4 fill-current" key={index} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-[#6F6570]">"{testimonial.text}"</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#FDECEF] text-sm font-bold text-[#EC4C84]">
                {testimonial.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-bold text-[#1F1720]">{testimonial.name}</p>
                <p className="text-xs text-[#9D8F98]">Verified Buyer</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="grid items-center gap-6 rounded-2xl border border-[#F7D9E2] bg-[#FFF5F7] p-6 sm:grid-cols-[auto_1fr_1fr] lg:p-8">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
          <Mail className="h-10 w-10" />
        </span>
        <div>
          <h2 className="text-3xl font-semibold text-[#1F1720]" style={serifStyle}>
            Stay in the loop
          </h2>
          <p className="mt-2 text-sm text-[#6F6570]">
            Be the first to know about new arrivals, exclusive offers, and special surprises.
          </p>
        </div>
        <form className="grid gap-2">
          <div className="flex gap-3 rounded-full border border-[#F7D9E2] bg-white p-1">
            <input className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Enter your email address" />
            <button className="rounded-full bg-[#EC4C84] px-6 text-sm font-bold text-white hover:bg-[#D93D73]" type="button">
              Subscribe
            </button>
          </div>
          <p className="px-4 text-xs text-[#9D8F98]">No spam, unsubscribe anytime.</p>
        </form>
      </div>
    </section>
  );
}

function HomeFooter() {
  const columns = [
    { title: "Shop", links: ["All Products", "Gift Boxes", "Candles", "Mugs", "Keepsakes", "Decor"] },
    { title: "Customer Care", links: ["Contact Us", "Shipping & Returns", "FAQs", "Track Your Order", "Gift Cards"] },
    { title: "About", links: ["Our Story", "Handmade Process", "Reviews", "Blog", "Wholesale"] },
  ];

  return (
    <footer className="border-t border-[#F7D9E2] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_2fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#EC4C84] text-white">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-[#1F1720]" style={serifStyle}>
                The AMY Shop
              </p>
              <p className="text-xs text-[#9D8F98]">Handmade custom gifts made with love.</p>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            {["ig", "fb", "p", "tt"].map((item) => (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-xs font-bold text-white" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-[#1F1720]">{column.title}</h3>
              <div className="mt-3 grid gap-1 text-xs text-[#6F6570]">
                {column.links.map((link) => (
                  <span key={link}>{link}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1F1720]">Let's keep in touch</h3>
          <p className="mt-3 text-xs leading-5 text-[#6F6570]">
            Join our newsletter for updates and special offers.
          </p>
          <div className="mt-4 flex rounded-full border border-[#F7D9E2] p-1">
            <input className="min-w-0 flex-1 px-3 text-xs outline-none placeholder:text-[#9D8F98]" placeholder="Enter your email" />
            <button className="grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-white" type="button">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#F7D9E2] px-4 py-5 text-xs text-[#9D8F98] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span>(c) 2026 The AMY Shop. All rights reserved.</span>
        <span className="flex gap-6">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </span>
      </div>
    </footer>
  );
}

export function HomePage() {
  return (
    <div
      className="min-h-screen bg-[#FFFDFB] text-[#1F1720]"
      style={
        {
          "--amy-primary": pink.primary,
          "--amy-hover": pink.hover,
          "--amy-blush": pink.blush,
          "--amy-surface": pink.surface,
          "--amy-border": pink.border,
          "--amy-text": pink.text,
          "--amy-secondary": pink.secondary,
          "--amy-muted": pink.muted,
          "--amy-success": pink.success,
          "--amy-amber": pink.amber,
        } as React.CSSProperties
      }
    >
      <AnnouncementBar />
      <HomeHeader />
      <HeroSection />
      <FeatureStrip />
      <CategorySection />
      <BestSellingSection />
      <CustomGiftCTA />
      <TestimonialsSection />
      <NewsletterSection />
      <HomeFooter />
    </div>
  );
}
