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
  Trash2,
  Truck,
  UserRound,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { normalizeApiError } from "../../lib/apiError";
import { addressApi, type Address, type AddressPayload } from "../../services/addressApi";
import { cartApi, type CartItem, type CartResult } from "../../services/cartApi";
import { checkoutApi, type CheckoutOrder, type CheckoutPayload } from "../../services/checkoutApi";
import { couponApi, type CouponValidationResult } from "../../services/couponApi";
import { formatCurrency } from "../../utils/formatCurrency";

type AddressFormState = AddressPayload;

type GiftFormState = {
  enabled: boolean;
  receiverName: string;
  senderName: string;
  giftMessage: string;
  giftWrapRequired: boolean;
};

const emptyAddressForm: AddressFormState = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  city: "",
  streetAddress: "",
  landmark: "",
  isDefault: true,
};

const emptyGiftForm: GiftFormState = {
  enabled: false,
  receiverName: "",
  senderName: "",
  giftMessage: "",
  giftWrapRequired: false,
};

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const giftWrapFee = 50;
const shippingFee = 0;
const minimumPhoneDigits = 7;
const maximumPhoneDigits = 15;

const asNumber = (value: number | string | undefined) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const getProductImage = (item: CartItem) => (
  item.product.images?.find((image) => image.isPrimary)?.imageUrl ??
  item.product.images?.[0]?.imageUrl
);

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, maximumPhoneDigits);

const getApiErrorMessage = (error: unknown) => {
  const normalized = normalizeApiError(error);
  const firstError = normalized.errors?.[0];

  if (
    firstError &&
    typeof firstError === "object" &&
    "message" in firstError &&
    typeof firstError.message === "string"
  ) {
    return firstError.message;
  }

  return normalized.message;
};

const inferArtLabel = (item: CartItem) => {
  const text = `${item.product.name} ${item.product.category?.name ?? ""}`.toLowerCase();

  if (text.includes("mug")) return "mama";
  if (text.includes("candle")) return "Amazing";
  if (text.includes("necklace") || text.includes("jewelry")) return "A";
  return "gift";
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

function CheckoutHeader({ totalItems }: { totalItems: number }) {
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
          <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9D8F98]" disabled placeholder="Search coming soon" />
          <Search className="h-4 w-4 text-[#1F1720]" />
        </div>
        <Link className="grid h-10 w-10 place-items-center rounded-full text-[#1F1720] hover:bg-[#FFF5F7]" to="/account">
          <UserRound className="h-5 w-5" />
        </Link>
        <Link className="relative grid h-10 w-10 place-items-center rounded-full text-[#1F1720] hover:bg-[#FFF5F7]" to="/cart">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[#EC4C84] text-[10px] font-bold text-white">
            {totalItems}
          </span>
        </Link>
      </div>
    </header>
  );
}

function ProductImage({ item }: { item: CartItem }) {
  const imageUrl = getProductImage(item);

  if (imageUrl) {
    return (
      <img
        alt={item.product.name}
        className="h-44 w-56 shrink-0 rounded-xl object-cover"
        src={imageUrl}
      />
    );
  }

  return (
    <div className="relative h-44 w-56 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF0DA]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#EC4C84]/20 blur-xl" />
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/80 bg-white/70 p-4 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#EC4C84]" style={serifStyle}>{inferArtLabel(item)}</p>
        <p className="mt-1 text-xs text-[#9D8F98]">signature gift detail</p>
      </div>
    </div>
  );
}

function QuantitySelector({
  disabled,
  item,
  onUpdate,
}: {
  disabled: boolean;
  item: CartItem;
  onUpdate: (itemId: string, quantity: number) => void;
}) {
  return (
    <div className="inline-flex h-11 items-center rounded-xl border border-[#F7D9E2] bg-white">
      <button
        className="grid h-11 w-11 place-items-center text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || item.quantity <= 1}
        onClick={() => onUpdate(item.id, item.quantity - 1)}
        type="button"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="grid h-11 w-10 place-items-center text-sm font-bold text-[#1F1720]">{item.quantity}</span>
      <button
        className="grid h-11 w-11 place-items-center text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={() => onUpdate(item.id, item.quantity + 1)}
        type="button"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function CartItemCard({
  isBusy,
  item,
  onRemove,
  onUpdate,
}: {
  isBusy: boolean;
  item: CartItem;
  onRemove: (itemId: string) => void;
  onUpdate: (itemId: string, quantity: number) => void;
}) {
  return (
    <div className="grid gap-5 border-b border-[#F7D9E2] py-6 md:grid-cols-[2rem_auto_1fr_auto]">
      <span className="mt-16 grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-white">
        <Check className="h-4 w-4" />
      </span>
      <ProductImage item={item} />
      <div className="py-2">
        <h2 className="text-lg font-bold text-[#1F1720]">{item.product.name}</h2>
        <p className="mt-1 text-sm text-[#6F6570]">{item.product.shortDescription ?? item.product.category?.name ?? "Handmade gift"}</p>
        <div className="mt-5 grid gap-2 text-sm">
          <p className="grid grid-cols-[7rem_1fr] gap-3 text-[#6F6570]">
            <span className="font-semibold text-[#1F1720]">Price:</span>
            <span>{formatCurrency(item.priceSnapshot)}</span>
          </p>
          <p className="grid grid-cols-[7rem_1fr] gap-3 text-[#6F6570]">
            <span className="font-semibold text-[#1F1720]">Line total:</span>
            <span>{formatCurrency(item.lineTotal)}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-4 py-2 md:items-end">
        <p className="text-xl font-bold text-[#1F1720]">{formatCurrency(item.lineTotal)}</p>
        <div className="grid gap-3">
          <QuantitySelector disabled={isBusy} item={item} onUpdate={onUpdate} />
          <div className="flex justify-end gap-4 text-xs font-semibold text-[#9D8F98]">
            <button className="cursor-not-allowed underline opacity-60" disabled type="button">Edit Soon</button>
            <span>|</span>
            <button
              className="inline-flex items-center gap-1 underline disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              onClick={() => onRemove(item.id)}
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FreeShippingBanner({ subtotal }: { subtotal: number }) {
  const target = 75;
  const remaining = Math.max(0, target - subtotal);
  const progress = Math.min(100, (subtotal / target) * 100);

  return (
    <div className="rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-[#6F6570]">
          {remaining > 0 ? (
            <>You're <span className="text-[#EC4C84]">{formatCurrency(remaining)}</span> away from FREE shipping!</>
          ) : (
            <span className="text-[#EC4C84]">Free shipping unlocked</span>
          )}
        </p>
        <div className="min-w-0 flex-1">
          <div className="h-2 rounded-full bg-white">
            <div className="h-2 rounded-full bg-[#EC4C84]" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs font-semibold text-[#EC4C84]">
            <span>{formatCurrency(subtotal)}</span>
            <span>{formatCurrency(target)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CouponRewardsBox({
  couponCode,
  couponError,
  couponValidation,
  isApplyingCoupon,
  isCouponStale,
  onApplyCoupon,
  onCouponCodeChange,
  onRemoveCoupon,
}: {
  couponCode: string;
  couponError: string | null;
  couponValidation: CouponValidationResult | null;
  isApplyingCoupon: boolean;
  isCouponStale: boolean;
  onApplyCoupon: () => void;
  onCouponCodeChange: (value: string) => void;
  onRemoveCoupon: () => void;
}) {
  const isValidCoupon = Boolean(couponValidation?.valid && !isCouponStale);

  return (
    <section className="rounded-xl border border-[#F7D9E2] bg-white">
      <div className="flex items-center justify-between border-b border-[#F7D9E2] px-5 py-4">
        <h2 className="font-bold text-[#1F1720]">Have a coupon, referral or rewards?</h2>
        <ChevronRight className="h-4 w-4 -rotate-90 text-[#EC4C84]" />
      </div>
      <div className="grid grid-cols-3 border-b border-[#F7D9E2] text-center text-sm font-semibold text-[#6F6570]">
        <button className="border-b-2 border-[#EC4C84] py-4 text-[#EC4C84]" type="button">Coupon code</button>
        <button className="cursor-not-allowed text-[#C8A7B1]" disabled type="button">Referral Soon</button>
        <button className="cursor-not-allowed text-[#C8A7B1]" disabled type="button">Rewards Soon</button>
      </div>
      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="h-12 min-w-0 flex-1 rounded-xl border border-[#F7D9E2] px-4 text-sm uppercase outline-none placeholder:text-[#9D8F98]"
            onChange={(event) => onCouponCodeChange(event.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            value={couponCode}
          />
          <button
            className="h-12 rounded-xl bg-[#EC4C84] px-5 text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none"
            disabled={isApplyingCoupon || !couponCode.trim()}
            onClick={onApplyCoupon}
            type="button"
          >
            {isApplyingCoupon ? "Applying..." : "Apply"}
          </button>
          {couponCode.trim() ? (
            <button
              className="h-12 rounded-xl border border-[#F7D9E2] bg-white px-5 text-sm font-bold text-[#6F6570]"
              onClick={onRemoveCoupon}
              type="button"
            >
              Remove
            </button>
          ) : null}
        </div>
        {couponError ? (
          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {couponError}
          </p>
        ) : null}
        {isCouponStale ? (
          <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            Coupon code changed. Apply again before checkout.
          </p>
        ) : null}
        {isValidCoupon ? (
          <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            {couponValidation?.coupon?.code} applied. Discount preview: {formatCurrency(couponValidation?.discountAmount ?? 0)}.
          </p>
        ) : null}
        {!couponError && !couponValidation ? (
          <p className="mt-3 text-xs text-[#9D8F98]">Apply a coupon to preview the backend discount before checkout.</p>
        ) : null}
      </div>
    </section>
  );
}

function AddressForm({
  error,
  form,
  onChange,
}: {
  error: string | null;
  form: AddressFormState;
  onChange: (form: AddressFormState) => void;
}) {
  const update = (updates: Partial<AddressFormState>) => onChange({ ...form, ...updates });

  return (
    <div className="grid gap-3 rounded-xl border border-[#F7D9E2] bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name *" onChange={(fullName) => update({ fullName })} value={form.fullName} />
        <Field
          inputMode="numeric"
          label="Phone *"
          maxLength={maximumPhoneDigits}
          onChange={(phone) => update({ phone: digitsOnly(phone) })}
          value={form.phone}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Province *" onChange={(province) => update({ province })} value={form.province} />
        <Field label="District *" onChange={(district) => update({ district })} value={form.district} />
        <Field label="City *" onChange={(city) => update({ city })} value={form.city} />
      </div>
      <Field label="Street address *" onChange={(streetAddress) => update({ streetAddress })} value={form.streetAddress} />
      <Field label="Landmark" onChange={(landmark) => update({ landmark })} value={form.landmark ?? ""} />
      <label className="flex items-center gap-2 text-sm font-semibold text-[#6F6570]">
        <input
          checked={form.isDefault}
          className="h-4 w-4 accent-[#EC4C84]"
          onChange={(event) => update({ isDefault: event.target.checked })}
          type="checkbox"
        />
        Save as default address
      </label>
      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  inputMode,
  label,
  maxLength,
  onChange,
  value,
}: {
  inputMode?: "text" | "numeric";
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
      {label}
      <input
        className="h-11 rounded-xl border border-[#F7D9E2] px-4 text-sm outline-none placeholder:text-[#9D8F98] focus:border-[#EC4C84]"
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function CheckoutSteps({
  addressError,
  addressForm,
  addresses,
  giftForm,
  onAddressFormChange,
  onGiftFormChange,
  onSelectAddress,
  selectedAddressId,
  showAddressForm,
  setShowAddressForm,
}: {
  addressError: string | null;
  addressForm: AddressFormState;
  addresses: Address[];
  giftForm: GiftFormState;
  onAddressFormChange: (form: AddressFormState) => void;
  onGiftFormChange: (form: GiftFormState) => void;
  onSelectAddress: (id: string) => void;
  selectedAddressId: string;
  showAddressForm: boolean;
  setShowAddressForm: (show: boolean) => void;
}) {
  return (
    <div className="grid gap-5">
      <Step title="Shipping address" number="1">
        {addresses.length > 0 ? (
          <div className="grid gap-3">
            {addresses.map((address) => (
              <button
                className={`w-full max-w-sm rounded-xl border p-4 text-left ${
                  selectedAddressId === address.id
                    ? "border-[#EC4C84] bg-[#FFF5F7]"
                    : "border-[#F7D9E2] bg-white"
                }`}
                key={address.id}
                onClick={() => {
                  onSelectAddress(address.id);
                  setShowAddressForm(false);
                }}
                type="button"
              >
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-bold text-[#1F1720]">{address.fullName}</p>
                  {address.isDefault ? <span className="rounded bg-[#FDECEF] px-2 py-0.5 text-xs font-bold text-[#EC4C84]">Default</span> : null}
                  {selectedAddressId === address.id ? <Check className="ml-auto h-5 w-5 rounded-full bg-[#EC4C84] p-1 text-white" /> : null}
                </div>
                <p className="text-sm leading-6 text-[#6F6570]">
                  {address.streetAddress}<br />
                  {address.city}, {address.district}<br />
                  {address.province}<br />
                  {address.phone}
                </p>
              </button>
            ))}
          </div>
        ) : null}
        <button
          className="mt-3 text-sm font-bold text-[#EC4C84]"
          onClick={() => {
            setShowAddressForm(true);
            onSelectAddress("");
          }}
          type="button"
        >
          + Add a new address
        </button>
        {showAddressForm || addresses.length === 0 ? (
          <div className="mt-3">
            <AddressForm error={addressError} form={addressForm} onChange={onAddressFormChange} />
          </div>
        ) : null}
      </Step>
      <Step title="Shipping method" number="2">
        <RadioRow active label="Standard Shipping" value="FREE" />
        <RadioRow disabled label="Expedited Shipping" value="Coming soon" />
        <RadioRow disabled label="Express Shipping" value="Coming soon" />
      </Step>
      <Step title="Payment method" number="3">
        <RadioRow active label="Cash on Delivery" value="CASH_ON_DELIVERY" />
        <RadioRow disabled label="Khalti" value="Coming soon" />
        <RadioRow disabled label="eSewa" value="Coming soon" />
        <p className="mt-3 text-xs text-[#9D8F98]">
          Checkout currently accepts Cash on Delivery. Khalti and eSewa are shown for later once merchant verification is configured.
        </p>
      </Step>
      <Step title="Gift details" number="4">
        <label className="flex items-center gap-3 text-sm text-[#6F6570]">
          <input
            checked={giftForm.enabled}
            className="h-5 w-5 accent-[#EC4C84]"
            onChange={(event) => onGiftFormChange({ ...giftForm, enabled: event.target.checked })}
            type="checkbox"
          />
          This order is a gift
        </label>
        {giftForm.enabled ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-[#F7D9E2] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Receiver name *" onChange={(receiverName) => onGiftFormChange({ ...giftForm, receiverName })} value={giftForm.receiverName} />
              <Field label="Sender name *" onChange={(senderName) => onGiftFormChange({ ...giftForm, senderName })} value={giftForm.senderName} />
            </div>
            <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
              Gift message *
              <textarea
                className="h-24 rounded-xl border border-[#F7D9E2] p-4 text-sm outline-none placeholder:text-[#9D8F98] focus:border-[#EC4C84]"
                onChange={(event) => onGiftFormChange({ ...giftForm, giftMessage: event.target.value })}
                value={giftForm.giftMessage}
              />
            </label>
            <label className="flex items-start justify-between gap-4 text-sm text-[#6F6570]">
              <span className="flex gap-3">
                <input
                  checked={giftForm.giftWrapRequired}
                  className="mt-1 h-5 w-5 accent-[#EC4C84]"
                  onChange={(event) => onGiftFormChange({ ...giftForm, giftWrapRequired: event.target.checked })}
                  type="checkbox"
                />
                <span>
                  Add special wrapping
                  <span className="block text-xs text-[#9D8F98]">Includes premium wrapping and dried florals</span>
                </span>
              </span>
              <span className="font-bold text-[#1F1720]">{formatCurrency(giftWrapFee)}</span>
            </label>
          </div>
        ) : null}
      </Step>
    </div>
  );
}

function Step({ children, number, title }: { children: ReactNode; number: string; title: string }) {
  return (
    <section className="grid grid-cols-[2rem_1fr] gap-4">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EC4C84] text-sm font-bold text-white">{number}</span>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1F1720]">{title}</h2>
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

function OrderSummaryCard({
  couponCode,
  couponValidation,
  giftForm,
  isSubmitting,
  isCouponStale,
  onCheckout,
  summary,
}: {
  couponCode: string;
  couponValidation: CouponValidationResult | null;
  giftForm: GiftFormState;
  isSubmitting: boolean;
  isCouponStale: boolean;
  onCheckout: () => void;
  summary: CartResult["summary"] | null;
}) {
  const subtotal = asNumber(summary?.subtotal);
  const giftFee = giftForm.enabled && giftForm.giftWrapRequired ? giftWrapFee : 0;
  const hasValidCoupon = Boolean(couponValidation?.valid && !isCouponStale);
  const displayTotal = hasValidCoupon ? couponValidation?.finalAmount ?? subtotal + shippingFee + giftFee : subtotal + shippingFee + giftFee;

  return (
    <Card>
      <h2 className="text-3xl font-semibold text-[#1F1720]" style={serifStyle}>Order summary</h2>
      <div className="mt-6 grid gap-5 text-sm">
        <SummaryRow label={`Subtotal (${summary?.totalItems ?? 0} items)`} value={formatCurrency(subtotal)} />
        {hasValidCoupon ? (
          <SummaryRow label={`Coupon (${couponValidation?.coupon?.code ?? couponCode.trim().toUpperCase()})`} value={`-${formatCurrency(couponValidation?.discountAmount ?? 0)}`} pink />
        ) : couponCode.trim() ? (
          <SummaryRow label={`Coupon (${couponCode.trim().toUpperCase()})`} value={isCouponStale ? "Apply again" : "Apply to validate"} pink />
        ) : null}
        <SummaryRow label="Shipping" value="FREE" green />
        {giftFee > 0 ? <SummaryRow label="Gift wrap" value={formatCurrency(giftFee)} /> : null}
        <div className="flex justify-between border-t border-[#F7D9E2] pt-5 text-2xl font-semibold text-[#1F1720]">
          <span>Order total</span>
          <span>{formatCurrency(displayTotal)}</span>
        </div>
      </div>
      <button
        className="mt-6 h-13 w-full rounded-xl bg-[#EC4C84] text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none"
        disabled={isSubmitting || !summary?.totalItems}
        onClick={onCheckout}
        type="button"
      >
        {isSubmitting ? "Creating order..." : "Place order"}
      </button>
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
        {storyItems.map(([label, Icon]) => (
          <div key={label}>
            <span className="mx-auto grid h-13 w-13 place-items-center rounded-full border border-[#F7D9E2] bg-white text-[#EC4C84]">
              <Icon className="h-6 w-6" />
            </span>
            <p className="mt-3">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReviewOrderCard({ items }: { items: CartItem[] }) {
  return (
    <Card>
      <h2 className="text-xl font-bold text-[#1F1720]">Review your order</h2>
      <div className="mt-5 rounded-xl bg-white shadow-sm">
        {items.length > 0 ? items.map((item) => (
          <div className="flex items-center gap-3 border-b border-[#F7D9E2]/70 py-3 last:border-b-0" key={item.id}>
            <div className="h-14 w-14 overflow-hidden rounded-xl">
              <ProductImage item={item} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#1F1720]">{item.product.name}</p>
              <p className="text-xs text-[#6F6570]">Qty: {item.quantity}</p>
            </div>
            <span className="font-bold text-[#1F1720]">{formatCurrency(item.lineTotal)}</span>
          </div>
        )) : (
          <p className="text-sm text-[#6F6570]">Your cart is empty.</p>
        )}
      </div>
    </Card>
  );
}

function TrustCard() {
  return (
    <Card className="bg-[#FFF5F7]">
      <h2 className="text-xl font-bold text-[#1F1720]">Shop with confidence</h2>
      <div className="mt-5 grid gap-3 text-sm text-[#6F6570]">
        {["Backend-validated checkout", "Secure customer session", "Cash on Delivery available", "Made with premium materials"].map((item) => (
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
    ["Secure checkout", "Backend validated order", ShieldCheck],
    ["Handmade with love", "Every gift is made to order", Heart],
    ["24/7 support", "We're here to help", Headphones],
    ["Hassle-free returns", "Love it or return it", PackageCheck],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 rounded-2xl border border-[#F7D9E2] bg-[#FFF5F7] p-5 md:grid-cols-4">
        {features.map(([title, subtitle, Icon]) => (
          <div className="flex gap-4 md:border-r md:border-[#F7D9E2] md:last:border-r-0" key={title}>
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
            <button className="rounded-full bg-[#EC4C84] px-7 text-sm font-bold text-white" type="button">Subscribe</button>
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

function StatePanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-8 text-center shadow-sm shadow-pink-100">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
        <Gift className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-[#1F1720]" style={serifStyle}>{title}</h2>
      <div className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6F6570]">{children}</div>
    </section>
  );
}

export function CartCheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResult | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [giftForm, setGiftForm] = useState<GiftFormState>(emptyGiftForm);
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponValidation, setCouponValidation] = useState<CouponValidationResult | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CheckoutOrder | null>(null);

  const items = cart?.cart.items ?? [];
  const subtotal = useMemo(() => {
    if (cart?.summary?.subtotal !== undefined) {
      return asNumber(cart.summary.subtotal);
    }

    return items.reduce((sum, item) => sum + asNumber(item.lineTotal), 0);
  }, [cart?.summary?.subtotal, items]);
  const giftFee = giftForm.enabled && giftForm.giftWrapRequired ? giftWrapFee : 0;
  const normalizedCouponCode = couponCode.trim().toUpperCase();
  const isCouponStale = Boolean(
    couponValidation && normalizedCouponCode && normalizedCouponCode !== appliedCouponCode,
  );
  const hasValidCoupon = Boolean(
    couponValidation?.valid &&
      normalizedCouponCode &&
      normalizedCouponCode === appliedCouponCode,
  );

  const loadCart = async () => {
    const result = await cartApi.get();
    setCart(result);
  };

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [cartResult, addressResult] = await Promise.all([
        cartApi.get(),
        addressApi.listMine(),
      ]);
      setCart(cartResult);
      setAddresses(addressResult);

      if (!selectedAddressId) {
        setSelectedAddressId(addressResult.find((address) => address.isDefault)?.id ?? addressResult[0]?.id ?? "");
      }

      setShowAddressForm(addressResult.length === 0);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      setBusyItemId(itemId);
      setError(null);
      setSuccessMessage(null);
      const result = await cartApi.updateItem(itemId, quantity);
      setCart(result);
      setSuccessMessage("Cart updated.");
    } catch (updateError) {
      setError(getApiErrorMessage(updateError));
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setBusyItemId(itemId);
      setError(null);
      setSuccessMessage(null);
      const result = await cartApi.removeItem(itemId);
      setCart(result);
      setSuccessMessage("Item removed from cart.");
    } catch (removeError) {
      setError(getApiErrorMessage(removeError));
    } finally {
      setBusyItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      const result = await cartApi.clear();
      setCart(result);
      setSuccessMessage("Cart cleared.");
    } catch (clearError) {
      setError(getApiErrorMessage(clearError));
    }
  };

  const handleCouponCodeChange = (value: string) => {
    setCouponCode(value);
    setCouponError(null);
  };

  const handleApplyCoupon = async () => {
    const code = normalizedCouponCode;

    if (!code) {
      setCouponError("Enter a coupon code first.");
      return;
    }

    try {
      setIsApplyingCoupon(true);
      setCouponError(null);
      setError(null);
      const result = await couponApi.validate({
        code,
        giftWrapFee: giftFee,
        orderAmount: subtotal + giftFee,
        shippingFee,
      });
      setCouponValidation(result);
      setAppliedCouponCode(code);

      if (!result.valid) {
        setCouponError(result.reason ?? "Coupon is not valid.");
        return;
      }

      setSuccessMessage(`Coupon ${result.coupon?.code ?? code} applied.`);
    } catch (couponApplyError) {
      setCouponValidation(null);
      setAppliedCouponCode("");
      setCouponError(getApiErrorMessage(couponApplyError));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponError(null);
    setCouponValidation(null);
    setAppliedCouponCode("");
  };

  const validateAddressForm = (): string | null => {
    if (!addressForm.fullName.trim()) {
      return "Full name is required.";
    }

    if (!addressForm.phone.trim()) {
      return "Phone number is required.";
    }

    if (!/^\d+$/.test(addressForm.phone)) {
      return "Phone number must contain digits only.";
    }

    if (addressForm.phone.length < minimumPhoneDigits) {
      return "Phone number must contain at least 7 digits.";
    }

    if (!addressForm.province.trim()) {
      return "Province is required.";
    }

    if (!addressForm.district.trim()) {
      return "District is required.";
    }

    if (!addressForm.city.trim()) {
      return "City is required.";
    }

    if (!addressForm.streetAddress.trim()) {
      return "Street address is required.";
    }

    return null;
  };

  const getCheckoutAddressId = async () => {
    if (selectedAddressId) {
      return selectedAddressId;
    }

    const validationError = validateAddressForm();

    if (validationError) {
      setAddressError(validationError);
      throw new Error(validationError);
    }

    setAddressError(null);

    const addressPayload: AddressPayload = {
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      province: addressForm.province.trim(),
      district: addressForm.district.trim(),
      city: addressForm.city.trim(),
      streetAddress: addressForm.streetAddress.trim(),
      isDefault: addressForm.isDefault,
      ...(addressForm.landmark?.trim() && {
        landmark: addressForm.landmark.trim(),
      }),
    };
    const createdAddress = await addressApi.create(addressPayload);
    setAddresses((current) => [createdAddress, ...current]);
    setSelectedAddressId(createdAddress.id);
    setShowAddressForm(false);
    return createdAddress.id;
  };

  const validateGift = () => {
    if (!giftForm.enabled) {
      return true;
    }

    return Boolean(
      giftForm.receiverName.trim() &&
      giftForm.senderName.trim() &&
      giftForm.giftMessage.trim(),
    );
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!validateGift()) {
      setError("Receiver name, sender name, and gift message are required for gift orders.");
      return;
    }

    if (normalizedCouponCode && !hasValidCoupon) {
      setError("Apply the coupon successfully or remove it before checkout.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setAddressError(null);
      setSuccessMessage(null);
      const addressId = await getCheckoutAddressId();
      const payload: CheckoutPayload = {
        addressId,
        paymentMethod: "CASH_ON_DELIVERY",
        shippingFee,
        ...(hasValidCoupon && { couponCode: normalizedCouponCode }),
        ...(giftForm.enabled && {
          gift: {
            receiverName: giftForm.receiverName.trim(),
            senderName: giftForm.senderName.trim(),
            giftMessage: giftForm.giftMessage.trim(),
            giftWrapRequired: giftForm.giftWrapRequired,
            giftWrapFee: giftForm.giftWrapRequired ? giftWrapFee : 0,
          },
        }),
      };
      const order = await checkoutApi.createOrder(payload);
      setCreatedOrder(order);
      setSuccessMessage(`Order ${order.orderNumber} created successfully.`);
      await loadCart();
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error &&
          (
            checkoutError.message === "Full name is required." ||
            checkoutError.message === "Phone number is required." ||
            checkoutError.message === "Phone number must contain digits only." ||
            checkoutError.message === "Phone number must contain at least 7 digits." ||
            checkoutError.message === "Province is required." ||
            checkoutError.message === "District is required." ||
            checkoutError.message === "City is required." ||
            checkoutError.message === "Street address is required."
          )
          ? checkoutError.message
          : getApiErrorMessage(checkoutError),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1720]">
      <AnnouncementBar />
      <CheckoutHeader totalItems={cart?.summary.totalItems ?? 0} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-[#6F6570]">
          <Link to="/">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Your Cart</span>
          <ChevronRight className="h-4 w-4" />
          <span>Checkout</span>
        </div>
        <h1 className="mt-6 text-5xl font-semibold text-[#1F1720]" style={serifStyle}>Your cart</h1>

        {error ? (
          <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100">
            {error}
          </p>
        ) : null}
        {successMessage ? (
          <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-100">
            {successMessage}
          </p>
        ) : null}
        {createdOrder ? (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-[#F7D9E2] bg-[#FFF5F7] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[#6F6570]">
              Your Cash on Delivery order is pending. Order number: <span className="text-[#EC4C84]">{createdOrder.orderNumber}</span>
            </p>
            <button
              className="rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200"
              onClick={() => navigate("/orders")}
              type="button"
            >
              View orders
            </button>
          </div>
        ) : null}

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="grid content-start gap-5">
            {isLoading ? (
              <StatePanel title="Loading cart">
                We are loading your cart from the backend.
              </StatePanel>
            ) : items.length === 0 ? (
              <StatePanel title="Your cart is empty">
                Add a real catalog product to your cart before checkout.
                <Link className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#EC4C84] px-5 text-sm font-bold text-white shadow-lg shadow-pink-200" to="/products">
                  Continue shopping
                </Link>
              </StatePanel>
            ) : (
              <>
                <FreeShippingBanner subtotal={subtotal} />
                <section>
                  {items.map((item) => (
                    <CartItemCard
                      isBusy={busyItemId === item.id}
                      item={item}
                      key={item.id}
                      onRemove={(itemId) => void handleRemoveItem(itemId)}
                      onUpdate={(itemId, quantity) => void handleUpdateQuantity(itemId, quantity)}
                    />
                  ))}
                </section>
                <div className="flex flex-col gap-3 rounded-xl border border-[#F7D9E2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Gift className="h-7 w-7 text-[#EC4C84]" />
                    <div>
                      <p className="font-semibold text-[#1F1720]">Backend cart actions</p>
                      <p className="text-sm text-[#6F6570]">Clear cart uses the real DELETE /api/cart endpoint.</p>
                    </div>
                  </div>
                  <button className="rounded-xl border border-[#F7D9E2] px-5 py-3 text-sm font-bold text-[#EC4C84]" onClick={() => void handleClearCart()} type="button">
                    Clear cart
                  </button>
                </div>
                <CouponRewardsBox
                  couponCode={couponCode}
                  couponError={couponError}
                  couponValidation={couponValidation}
                  isApplyingCoupon={isApplyingCoupon}
                  isCouponStale={isCouponStale}
                  onApplyCoupon={() => void handleApplyCoupon()}
                  onCouponCodeChange={handleCouponCodeChange}
                  onRemoveCoupon={handleRemoveCoupon}
                />
                <CheckoutSteps
                  addressError={addressError}
                  addressForm={addressForm}
                  addresses={addresses}
                  giftForm={giftForm}
                  onAddressFormChange={(nextAddressForm) => {
                    setAddressForm({
                      ...nextAddressForm,
                      phone: digitsOnly(nextAddressForm.phone),
                    });
                    setAddressError(null);
                  }}
                  onGiftFormChange={setGiftForm}
                  onSelectAddress={(addressId) => {
                    setSelectedAddressId(addressId);
                    setAddressError(null);
                  }}
                  selectedAddressId={selectedAddressId}
                  setShowAddressForm={setShowAddressForm}
                  showAddressForm={showAddressForm}
                />
              </>
            )}
          </div>
          <aside className="grid content-start gap-7">
            <OrderSummaryCard
              couponCode={couponCode}
              couponValidation={couponValidation}
              giftForm={giftForm}
              isSubmitting={isSubmitting}
              isCouponStale={isCouponStale}
              onCheckout={() => void handleCheckout()}
              summary={cart?.summary ?? null}
            />
            <StoryCard />
            <ReviewOrderCard items={items} />
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
