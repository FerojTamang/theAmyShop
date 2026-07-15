import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  Bell,
  Boxes,
  Copy,
  Edit3,
  ExternalLink,
  Gift,
  PackageCheck,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { normalizeApiError } from "../../lib/apiError";
import { categoryApi, type PublicCategory } from "../../services/categoryApi";
import {
  productApi,
  type ProductPayload,
  type PublicProduct,
  type StockType,
} from "../../services/productApi";
import { uploadApi } from "../../services/uploadApi";
import { formatCurrency } from "../../utils/formatCurrency";

type ProductArtType = "box" | "candle" | "mug" | "necklace" | "soap" | "decor" | "journal";

type ProductFormState = {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  productStory: string;
  material: string;
  careInstructions: string;
  makingTime: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  stockType: StockType;
  isCustomizable: boolean;
  isGiftSupported: boolean;
  isActive: boolean;
  images: Array<{
    imageUrl: string;
    publicId: string;
    isPrimary: boolean;
  }>;
};

const categoryColors: Record<string, string> = {
  "Gift Boxes": "bg-pink-100 text-pink-700",
  Candles: "bg-orange-100 text-orange-700",
  Mugs: "bg-purple-100 text-purple-700",
  Necklaces: "bg-rose-100 text-rose-700",
  "Bath & Body": "bg-blue-100 text-blue-700",
  Decor: "bg-teal-100 text-teal-700",
  Stationery: "bg-violet-100 text-violet-700",
};

const stockTypeLabels: Record<StockType, string> = {
  READY_STOCK: "Ready stock",
  MADE_TO_ORDER: "Made to order",
  PRE_ORDER: "Pre-order",
  OUT_OF_STOCK: "Out of stock",
};

const emptyForm: ProductFormState = {
  categoryId: "",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  productStory: "",
  material: "",
  careInstructions: "",
  makingTime: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  stockType: "READY_STOCK",
  isCustomizable: false,
  isGiftSupported: true,
  isActive: true,
  images: [],
};

const optionalString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const inferArt = (product: PublicProduct): ProductArtType => {
  const text = `${product.name} ${product.category?.name ?? ""}`.toLowerCase();

  if (text.includes("candle")) return "candle";
  if (text.includes("mug")) return "mug";
  if (text.includes("necklace") || text.includes("jewelry")) return "necklace";
  if (text.includes("soap")) return "soap";
  if (text.includes("decor") || text.includes("flower")) return "decor";
  if (text.includes("journal")) return "journal";

  return "box";
};

const getProductImage = (product: PublicProduct) => {
  return (
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.images?.[0]?.imageUrl
  );
};

const getStockState = (product: PublicProduct) => {
  if (!product.isActive || product.stockType === "OUT_OF_STOCK" || product.stock <= 0) {
    return "Out of Stock";
  }

  if (product.stock <= 10) {
    return "Low Stock";
  }

  return "In Stock";
};

const formFromProduct = (product: PublicProduct): ProductFormState => {
  const primaryIndex = product.images?.findIndex((image) => image.isPrimary) ?? -1;
  const normalizedPrimaryIndex = primaryIndex >= 0 ? primaryIndex : 0;
  const images = product.images?.length
    ? product.images.map((image, index) => ({
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        isPrimary: index === normalizedPrimaryIndex,
      }))
    : [];

  return {
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description,
    productStory: product.productStory ?? "",
    material: product.material ?? "",
    careInstructions: product.careInstructions ?? "",
    makingTime: product.makingTime ?? "",
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    stock: String(product.stock),
    stockType: product.stockType ?? "READY_STOCK",
    isCustomizable: product.isCustomizable,
    isGiftSupported: product.isGiftSupported,
    isActive: product.isActive,
    images,
  };
};

const buildPayload = (form: ProductFormState): ProductPayload => {
  const price = Number(form.price);
  const compareAtPrice = form.compareAtPrice.trim()
    ? Number(form.compareAtPrice)
    : undefined;
  const stock = Number(form.stock);
  const images = form.images
    .filter((image) => image.imageUrl.trim() && image.publicId.trim())
    .map((image) => ({
      imageUrl: image.imageUrl.trim(),
      publicId: image.publicId.trim(),
      isPrimary: image.isPrimary,
    }));

  return {
    categoryId: form.categoryId,
    name: form.name.trim(),
    ...(optionalString(form.slug) && { slug: optionalString(form.slug) }),
    ...(optionalString(form.shortDescription) && {
      shortDescription: optionalString(form.shortDescription),
    }),
    description: form.description.trim(),
    ...(optionalString(form.productStory) && {
      productStory: optionalString(form.productStory),
    }),
    ...(optionalString(form.material) && { material: optionalString(form.material) }),
    ...(optionalString(form.careInstructions) && {
      careInstructions: optionalString(form.careInstructions),
    }),
    ...(optionalString(form.makingTime) && {
      makingTime: optionalString(form.makingTime),
    }),
    price,
    ...(compareAtPrice !== undefined && { compareAtPrice }),
    stock,
    stockType: form.stockType,
    isCustomizable: form.isCustomizable,
    isGiftSupported: form.isGiftSupported,
    isActive: form.isActive,
    images,
  };
};

function Toggle({
  enabled = true,
  onClick,
}: {
  enabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex h-6 w-11 items-center rounded-full p-1 ${enabled ? "bg-[#EC4C84]" : "bg-[#F7D9E2]"}`}
      onClick={onClick}
      type="button"
    >
      <span className={`h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
    </button>
  );
}

function ProductArt({
  product,
  compact = false,
}: {
  compact?: boolean;
  product: PublicProduct;
}) {
  const imageUrl = getProductImage(product);
  const type = inferArt(product);
  const label: Record<ProductArtType, string> = {
    box: "Gift Box",
    candle: "Candle",
    mug: "mama",
    necklace: "A",
    soap: "Love",
    decor: "Decor",
    journal: "Notes",
  };

  if (imageUrl) {
    return (
      <img
        alt={product.name}
        className={`shrink-0 rounded-xl object-cover ${compact ? "h-14 w-14" : "aspect-square w-full"}`}
        src={imageUrl}
      />
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#FDECEF] via-white to-[#FFF0DA] ${
        compact ? "h-14 w-14" : "aspect-square w-full"
      }`}
    >
      <div className="absolute -right-5 -top-5 h-14 w-14 rounded-full bg-[#EC4C84]/20 blur-lg" />
      <div className="absolute bottom-2 left-2 right-2 rounded-lg border border-white/80 bg-white/70 p-2 text-center shadow-sm">
        <p className="truncate text-xs font-bold text-[#EC4C84]">{label[type]}</p>
      </div>
    </div>
  );
}

function StockDot({ product }: { product: PublicProduct }) {
  const state = getStockState(product);
  const color =
    state === "In Stock" ? "bg-[#39B86D]" : state === "Low Stock" ? "bg-amber-500" : "bg-red-500";

  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}

function StateCard({
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
      <h2 className="mt-4 text-xl font-bold text-[#1F1720]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6F6570]">{description}</p>
    </div>
  );
}

function ProductTable({
  onArchive,
  onEdit,
  products,
}: {
  onArchive: (product: PublicProduct) => void;
  onEdit: (product: PublicProduct) => void;
  products: PublicProduct[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100">
      <div className="grid min-w-[74rem] grid-cols-[3rem_minmax(14rem,1.6fr)_8rem_7rem_7rem_7rem_16rem] border-b border-[#F7D9E2] bg-white px-4 py-3 text-xs font-bold text-[#6F6570]">
        <span><input className="h-4 w-4 accent-[#EC4C84]" type="checkbox" /></span>
        <span>Product</span>
        <span>Category</span>
        <span>Price</span>
        <span>Stock</span>
        <span>Status</span>
        <span className="sticky right-0 z-10 border-l border-[#F7D9E2] bg-white pl-4 shadow-[-10px_0_18px_-18px_rgba(31,23,32,0.55)]">
          Actions
        </span>
      </div>
      {products.map((product) => (
        <div
          className="grid min-w-[74rem] grid-cols-[3rem_minmax(14rem,1.6fr)_8rem_7rem_7rem_7rem_16rem] items-center border-b border-[#F7D9E2]/70 bg-white px-4 py-4 text-sm last:border-b-0"
          key={product.id}
        >
          <span><input className="h-4 w-4 accent-[#EC4C84]" type="checkbox" /></span>
          <div className="flex items-center gap-4">
            <ProductArt compact product={product} />
            <div>
              <p className="font-bold text-[#1F1720]">{product.name}</p>
              <p className="mt-1 text-xs text-[#6F6570]">Slug: {product.slug}</p>
            </div>
          </div>
          <span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${categoryColors[product.category?.name ?? ""] ?? "bg-[#FDECEF] text-[#EC4C84]"}`}>
              {product.category?.name ?? "Uncategorized"}
            </span>
          </span>
          <span>
            <span className="block font-bold text-[#1F1720]">{formatCurrency(product.price)}</span>
            {product.compareAtPrice ? <span className="block text-xs text-[#9D8F98] line-through">{formatCurrency(product.compareAtPrice)}</span> : null}
          </span>
          <span className="flex items-start gap-3">
            <StockDot product={product} />
            <span>
              <span className="block font-bold text-[#1F1720]">{product.stock}</span>
              <span className="text-xs text-[#6F6570]">{getStockState(product)}</span>
            </span>
          </span>
          <span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </span>
          <span className="sticky right-0 z-10 flex min-h-14 items-center gap-2 border-l border-[#F7D9E2] bg-white pl-4 shadow-[-10px_0_18px_-18px_rgba(31,23,32,0.55)]">
            <button
              aria-label="Edit product"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#EC4C84] bg-[#EC4C84] px-3.5 text-xs font-bold text-white shadow-sm shadow-pink-100 hover:bg-[#D93D75] disabled:border-[#F7D9E2] disabled:bg-[#FFF9FA] disabled:text-[#C8A7B1] disabled:shadow-none disabled:cursor-not-allowed"
              onClick={() => onEdit(product)}
              title="Edit product"
              type="button"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
            <button
              aria-label="Archive product"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 text-xs font-bold text-red-600 shadow-sm shadow-pink-50 hover:bg-red-50 disabled:border-[#F7D9E2] disabled:bg-[#FFF9FA] disabled:text-[#C8A7B1] disabled:shadow-none disabled:cursor-not-allowed"
              onClick={() => onArchive(product)}
              title="Archive product"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              Archive
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
      {label}
      <input
        className="h-11 w-full rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm outline-none placeholder:text-[#9D8F98] focus:border-[#EC4C84]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
  label,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
      {label}
      <textarea
        className="min-h-24 w-full rounded-xl border border-[#F7D9E2] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9D8F98] focus:border-[#EC4C84]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  );
}

function SelectField({
  children,
  label,
  onChange,
  required = false,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#6F6570]">
      {label}
      <select
        className="h-11 w-full rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm outline-none focus:border-[#EC4C84]"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function FormSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="mt-5 rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100">
      <h3 className="mb-5 font-bold text-[#1F1720]">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function OptionRow({
  description,
  enabled,
  label,
  onToggle,
}: {
  description: string;
  enabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#6F6570]">{label}</p>
        <p className="mt-1 text-xs text-[#9D8F98]">{description}</p>
      </div>
      <Toggle enabled={enabled} onClick={onToggle} />
    </div>
  );
}

function ProductFormPanel({
  categories,
  editingProduct,
  form,
  formError,
  isSubmitting,
  onCancelEdit,
  onFormChange,
  onSubmit,
}: {
  categories: PublicCategory[];
  editingProduct: PublicProduct | null;
  form: ProductFormState;
  formError: string | null;
  isSubmitting: boolean;
  onCancelEdit: () => void;
  onFormChange: (form: ProductFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [manualPublicId, setManualPublicId] = useState("");
  const [uploadPreviewFailed, setUploadPreviewFailed] = useState(false);
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(() => new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateForm = (updates: Partial<ProductFormState>) => {
    onFormChange({ ...form, ...updates });
  };

  const setPrimaryImage = (index: number) => {
    onFormChange({
      ...form,
      images: form.images.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      })),
    });
  };

  const removeImage = (index: number) => {
    const removedImageWasPrimary = form.images[index]?.isPrimary ?? false;
    const nextImages = form.images.filter((_, imageIndex) => imageIndex !== index);

    if (removedImageWasPrimary && nextImages.length > 0) {
      nextImages[0] = { ...nextImages[0], isPrimary: true };
    }

    onFormChange({ ...form, images: nextImages });
  };

  const appendImage = (imageUrl: string, publicId: string) => {
    const isFirstImage = form.images.length === 0;
    onFormChange({
      ...form,
      images: [
        ...form.images,
        { imageUrl, publicId, isPrimary: isFirstImage },
      ],
    });
  };

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [uploadPreviewUrl]);

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadMessage(null);
    setUploadError(null);
    setUploadPreviewFailed(false);

    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl);
    }

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (file && !allowedTypes.has(file.type)) {
      setSelectedUploadFile(null);
      setUploadPreviewUrl(null);
      setUploadError("Choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      setSelectedUploadFile(null);
      setUploadPreviewUrl(null);
      setUploadError("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedUploadFile(file);
    setUploadPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleProductImageUpload = async () => {
    if (!selectedUploadFile) {
      setUploadError("Choose a JPG, PNG, or WEBP image before uploading.");
      return;
    }

    try {
      setIsUploadingImage(true);
      setUploadMessage(null);
      setUploadError(null);
      const uploadedImage = await uploadApi.uploadProductImage(selectedUploadFile);
      appendImage(uploadedImage.imageUrl, uploadedImage.publicId);
      setSelectedUploadFile(null);
      setUploadPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploadMessage("Image uploaded and added to the product gallery.");
    } catch (error) {
      setUploadError(normalizeApiError(error).message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddManualImage = () => {
    const imageUrl = manualImageUrl.trim();
    const publicId = manualPublicId.trim();

    if (!imageUrl || !publicId) {
      setUploadError("Enter both an image URL and public ID.");
      return;
    }

    try {
      new URL(imageUrl);
    } catch {
      setUploadError("Enter a valid image URL.");
      return;
    }

    appendImage(imageUrl, publicId);
    setManualImageUrl("");
    setManualPublicId("");
    setUploadError(null);
    setUploadMessage("Manual image added to the product gallery.");
  };

  const copyImageUrl = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setUploadError(null);
      setUploadMessage("Image URL copied.");
    } catch {
      setUploadMessage(null);
      setUploadError("Could not copy the image URL. Use View image to copy it manually.");
    }
  };

  return (
    <aside className="border-l border-[#F7D9E2] bg-white px-5 py-7 xl:w-[29rem] xl:shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F1720]">{editingProduct ? "Edit Product" : "Add Product"}</h2>
          {editingProduct ? (
            <p className="mt-1 text-xs font-semibold text-[#EC4C84]">Editing {editingProduct.name}</p>
          ) : null}
        </div>
        {editingProduct ? (
          <button aria-label="Cancel edit" onClick={onCancelEdit} title="Cancel edit" type="button">
            <X className="h-5 w-5 text-[#9D8F98]" />
          </button>
        ) : (
          <X className="h-5 w-5 text-[#9D8F98]" />
        )}
      </div>

      <form onSubmit={onSubmit}>
        <FormSection title="Basic Information">
          <TextField
            label="Product Name *"
            onChange={(name) => updateForm({ name })}
            placeholder="e.g., Relax & Unwind Gift Box"
            required
            value={form.name}
          />
          <SelectField
            label="Category *"
            onChange={(categoryId) => updateForm({ categoryId })}
            required
            value={form.categoryId}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Slug"
            onChange={(slug) => updateForm({ slug })}
            placeholder="relax-unwind-gift-box"
            value={form.slug}
          />
          <TextField
            label="Short Description"
            onChange={(shortDescription) => updateForm({ shortDescription })}
            placeholder="A sweet one-line product summary"
            value={form.shortDescription}
          />
          <TextAreaField
            label="Description *"
            onChange={(description) => updateForm({ description })}
            placeholder="Describe the product clearly"
            required
            value={form.description}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Price *"
              onChange={(price) => updateForm({ price })}
              placeholder="1200"
              required
              type="number"
              value={form.price}
            />
            <TextField
              label="Compare-at price"
              onChange={(compareAtPrice) => updateForm({ compareAtPrice })}
              placeholder="1500"
              type="number"
              value={form.compareAtPrice}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Stock *"
              onChange={(stock) => updateForm({ stock })}
              placeholder="0"
              required
              type="number"
              value={form.stock}
            />
            <SelectField
              label="Stock Type"
              onChange={(stockType) => updateForm({ stockType: stockType as StockType })}
              value={form.stockType}
            >
              {Object.entries(stockTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </div>
        </FormSection>

        <FormSection title="Product Details">
          <TextAreaField
            label="Product Story"
            onChange={(productStory) => updateForm({ productStory })}
            placeholder="Optional story shown on product pages"
            value={form.productStory}
          />
          <TextField
            label="Material"
            onChange={(material) => updateForm({ material })}
            placeholder="Cotton, ceramic, soy wax..."
            value={form.material}
          />
          <TextField
            label="Care Instructions"
            onChange={(careInstructions) => updateForm({ careInstructions })}
            placeholder="Handle with care"
            value={form.careInstructions}
          />
          <TextField
            label="Making Time"
            onChange={(makingTime) => updateForm({ makingTime })}
            placeholder="3-5 business days"
            value={form.makingTime}
          />
        </FormSection>

        <FormSection title="Product Options">
          <OptionRow
            description="Customers can personalize this product."
            enabled={form.isCustomizable}
            label="Customizable"
            onToggle={() => updateForm({ isCustomizable: !form.isCustomizable })}
          />
          <OptionRow
            description="This product can be sent as a gift."
            enabled={form.isGiftSupported}
            label="Supports Gift Packaging"
            onToggle={() => updateForm({ isGiftSupported: !form.isGiftSupported })}
          />
          <OptionRow
            description="Inactive products are hidden from the public catalog."
            enabled={form.isActive}
            label="Active Product"
            onToggle={() => updateForm({ isActive: !form.isActive })}
          />
        </FormSection>

        <FormSection title="Product Images">
          <div className="mb-4 rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#1F1720]">Upload from device</p>
                <p className="mt-1 text-xs font-semibold text-[#6F6570]">Use a clean background and keep the product centered.</p>
              </div>
              <Upload className="h-5 w-5 text-[#EC4C84]" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[#F7D9E2] bg-white p-3 text-xs font-semibold text-[#6F6570]">
              <span>Recommended: 1200 × 1200 px</span>
              <span>Minimum: 800 × 800 px</span>
              <span>JPG, PNG, or WEBP</span>
              <span>Maximum 5 MB</span>
            </div>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#F7D9E2] bg-white px-4 py-5 text-center">
              <input
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={handleUploadFileChange}
                ref={fileInputRef}
                type="file"
              />
              <span className="text-sm font-bold text-[#EC4C84]">Choose product image</span>
              <span className="mt-1 text-xs font-semibold text-[#9D8F98]">
                {selectedUploadFile ? selectedUploadFile.name : "No file selected"}
              </span>
            </label>
            {uploadPreviewUrl ? (
              <div className="mx-auto mt-4 aspect-square w-full max-w-72 overflow-hidden rounded-xl border border-[#F7D9E2] bg-gradient-to-br from-white to-[#FFF5F7]">
                {uploadPreviewFailed ? (
                  <div className="grid h-full w-full place-items-center px-4 text-center text-xs font-semibold text-[#9D8F98]">
                    Image preview is unavailable
                  </div>
                ) : (
                  <img
                    alt="Selected product image preview"
                    className="h-full w-full object-contain p-3"
                    onError={() => setUploadPreviewFailed(true)}
                    src={uploadPreviewUrl}
                  />
                )}
              </div>
            ) : null}
            <button
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#EC4C84] px-4 text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none"
              disabled={isUploadingImage || !selectedUploadFile}
              onClick={() => void handleProductImageUpload()}
              type="button"
            >
              <Upload className="h-4 w-4" />
              {isUploadingImage ? "Uploading..." : "Upload image"}
            </button>
            {uploadMessage ? (
              <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                {uploadMessage}
              </p>
            ) : null}
            {uploadError ? (
              <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {uploadError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {form.images.map((image, index) => (
              <article className="overflow-hidden rounded-2xl border border-[#F7D9E2] bg-white shadow-sm shadow-pink-100" key={`${image.publicId}-${index}`}>
                <div className="relative aspect-square bg-gradient-to-br from-white to-[#FFF5F7]">
                  {failedImageUrls.has(image.imageUrl) ? (
                    <div className="grid h-full w-full place-items-center px-3 text-center text-xs font-semibold text-[#9D8F98]">
                      Image preview is unavailable
                    </div>
                  ) : (
                    <img
                      alt={`Product gallery image ${index + 1}`}
                      className="h-full w-full object-contain p-2"
                      onError={() => setFailedImageUrls((current) => {
                        const next = new Set(current);
                        next.add(image.imageUrl);
                        return next;
                      })}
                      src={image.imageUrl}
                    />
                  )}
                  {image.isPrimary ? (
                    <span className="absolute left-2 top-2 rounded-full bg-[#EC4C84] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                      Primary
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2 p-3">
                  {!image.isPrimary ? (
                    <button
                      className="h-9 rounded-xl bg-[#FFF5F7] text-xs font-bold text-[#EC4C84]"
                      onClick={() => setPrimaryImage(index)}
                      type="button"
                    >
                      Set as primary
                    </button>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-[#F7D9E2] text-xs font-bold text-[#6F6570]"
                      href={image.imageUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                    <button
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-[#F7D9E2] text-xs font-bold text-[#6F6570]"
                      onClick={() => void copyImageUrl(image.imageUrl)}
                      type="button"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy URL
                    </button>
                  </div>
                  <button
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-red-100 bg-red-50 text-xs font-bold text-red-600"
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          {form.images.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] px-4 py-5 text-center text-xs font-semibold text-[#9D8F98]">
              No product images added yet. The first image will become primary automatically.
            </p>
          ) : null}

          <details className="rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-4">
            <summary className="cursor-pointer text-sm font-bold text-[#6F6570]">
              Advanced manual image URL fallback
            </summary>
            <div className="mt-4 grid gap-3">
              <TextField
                label="Image URL"
                onChange={setManualImageUrl}
                placeholder="https://example.test/image.jpg"
                value={manualImageUrl}
              />
              <TextField
                label="Public ID"
                onChange={setManualPublicId}
                placeholder="amy-products/example"
                value={manualPublicId}
              />
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#F7D9E2] bg-white px-4 text-sm font-bold text-[#EC4C84]"
                onClick={handleAddManualImage}
                type="button"
              >
                <Plus className="h-4 w-4" /> Add manual image
              </button>
            </div>
          </details>
        </FormSection>

        {formError ? (
          <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100">
            {formError}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-12 rounded-xl border border-[#F7D9E2] bg-white text-sm font-bold text-[#6F6570]"
            onClick={
              editingProduct
                ? onCancelEdit
                : () => onFormChange({ ...emptyForm, categoryId: categories[0]?.id ?? "" })
            }
            type="button"
          >
            {editingProduct ? "Cancel edit" : "Reset"}
          </button>
          <button
            className="h-12 rounded-xl bg-[#EC4C84] text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </aside>
  );
}

function SummaryCards({ products }: { products: PublicProduct[] }) {
  const activeCount = products.filter((product) => product.isActive).length;
  const lowStockCount = products.filter((product) => getStockState(product) === "Low Stock").length;
  const outOfStockCount = products.filter((product) => getStockState(product) === "Out of Stock").length;
  const cards = [
    ["Total Products", String(products.length), "Live catalog rows", Gift],
    ["Active Products", String(activeCount), "Visible publicly", PackageCheck],
    ["Low Stock", String(lowStockCount), "10 or fewer left", Bell],
    ["Out of Stock", String(outOfStockCount), "Needs attention", Boxes],
  ] as const;

  return (
    <div className="mt-7 grid gap-5 md:grid-cols-4">
      {cards.map(([label, value, delta, Icon]) => (
        <div className="rounded-2xl border border-[#F7D9E2] bg-white p-5 shadow-sm shadow-pink-100" key={label}>
          <span className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#FDECEF] text-[#EC4C84]">
            <Icon className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#6F6570]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#1F1720]">{value}</p>
          <p className={`mt-3 text-xs font-bold ${label.includes("Low") || label.includes("Out") ? "text-red-500" : "text-[#39B86D]"}`}>
            {delta}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<PublicProduct | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayedProducts = products;

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const result = await productApi.list({ page: 1, limit: 100 });
      setProducts(result.products);
    } catch (error) {
      setLoadError(normalizeApiError(error).message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoryError(null);
      const result = await categoryApi.list();
      setCategories(result);
      setForm((currentForm) => ({
        ...currentForm,
        categoryId: currentForm.categoryId || result[0]?.id || "",
      }));
    } catch (error) {
      setCategoryError(normalizeApiError(error).message);
      setCategories([]);
    }
  };

  useEffect(() => {
    void loadProducts();
    void loadCategories();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!form.categoryId) {
      setFormError("Select a category before saving.");
      return;
    }

    if (!form.name.trim() || !form.description.trim()) {
      setFormError("Product name and description are required.");
      return;
    }

    const price = Number(form.price);
    const compareAtPrice = form.compareAtPrice.trim()
      ? Number(form.compareAtPrice)
      : undefined;
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      setFormError("Price must be a valid positive number.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("Stock must be a whole number of zero or more.");
      return;
    }

    if (compareAtPrice !== undefined && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
      setFormError("Compare-at price must be a valid positive number.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload(form);

      if (editingProduct) {
        const updatedProduct = await productApi.update(editingProduct.id, payload);
        setProducts((currentProducts) => currentProducts.map((product) => (
          product.id === updatedProduct.id ? updatedProduct : product
        )));
        setSuccessMessage("Product updated successfully.");
      } else {
        const createdProduct = await productApi.create(payload);
        setProducts((currentProducts) => [createdProduct, ...currentProducts]);
        setSuccessMessage("Product created successfully.");
      }

      setEditingProduct(null);
      setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
      await loadProducts();
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: PublicProduct) => {
    setEditingProduct(product);
    setForm(formFromProduct(product));
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setFormError(null);
  };

  const handleArchive = async (product: PublicProduct) => {
    const confirmed = window.confirm(
      `Archive "${product.name}"? This uses the backend delete endpoint and deactivates the product.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSuccessMessage(null);
      setLoadError(null);
      await productApi.archive(product.id);
      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id));
      setSuccessMessage("Product archived successfully. It is now hidden from the public product list.");
      await loadProducts();
    } catch (error) {
      setLoadError(normalizeApiError(error).message);
    }
  };

  return (
    <div className="min-w-0 bg-white text-[#1F1720]">
      <div className="min-w-0 flex-1">
        <div className="grid min-h-[calc(100vh-4.8rem)] xl:grid-cols-[minmax(0,1fr)_29rem]">
          <main className="min-w-0 bg-white px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#1F1720]">Products</h1>
                  <p className="mt-2 text-sm text-[#6F6570]">Manage and organize your store products.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#EC4C84] px-5 text-sm font-bold text-white shadow-lg shadow-pink-200"
                    onClick={handleCancelEdit}
                    type="button"
                  >
                    <Plus className="h-4 w-4" /> Add Product
                  </button>
                </div>
              </div>

              {successMessage ? (
                <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-100">
                  {successMessage}
                </p>
              ) : null}
              {loadError ? (
                <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm shadow-red-100">
                  {loadError}
                </p>
              ) : null}
              {categoryError ? (
                <p className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 shadow-sm shadow-amber-100">
                  Categories could not be loaded: {categoryError}
                </p>
              ) : null}
              <div className="mt-7">
                {isLoading ? (
                  <StateCard
                    description="Loading products."
                    title="Loading products"
                  />
                ) : displayedProducts.length > 0 ? (
                  <ProductTable
                    onArchive={handleArchive}
                    onEdit={handleEdit}
                    products={displayedProducts}
                  />
                ) : (
                  <StateCard
                    description="There are no active products to show yet."
                    title="No products yet"
                  />
                )}
              </div>
              <p className="mt-5 text-sm text-[#6F6570]">
                Showing {displayedProducts.length} products
              </p>

              <SummaryCards products={displayedProducts} />
            </div>
          </main>
          <ProductFormPanel
            categories={categories}
            editingProduct={editingProduct}
            form={form}
            formError={formError}
            isSubmitting={isSubmitting}
            onCancelEdit={handleCancelEdit}
            onFormChange={setForm}
            onSubmit={(event) => void handleSubmit(event)}
          />
        </div>
      </div>
    </div>
  );
}
