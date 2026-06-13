import {
  ArrowRight,
  Check,
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
  Truck,
  UserRound,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type CartItem = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  customization: [string, string][];
  quantity: number;
  art: "mug" | "candle" | "necklace";
};

const cartItems: CartItem[] = [
  {
    id: "mug",
    name: "Personalized Mama Mug",
    subtitle: "11oz Ceramic Mug",
    price: "$24.00",
    customization: [
      ["Color", "White"],
      ["Personalization", "mama"],
      ["Gift Box", "Signature Pink Box"],
    ],
    quantity: 1,
    art: "mug",
  },
  {
    id: "candle",
    name: "Scented Soy Candle",
    subtitle: "Amazing Grace",
    price: "$18.00",
    customization: [
      ["Scent", "Amazing Grace"],
      ["Gift Box", "Signature Pink Box"],
    ],
    quantity: 1,
    art: "candle",
  },
  {
    id: "necklace",
    name: "Initial Necklace",
    subtitle: "Gold Plated - 16-18in",
    price: "$26.00",
    customization: [
      ["Initial", "A"],
      ["Gift Box", "Signature Pink Box"],
    ],
    quantity: 1,
    art: "necklace",
  },
];

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
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

function CheckoutHeader() {
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
          <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[#EC4C84] text-[10px] font-bold text-white">3</span>
        </Link>
      </div>
    </header>
  );
}

function ProductImage({ type }: { type: CartItem["art"] }) {
  const label = type === "mug" ? "mama" : type === "candle" ? "Amazing" : "A";

  return (
    <div className="relative h-44 w-56 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF0DA]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#EC4C84]/20 blur-xl" />
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/80 bg-white/70 p-4 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#EC4C84]" style={serifStyle}>{label}</p>
        <p className="mt-1 text-xs text-[#9D8F98]">signature gift detail</p>
      </div>
    </div>
  );
}

function QuantitySelector() {
  return (
    <div className="inline-flex h-11 items-center rounded-xl border border-[#F7D9E2] bg-white">
      <button className="grid h-11 w-11 place-items-center text-[#6F6570]"><Minus className="h-4 w-4" /></button>
      <span className="grid h-11 w-10 place-items-center text-sm font-bold text-[#1F1720]">1</span>
      <button className="grid h-11 w-11 place-items-center text-[#6F6570]"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

function CartItemCard({ item }: { item: CartItem }) {
  return (
    <div className="grid gap-5 border-b border-[#F7D9E2] py-6 md:grid-cols-[2rem_auto_1fr_auto]">
      <span className="mt-16 grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-white">
        <Check className="h-4 w-4" />
      </span>
      <ProductImage type={item.art} />
      <div className="py-2">
        <h2 className="text-lg font-bold text-[#1F1720]">{item.name}</h2>
        <p className="mt-1 text-sm text-[#6F6570]">{item.subtitle}</p>
        <div className="mt-5 grid gap-2 text-sm">
          {item.customization.map(([label, value]) => (
            <p className="grid grid-cols-[7rem_1fr] gap-3 text-[#6F6570]" key={label}>
              <span className="font-semibold text-[#1F1720]">{label}:</span>
              <span>{value}</span>
            </p>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-4 py-2 md:items-end">
        <p className="text-xl font-bold text-[#1F1720]">{item.price}</p>
        <div className="grid gap-3">
          <QuantitySelector />
          <div className="flex justify-end gap-4 text-xs font-semibold text-[#9D8F98]">
            <button className="underline">Edit</button>
            <span>|</span>
            <button className="underline">Remove</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FreeShippingBanner() {
  return (
    <div className="rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-[#6F6570]">
          You're <span className="text-[#EC4C84]">$15</span> away from FREE shipping!
        </p>
        <div className="min-w-0 flex-1">
          <div className="h-2 rounded-full bg-white">
            <div className="h-2 w-4/5 rounded-full bg-[#EC4C84]" />
          </div>
          <div className="mt-2 flex justify-between text-xs font-semibold text-[#EC4C84]">
            <span>$60</span>
            <span>$75</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CouponRewardsBox() {
  return (
    <section className="rounded-xl border border-[#F7D9E2] bg-white">
      <div className="flex items-center justify-between border-b border-[#F7D9E2] px-5 py-4">
        <h2 className="font-bold text-[#1F1720]">Have a coupon, referral or rewards?</h2>
        <ChevronRight className="h-4 w-4 -rotate-90 text-[#EC4C84]" />
      </div>
      <div className="grid grid-cols-3 border-b border-[#F7D9E2] text-center text-sm font-semibold text-[#6F6570]">
        <button className="border-b-2 border-[#EC4C84] py-4 text-[#EC4C84]">Coupon code</button>
        <button>Referral code</button>
        <button>Rewards</button>
      </div>
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
          <input className="h-12 rounded-xl border border-[#F7D9E2] px-4 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Enter coupon code" />
          <button className="rounded-xl bg-[#EC4C84] text-sm font-bold text-white shadow-lg shadow-pink-200">Apply</button>
        </div>
        <div className="mt-4 flex w-fit items-center gap-4 rounded-lg bg-[#FFF5F7] px-4 py-2 text-xs font-bold text-[#EC4C84]">
          <span>WELCOME15</span>
          <span>15% off applied</span>
          <span>x</span>
        </div>
      </div>
    </section>
  );
}

function CheckoutSteps() {
  return (
    <div className="grid gap-5">
      <Step title="Shipping address" number="1" action="Edit">
        <div className="w-full max-w-sm rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] p-4">
          <div className="mb-2 flex items-center gap-2">
            <p className="font-bold text-[#1F1720]">Emily Johnson</p>
            <span className="rounded bg-[#FDECEF] px-2 py-0.5 text-xs font-bold text-[#EC4C84]">Default</span>
            <Check className="ml-auto h-5 w-5 rounded-full bg-[#EC4C84] p-1 text-white" />
          </div>
          <p className="text-sm leading-6 text-[#6F6570]">123 Bloomfield Lane<br />San Diego, CA 92101<br />United States<br />(619) 555-0198</p>
        </div>
        <button className="mt-3 text-sm font-bold text-[#EC4C84]">+ Add a new address</button>
      </Step>
      <Step title="Shipping method" number="2">
        <RadioRow active label="Standard Shipping (3-5 business days)" value="FREE" />
        <RadioRow label="Expedited Shipping (2-3 business days)" value="$8.95" />
        <RadioRow label="Express Shipping (1-2 business days)" value="$14.95" />
      </Step>
      <Step title="Payment method" number="3">
        <RadioRow active label="Cash on Delivery" value="CASH_ON_DELIVERY" />
        <RadioRow disabled label="Khalti" value="Coming soon" />
        <RadioRow disabled label="eSewa" value="Coming soon" />
        <p className="mt-3 text-xs text-[#9D8F98]">
          Checkout currently accepts Cash on Delivery. Khalti and eSewa are shown for later once merchant verification is configured.
        </p>
      </Step>
    </div>
  );
}

function Step({ action, children, number, title }: { action?: string; children: ReactNode; number: string; title: string }) {
  return (
    <section className="grid grid-cols-[2rem_1fr] gap-4">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-sm font-bold text-white">{number}</span>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1F1720]">{title}</h2>
          {action ? <button className="text-sm font-bold text-[#EC4C84]">{action}</button> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function RadioRow({ active = false, disabled = false, label, value }: { active?: boolean; disabled?: boolean; label: string; value: string }) {
  return (
    <div className={`flex items-center justify-between border border-[#F7D9E2] px-4 py-2 text-sm first:rounded-t-xl last:rounded-b-xl ${active ? "bg-[#FFF5F7]" : "bg-white"} ${disabled ? "opacity-60" : ""}`}>
      <span className="flex items-center gap-3 text-[#6F6570]">
        <span className={`grid h-4 w-4 place-items-center rounded-full border ${active ? "border-[#EC4C84]" : "border-[#F7D9E2]"}`}>
          {active ? <span className="h-2 w-2 rounded-full bg-[#EC4C84]" /> : null}
        </span>
        {label}
      </span>
      <span className={`font-bold ${value === "FREE" ? "text-[#39B86D]" : "text-[#6F6570]"}`}>{value}</span>
    </div>
  );
}

function OrderSummaryCard() {
  return (
    <Card>
      <h2 className="text-3xl font-semibold text-[#1F1720]" style={serifStyle}>Order summary</h2>
      <div className="mt-6 grid gap-5 text-sm">
        <SummaryRow label="Subtotal (3 items)" value="$68.00" />
        <SummaryRow label="Discount (WELCOME15)" value="-$10.20" pink />
        <SummaryRow label="Shipping" value="FREE" green />
        <SummaryRow label="Estimated tax" value="$5.21" />
        <div className="flex justify-between border-t border-[#F7D9E2] pt-5 text-2xl font-semibold text-[#1F1720]">
          <span>Order total</span>
          <span>$62.81</span>
        </div>
      </div>
      <div className="mt-6 rounded-xl bg-[#FFF5F7] px-5 py-4 text-center text-sm font-bold text-[#EC4C84]">
        You saved $10.20
      </div>
    </Card>
  );
}

function SummaryRow({ green, label, pink, value }: { green?: boolean; label: string; pink?: boolean; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#6F6570]">{label}</span>
      <span className={`font-semibold ${green ? "text-[#39B86D]" : pink ? "text-[#EC4C84]" : "text-[#1F1720]"}`}>{value}</span>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#F7D9E2] bg-white p-7 shadow-sm shadow-pink-100 ${className}`}>{children}</section>;
}

function StoryCard() {
  const storyItems: Array<[string, typeof Heart]> = [
    ["Made just for you", Heart],
    ["Beautifully packaged", Gift],
    ["Shipped with care", Truck],
  ];

  return (
    <Card className="overflow-hidden bg-[radial-gradient(circle_at_85%_40%,rgba(236,76,132,0.18),transparent_9rem),linear-gradient(135deg,#FFF5F7,#fff)]">
      <h2 className="text-3xl font-semibold text-[#EC4C84]" style={serifStyle}>Every gift tells a story</h2>
      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs font-semibold text-[#6F6570]">
        {storyItems.map(([label, Icon]) => {
          return (
            <div key={label}>
              <span className="mx-auto grid h-13 w-13 place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#EC4C84]">
                <Icon className="h-6 w-6" />
              </span>
              <p className="mt-3">{label}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function GiftOptionsCard() {
  return (
    <Card>
      <h2 className="text-xl font-bold text-[#1F1720]">Gift options</h2>
      <label className="mt-6 flex items-center gap-3 text-sm text-[#6F6570]">
        <input className="h-5 w-5 accent-[#EC4C84]" type="checkbox" />
        Add a gift message (free)
      </label>
      <textarea className="mt-4 h-24 w-full rounded-xl border border-[#F7D9E2] p-4 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="Write your message here..." />
      <p className="mt-1 text-right text-xs text-[#9D8F98]">0/200</p>
      <label className="mt-5 flex items-start justify-between gap-4 text-sm text-[#6F6570]">
        <span className="flex gap-3">
          <input className="mt-1 h-5 w-5 accent-[#EC4C84]" type="checkbox" />
          <span>
            Add special wrapping
            <span className="block text-xs text-[#9D8F98]">Includes premium wrapping & dried florals</span>
          </span>
        </span>
        <span className="font-bold text-[#1F1720]">$4.00</span>
      </label>
    </Card>
  );
}

function ReviewOrderCard() {
  return (
    <Card>
      <h2 className="text-xl font-bold text-[#1F1720]">Review your order</h2>
      <div className="mt-5 rounded-xl bg-white shadow-sm">
        {cartItems.map((item) => (
          <div className="flex items-center gap-3 border-b border-[#F7D9E2]/70 py-3 last:border-b-0" key={item.id}>
            <ProductImage type={item.art} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#1F1720]">{item.name}</p>
              <p className="text-xs text-[#6F6570]">Qty: {item.quantity}</p>
            </div>
            <span className="font-bold text-[#1F1720]">{item.price}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TrustCard() {
  return (
    <Card className="bg-[#FFF5F7]">
      <h2 className="text-xl font-bold text-[#1F1720]">Shop with confidence</h2>
      <div className="mt-5 grid gap-3 text-sm text-[#6F6570]">
        {["30-day happiness guarantee", "Secure checkout", "Thousands of 5-star reviews", "Made with premium materials"].map((item) => (
          <p className="flex items-center gap-3" key={item}>
            <Check className="h-4 w-4 text-[#EC4C84]" />
            {item}
          </p>
        ))}
      </div>
    </Card>
  );
}

function FeatureStrip() {
  const features: Array<[string, string, typeof Heart]> = [
    ["Secure payments", "SSL secured checkout", ShieldCheck],
    ["Handmade with love", "Every gift is made to order", Heart],
    ["24/7 support", "We're here to help", Headphones],
    ["Hassle-free returns", "Love it or return it", PackageCheck],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 rounded-2xl border border-[#F7D9E2] bg-[#FFF5F7] p-5 md:grid-cols-4">
        {features.map(([title, subtitle, Icon]) => {
          return (
            <div className="flex gap-4 md:border-r md:border-[#F7D9E2] md:last:border-r-0" key={title}>
              <Icon className="h-8 w-8 shrink-0 text-[#EC4C84]" />
              <div>
                <p className="font-bold text-[#1F1720]">{title}</p>
                <p className="text-sm text-[#6F6570]">{subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="border-y border-[#F7D9E2] bg-[#FFF5F7]">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 md:grid-cols-[auto_1fr_1.4fr] lg:px-8">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-[#EC4C84] text-white shadow-lg shadow-pink-200">
          <Mail className="h-10 w-10" />
        </span>
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

function CheckoutFooter() {
  return (
    <footer className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_2fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EC4C84] text-white"><Gift className="h-5 w-5" /></span>
            <div>
              <p className="text-xl font-semibold text-[#1F1720]" style={serifStyle}>The AMY Shop</p>
              <p className="text-xs text-[#9D8F98]">Handmade custom gifts made with love</p>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            {["ig", "fb", "p", "tt"].map((item) => (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-xs font-bold text-white" key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ["Shop", "All Products", "Gift Boxes", "Candles", "Mugs", "Necklaces", "Sale"],
            ["Customer Care", "Contact Us", "Shipping & Returns", "FAQ", "Track Your Order", "Gift Cards"],
            ["About", "Our Story", "Handmade Process", "Reviews", "Blog", "Wholesale"],
          ].map(([title, ...links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-[#1F1720]">{title}</h3>
              <div className="mt-3 grid gap-1 text-xs text-[#6F6570]">
                {links.map((link) => <span key={link}>{link}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1F1720]">Let's keep in touch</h3>
          <p className="mt-3 text-xs leading-5 text-[#6F6570]">Join our newsletter for updates and sweet surprises!</p>
          <div className="mt-4 flex rounded-full border border-[#F7D9E2] p-1">
            <input className="min-w-0 flex-1 px-3 text-xs outline-none placeholder:text-[#9D8F98]" placeholder="Enter your email" />
            <button className="grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-white" type="button"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#F7D9E2] px-4 py-5 text-xs text-[#9D8F98] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span>(c) 2025 The AMY Shop. All rights reserved.</span>
        <span className="flex gap-6"><span>Privacy Policy</span><span>Terms of Service</span></span>
      </div>
    </footer>
  );
}

export function CartCheckoutPage() {
  return (
    <div className="min-h-screen bg-white text-[#1F1720]">
      <AnnouncementBar />
      <CheckoutHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-[#6F6570]">
          <Link to="/">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Your Cart</span>
          <ChevronRight className="h-4 w-4" />
          <span>Checkout</span>
        </div>
        <h1 className="mt-6 text-5xl font-semibold text-[#1F1720]" style={serifStyle}>Your cart</h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="grid gap-5">
            <FreeShippingBanner />
            <section>
              {cartItems.map((item) => <CartItemCard item={item} key={item.id} />)}
            </section>
            <div className="flex flex-col gap-3 rounded-xl border border-[#F7D9E2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Gift className="h-7 w-7 text-[#EC4C84]" />
                <input className="h-5 w-5 accent-[#EC4C84]" type="checkbox" />
                <div>
                  <p className="font-semibold text-[#1F1720]">This order is a gift</p>
                  <p className="text-sm text-[#6F6570]">Add a gift message or special wrapping</p>
                </div>
              </div>
              <button className="rounded-xl border border-[#F7D9E2] px-5 py-3 text-sm font-bold text-[#EC4C84]">Add gift options</button>
            </div>
            <section className="rounded-xl border border-[#F7D9E2] bg-white p-4">
              <h2 className="mb-3 font-bold text-[#1F1720]">Add a note to your order</h2>
              <textarea className="h-20 w-full rounded-xl border border-[#F7D9E2] p-4 text-sm outline-none placeholder:text-[#9D8F98]" placeholder="We love special requests! (optional)" />
              <p className="text-right text-xs text-[#9D8F98]">0/150</p>
            </section>
            <CouponRewardsBox />
            <CheckoutSteps />
          </div>
          <aside className="grid content-start gap-7">
            <OrderSummaryCard />
            <StoryCard />
            <GiftOptionsCard />
            <ReviewOrderCard />
            <TrustCard />
          </aside>
        </div>
      </main>
      <FeatureStrip />
      <NewsletterSection />
      <CheckoutFooter />
    </div>
  );
}
