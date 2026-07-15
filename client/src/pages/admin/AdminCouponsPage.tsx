import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ChevronDown,
  Heart,
  Plus,
  Search,
  Star,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { normalizeApiError } from "../../lib/apiError";
import {
  couponApi,
  type Coupon,
  type CouponDiscountType,
  type CouponPayload,
} from "../../services/couponApi";
import type { PaginatedMeta } from "../../types/api";

type CouponFormState = {
  code: string;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscountAmount: string;
  usageLimit: string;
  perUserLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const discountTypes: CouponDiscountType[] = [
  "PERCENTAGE_DISCOUNT",
  "FIXED_DISCOUNT",
  "FREE_SHIPPING",
  "FREE_GIFT_WRAP",
];

const emptyForm: CouponFormState = {
  code: "",
  title: "",
  description: "",
  discountType: "PERCENTAGE_DISCOUNT",
  discountValue: "0",
  minimumOrderAmount: "0",
  maximumDiscountAmount: "",
  usageLimit: "",
  perUserLimit: "1",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  Inactive: "bg-stone-100 text-stone-600 ring-stone-200",
  Expired: "bg-red-100 text-red-700 ring-red-200",
  Scheduled: "bg-sky-100 text-sky-700 ring-sky-200",
};

const asNumber = (value: string | number | undefined | null) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const formatCurrency = (amount: string | number | undefined | null) => (
  new Intl.NumberFormat("en-NP", {
    currency: "NPR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(asNumber(amount))
);

const formatDate = (date: string | undefined) => {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const toDateInputValue = (date: string | undefined) => {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().slice(0, 10);
};

const displayLabel = (value: string) => value.replaceAll("_", " ");

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

const getCouponStatus = (coupon: Coupon) => {
  const now = Date.now();
  const startsAt = new Date(coupon.startsAt).getTime();
  const expiresAt = new Date(coupon.expiresAt).getTime();

  if (!coupon.isActive) {
    return "Inactive";
  }

  if (Number.isFinite(expiresAt) && expiresAt < now) {
    return "Expired";
  }

  if (Number.isFinite(startsAt) && startsAt > now) {
    return "Scheduled";
  }

  return "Active";
};

const couponToForm = (coupon: Coupon): CouponFormState => ({
  code: coupon.code,
  title: coupon.title,
  description: coupon.description ?? "",
  discountType: coupon.discountType,
  discountValue: String(coupon.discountValue ?? 0),
  minimumOrderAmount: String(coupon.minimumOrderAmount ?? 0),
  maximumDiscountAmount: coupon.maximumDiscountAmount === null || coupon.maximumDiscountAmount === undefined ? "" : String(coupon.maximumDiscountAmount),
  usageLimit: coupon.usageLimit === null || coupon.usageLimit === undefined ? "" : String(coupon.usageLimit),
  perUserLimit: String(coupon.perUserLimit ?? 1),
  startsAt: toDateInputValue(coupon.startsAt),
  expiresAt: toDateInputValue(coupon.expiresAt),
  isActive: coupon.isActive,
});

const toIsoDate = (date: string) => new Date(`${date}T00:00:00.000`).toISOString();

const validateForm = (form: CouponFormState) => {
  if (!form.code.trim()) {
    return "Coupon code is required.";
  }

  if (!form.title.trim() || form.title.trim().length < 2) {
    return "Coupon title is required.";
  }

  if (!form.discountType) {
    return "Discount type is required.";
  }

  if (!Number.isFinite(Number(form.discountValue)) || Number(form.discountValue) < 0) {
    return "Discount value must be a positive number.";
  }

  if (form.discountType === "PERCENTAGE_DISCOUNT" && Number(form.discountValue) > 100) {
    return "Percentage discount cannot exceed 100.";
  }

  if (!Number.isFinite(Number(form.minimumOrderAmount)) || Number(form.minimumOrderAmount) < 0) {
    return "Minimum order amount must be a positive number.";
  }

  if (form.maximumDiscountAmount.trim() && (!Number.isFinite(Number(form.maximumDiscountAmount)) || Number(form.maximumDiscountAmount) < 0)) {
    return "Maximum discount amount must be a positive number.";
  }

  if (form.usageLimit.trim() && (!Number.isInteger(Number(form.usageLimit)) || Number(form.usageLimit) <= 0)) {
    return "Usage limit must be a positive whole number.";
  }

  if (!Number.isInteger(Number(form.perUserLimit)) || Number(form.perUserLimit) <= 0) {
    return "Per user limit must be a positive whole number.";
  }

  if (!form.startsAt) {
    return "Start date is required.";
  }

  if (!form.expiresAt) {
    return "Expiration date is required.";
  }

  if (new Date(form.expiresAt) <= new Date(form.startsAt)) {
    return "Expiration date must be after start date.";
  }

  return null;
};

const buildPayload = (form: CouponFormState): CouponPayload => ({
  code: form.code.trim().toUpperCase(),
  title: form.title.trim(),
  ...(form.description.trim() && { description: form.description.trim() }),
  discountType: form.discountType,
  discountValue: Number(form.discountValue),
  minimumOrderAmount: Number(form.minimumOrderAmount),
  ...(form.maximumDiscountAmount.trim() && { maximumDiscountAmount: Number(form.maximumDiscountAmount) }),
  ...(form.usageLimit.trim() && { usageLimit: Number(form.usageLimit) }),
  perUserLimit: Number(form.perUserLimit),
  startsAt: toIsoDate(form.startsAt),
  expiresAt: toIsoDate(form.expiresAt),
  isActive: form.isActive,
});

function Badge({ label }: { label: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[label] ?? "bg-[#FDECEF] text-[#EC4C84] ring-[#F7D9E2]"}`}>
      {label}
    </span>
  );
}

function Notice({ message, tone }: { message: string; tone: "error" | "success" }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
      tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-600"
    }`}>
      {message}
    </div>
  );
}

function StateCard({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-6 text-center shadow-sm shadow-pink-100">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
        <Tags className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-bold text-[#1F1720]">{title}</h3>
      <p className="mt-2 text-sm text-[#6F6570]">{description}</p>
    </div>
  );
}

function CouponForm({
  editingCoupon,
  error,
  form,
  isSaving,
  onCancelEdit,
  onChange,
  onSubmit,
}: {
  editingCoupon: Coupon | null;
  error: string | null;
  form: CouponFormState;
  isSaving: boolean;
  onCancelEdit: () => void;
  onChange: (form: CouponFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <aside className="border-l border-[#F7D9E2] bg-[#FFF5F7] px-6 py-8 xl:w-[30rem] xl:shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
            {editingCoupon ? "Edit Coupon" : "Create Coupon"}
          </h2>
          <p className="mt-2 text-sm text-[#6F6570]">Use the available coupon fields below.</p>
        </div>
        {editingCoupon ? (
          <button onClick={onCancelEdit} type="button">
            <X className="h-5 w-5 text-[#6F6570]" />
          </button>
        ) : null}
      </div>

      <form className="mt-6 grid gap-4 rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100" onSubmit={onSubmit}>
        {error ? <Notice message={error} tone="error" /> : null}
        <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
          Code
          <input
            className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm uppercase outline-none"
            onChange={(event) => onChange({ ...form, code: event.target.value.toUpperCase() })}
            placeholder="WELCOME10"
            value={form.code}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
          Title
          <input
            className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm outline-none"
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            placeholder="Welcome discount"
            value={form.title}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
          Description
          <textarea
            className="min-h-20 rounded-xl border border-[#F7D9E2] px-3 py-3 text-sm outline-none"
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            placeholder="Optional customer-facing note"
            value={form.description}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
            Discount type
            <select
              className="h-11 rounded-xl border border-[#F7D9E2] bg-white px-3 text-sm outline-none"
              onChange={(event) => onChange({ ...form, discountType: event.target.value as CouponDiscountType })}
              value={form.discountType}
            >
              {discountTypes.map((type) => (
                <option key={type} value={type}>{displayLabel(type)}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
            Discount value
            <input
              className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm outline-none"
              min="0"
              onChange={(event) => onChange({ ...form, discountValue: event.target.value })}
              step="0.01"
              type="number"
              value={form.discountValue}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
            Minimum order
            <input
              className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm outline-none"
              min="0"
              onChange={(event) => onChange({ ...form, minimumOrderAmount: event.target.value })}
              step="0.01"
              type="number"
              value={form.minimumOrderAmount}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
            Maximum discount
            <input
              className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm outline-none"
              min="0"
              onChange={(event) => onChange({ ...form, maximumDiscountAmount: event.target.value })}
              placeholder="Optional"
              step="0.01"
              type="number"
              value={form.maximumDiscountAmount}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
            Usage limit
            <input
              className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm outline-none"
              min="1"
              onChange={(event) => onChange({ ...form, usageLimit: event.target.value })}
              placeholder="Optional"
              type="number"
              value={form.usageLimit}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
            Per user limit
            <input
              className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm outline-none"
              min="1"
              onChange={(event) => onChange({ ...form, perUserLimit: event.target.value })}
              type="number"
              value={form.perUserLimit}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
            Starts
            <input
              className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm outline-none"
              onChange={(event) => onChange({ ...form, startsAt: event.target.value })}
              type="date"
              value={form.startsAt}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#1F1720]">
            Expires
            <input
              className="h-11 rounded-xl border border-[#F7D9E2] px-3 text-sm outline-none"
              onChange={(event) => onChange({ ...form, expiresAt: event.target.value })}
              type="date"
              value={form.expiresAt}
            />
          </label>
        </div>
        <label className="flex items-center gap-3 rounded-xl bg-[#FFF5F7] px-4 py-3 text-sm font-bold text-[#1F1720]">
          <input
            checked={form.isActive}
            onChange={(event) => onChange({ ...form, isActive: event.target.checked })}
            type="checkbox"
          />
          Active coupon
        </label>
        <button
          className="h-12 rounded-xl bg-[#EC4C84] text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving coupon..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
        </button>
        {editingCoupon ? (
          <button
            className="h-11 rounded-xl border border-[#F7D9E2] bg-white text-sm font-bold text-[#6F6570]"
            onClick={onCancelEdit}
            type="button"
          >
            Cancel edit
          </button>
        ) : null}
      </form>
    </aside>
  );
}

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [discountType, setDiscountType] = useState<CouponDiscountType | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyCouponId, setBusyCouponId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await couponApi.listAdmin({
        discountType: discountType === "ALL" ? undefined : discountType,
        isActive: activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE",
        limit: 20,
        page,
        search: search.trim() || undefined,
      });
      setCoupons(result.coupons);
      setMeta(result.meta);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
      setCoupons([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, discountType, page, search]);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const stats = useMemo(() => {
    const active = coupons.filter((coupon) => getCouponStatus(coupon) === "Active").length;
    const inactive = coupons.filter((coupon) => !coupon.isActive).length;
    const expired = coupons.filter((coupon) => getCouponStatus(coupon) === "Expired").length;

    return [
      { label: "Total coupons", value: String(meta?.total ?? coupons.length), icon: Tags },
      { label: "Visible active", value: String(active), icon: Star },
      { label: "Visible inactive", value: String(inactive), icon: Trash2 },
      { label: "Visible expired", value: String(expired), icon: ChevronDown },
    ];
  }, [coupons, meta]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCoupon(null);
    setFormError(null);
  };

  const handleEdit = async (coupon: Coupon) => {
    try {
      setBusyCouponId(coupon.id);
      setError(null);
      setSuccessMessage(null);
      const fullCoupon = await couponApi.getAdmin(coupon.id);
      setEditingCoupon(fullCoupon);
      setForm(couponToForm(fullCoupon));
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setBusyCouponId(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm(form);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      setError(null);
      setSuccessMessage(null);
      const payload = buildPayload(form);

      if (editingCoupon) {
        await couponApi.updateAdmin(editingCoupon.id, payload);
        setSuccessMessage("Coupon updated successfully.");
      } else {
        await couponApi.createAdmin(payload);
        setSuccessMessage("Coupon created successfully.");
      }

      resetForm();
      await loadCoupons();
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (coupon: Coupon) => {
    const confirmed = window.confirm(`Deactivate coupon ${coupon.code}? This keeps the record but marks it inactive.`);

    if (!confirmed) {
      return;
    }

    try {
      setBusyCouponId(coupon.id);
      setError(null);
      setSuccessMessage(null);
      await couponApi.deactivateAdmin(coupon.id);
      setSuccessMessage("Coupon deactivated successfully.");
      await loadCoupons();
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setBusyCouponId(null);
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="min-w-0 text-[#1F1720]">
      <div className="min-w-0 flex-1">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_30rem]">
          <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[100rem]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-4xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>
                    Coupons <Heart className="inline h-5 w-5 text-[#EC4C84]" />
                  </h1>
                  <p className="mt-1 text-sm text-[#6F6570]">Create and manage coupon codes.</p>
                </div>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EC4C84] px-5 text-sm font-bold text-white shadow-lg shadow-pink-200"
                  onClick={resetForm}
                  type="button"
                >
                  <Plus className="h-4 w-4" /> New coupon
                </button>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div className="rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100" key={stat.label}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#6F6570]">{stat.label}</p>
                          <p className="mt-2 text-2xl font-bold text-[#1F1720]">{stat.value}</p>
                          <p className="mt-1 text-xs font-bold text-[#EC4C84]">Loaded from API</p>
                        </div>
                        <span className="grid h-13 w-13 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
                          <Icon className="h-6 w-6" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3">
                {successMessage ? <Notice message={successMessage} tone="success" /> : null}
                {error ? <Notice message={error} tone="error" /> : null}
              </div>

              <div className="mt-7 rounded-2xl border border-[#F7D9E2] bg-white p-4 shadow-sm shadow-pink-100">
                <form className="flex flex-col gap-3 lg:flex-row" onSubmit={handleSearchSubmit}>
                  <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#F7D9E2] bg-white px-4">
                    <Search className="h-4 w-4 text-[#9D8F98]" />
                    <input
                      className="min-w-0 flex-1 text-sm outline-none placeholder:text-[#9D8F98]"
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search code or title"
                      value={searchInput}
                    />
                  </div>
                  <select
                    className="h-11 rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm font-semibold text-[#6F6570] outline-none"
                    onChange={(event) => {
                      setPage(1);
                      setDiscountType(event.target.value as CouponDiscountType | "ALL");
                    }}
                    value={discountType}
                  >
                    <option value="ALL">All types</option>
                    {discountTypes.map((type) => (
                      <option key={type} value={type}>{displayLabel(type)}</option>
                    ))}
                  </select>
                  <select
                    className="h-11 rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm font-semibold text-[#6F6570] outline-none"
                    onChange={(event) => {
                      setPage(1);
                      setActiveFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE");
                    }}
                    value={activeFilter}
                  >
                    <option value="ALL">All statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EC4C84] px-5 text-sm font-bold text-white" type="submit">
                    <Search className="h-4 w-4" /> Search
                  </button>
                </form>

                <div className="mt-4 overflow-x-auto">
                  {isLoading ? (
                    <StateCard description="Loading coupon records." title="Loading coupons" />
                  ) : coupons.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
                      <div className="grid min-w-[78rem] grid-cols-[1fr_1.5fr_1.3fr_8rem_8rem_8rem_8rem_10rem] border-b border-[#F7D9E2] px-4 py-3 text-xs font-bold text-[#6F6570]">
                        <span>Code</span>
                        <span>Title</span>
                        <span>Discount</span>
                        <span>Usage</span>
                        <span>Status</span>
                        <span>Starts</span>
                        <span>Expires</span>
                        <span>Actions</span>
                      </div>
                      <div className="min-w-[78rem]">
                        {coupons.map((coupon) => (
                          <div className="grid grid-cols-[1fr_1.5fr_1.3fr_8rem_8rem_8rem_8rem_10rem] items-center border-b border-[#F7D9E2]/70 px-4 py-4 text-sm last:border-b-0" key={coupon.id}>
                            <span className="font-bold text-[#EC4C84]">{coupon.code}</span>
                            <span>
                              <span className="block font-bold text-[#1F1720]">{coupon.title}</span>
                              <span className="text-xs text-[#6F6570]">{coupon.description ?? "No description"}</span>
                            </span>
                            <span className="text-xs font-semibold text-[#6F6570]">
                              {displayLabel(coupon.discountType)} - {coupon.discountType === "PERCENTAGE_DISCOUNT" ? `${asNumber(coupon.discountValue)}%` : formatCurrency(coupon.discountValue)}
                            </span>
                            <span className="text-xs font-semibold text-[#6F6570]">
                              {coupon.usedCount}/{coupon.usageLimit ?? "No limit"}
                            </span>
                            <span><Badge label={getCouponStatus(coupon)} /></span>
                            <span className="text-xs text-[#6F6570]">{formatDate(coupon.startsAt)}</span>
                            <span className="text-xs text-[#6F6570]">{formatDate(coupon.expiresAt)}</span>
                            <span className="flex gap-2">
                              <button
                                className="rounded-xl border border-[#F7D9E2] bg-white px-3 py-2 text-xs font-bold text-[#EC4C84] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={busyCouponId === coupon.id}
                                onClick={() => void handleEdit(coupon)}
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                className="rounded-xl border border-[#F7D9E2] bg-white px-3 py-2 text-xs font-bold text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={busyCouponId === coupon.id || !coupon.isActive}
                                onClick={() => void handleDeactivate(coupon)}
                                type="button"
                              >
                                Deactivate
                              </button>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <StateCard
                      description={error ? "Refresh the page to try again." : "No coupons match this view."}
                      title={error ? "Coupon API unavailable" : "No coupons found"}
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 text-sm text-[#6F6570] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {meta ? `Showing page ${meta.page} of ${meta.totalPages || 1} - ${meta.total} total` : "Pagination appears after coupons load."}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="rounded-xl border border-[#F7D9E2] bg-white px-4 py-2 font-bold text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!meta || page <= 1 || isLoading}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      type="button"
                    >
                      Previous
                    </button>
                    <button
                      className="rounded-xl border border-[#F7D9E2] bg-white px-4 py-2 font-bold text-[#6F6570] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!meta || page >= meta.totalPages || isLoading}
                      onClick={() => setPage((current) => current + 1)}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </main>
          <CouponForm
            editingCoupon={editingCoupon}
            error={formError}
            form={form}
            isSaving={isSaving}
            onCancelEdit={resetForm}
            onChange={setForm}
            onSubmit={(event) => void handleSubmit(event)}
          />
        </div>
      </div>
    </div>
  );
}
