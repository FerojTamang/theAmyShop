import { AtSign, Gift, Music2, Save, Settings2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Input } from "../../components/ui/Input";
import { normalizeApiError } from "../../lib/apiError";
import {
  defaultStoreSettings,
  storeSettingsApi,
  type StoreSettings,
} from "../../services/storeSettingsApi";

const emptyForm: StoreSettings = {
  footerDescription: "",
  instagramUrl: null,
  tiktokUrl: null,
  logoUrl: null,
};

export function AdminSettingsPage() {
  const [form, setForm] = useState<StoreSettings>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewLogoFailed, setPreviewLogoFailed] = useState(false);

  useEffect(() => {
    storeSettingsApi.getAdmin()
      .then(setForm)
      .catch((loadError) => setError(normalizeApiError(loadError).message))
      .finally(() => setIsLoading(false));
  }, []);

  const updateField = (field: keyof StoreSettings, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess(null);
    if (field === "logoUrl") setPreviewLogoFailed(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await storeSettingsApi.updateAdmin({
        footerDescription: form.footerDescription.trim() || null,
        instagramUrl: form.instagramUrl?.trim() || null,
        tiktokUrl: form.tiktokUrl?.trim() || null,
        logoUrl: form.logoUrl?.trim() || null,
      });
      setForm(updated);
      setPreviewLogoFailed(false);
      setSuccess("Store settings updated successfully.");
    } catch (saveError) {
      setError(normalizeApiError(saveError).message);
    } finally {
      setIsSaving(false);
    }
  };

  const description = form.footerDescription || defaultStoreSettings.footerDescription;
  const showPreviewLogo = Boolean(form.logoUrl && !previewLogoFailed);

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <div className="rounded-[2rem] border border-white/90 bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF0DA] p-6 shadow-[0_18px_45px_rgba(115,72,86,0.08)] ring-1 ring-[#F7D9E2] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FDECEF] text-[#EC4C84]"><Settings2 className="h-6 w-6" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">Storefront branding</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>Store Settings</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6F6570]">Manage the safe public branding and social links shown in the storefront footer.</p>
            </div>
          </div>
        </div>

        {error ? <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {success ? <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p> : null}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form className="rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-[0_14px_36px_rgba(115,72,86,0.08)] ring-1 ring-[#F7D9E2] sm:p-8" onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold text-[#1F1720]">Footer details</h3>
            <p className="mt-2 text-sm text-[#6F6570]">Paste a secure Cloudinary URL for the circular brand logo.</p>
            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-sm font-medium text-[#6b5550]">
                <span>Footer description</span>
                <textarea className="min-h-28 rounded-2xl border border-rose-100 bg-white/90 px-4 py-3 text-sm text-[#332522] shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100/80" maxLength={500} onChange={(event) => updateField("footerDescription", event.target.value)} value={form.footerDescription} />
              </label>
              <Input label="Instagram URL" onChange={(event) => updateField("instagramUrl", event.target.value)} placeholder="https://www.instagram.com/the_amy_shop" type="url" value={form.instagramUrl ?? ""} />
              <Input label="TikTok URL" onChange={(event) => updateField("tiktokUrl", event.target.value)} placeholder="https://www.tiktok.com/@username" type="url" value={form.tiktokUrl ?? ""} />
              <Input label="Logo URL" onChange={(event) => updateField("logoUrl", event.target.value)} placeholder="https://res.cloudinary.com/..." type="url" value={form.logoUrl ?? ""} />
            </div>
            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-[#D93D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" disabled={isLoading || isSaving} type="submit">
              <Save className="h-4 w-4" />{isSaving ? "Saving..." : "Save settings"}
            </button>
          </form>

          <div className="rounded-[2rem] border border-white/90 bg-gradient-to-br from-white to-[#FFF5F7] p-6 shadow-[0_14px_36px_rgba(115,72,86,0.08)] ring-1 ring-[#F7D9E2] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#EC4C84]">Live preview</p>
            <div className="mt-6 flex items-center gap-4">
              {showPreviewLogo ? (
                <img alt="Store logo preview" className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-lg ring-1 ring-[#F7D9E2]" onError={() => setPreviewLogoFailed(true)} src={form.logoUrl ?? ""} />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#F06494] to-[#D93D73] text-white shadow-lg shadow-pink-200"><Gift className="h-7 w-7" /></span>
              )}
              <div><h3 className="text-2xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>The AMY Shop</h3><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#EC4C84]">Thoughtful gifting</p></div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#6F6570]">{description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {form.instagramUrl ? <span className="inline-flex items-center gap-2 rounded-full border border-[#F7D9E2] bg-white px-4 py-2 text-sm font-bold text-[#6F6570]"><AtSign className="h-4 w-4" />Instagram</span> : null}
              {form.tiktokUrl ? <span className="inline-flex items-center gap-2 rounded-full border border-[#F7D9E2] bg-white px-4 py-2 text-sm font-bold text-[#6F6570]"><Music2 className="h-4 w-4" />TikTok</span> : null}
              {!form.instagramUrl && !form.tiktokUrl ? <p className="text-sm text-[#9D8F98]">Social links are hidden when no URLs are configured.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
