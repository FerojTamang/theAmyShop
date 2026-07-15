import { BadgeCheck, CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { normalizeApiError } from "../../lib/apiError";
import { accountApi, type AccountProfile } from "../../services/accountApi";
import { formatDate } from "../../utils/formatDate";

const minimumPhoneDigits = 7;
const maximumPhoneDigits = 15;
const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, maximumPhoneDigits);
const formatLabel = (value: string) => value.toLowerCase().replaceAll("_", " ");

function StatusMessage({ children, success = false }: { children: string; success?: boolean }) {
  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${success ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-700"}`}>
      {children}
    </p>
  );
}

export function AdminProfilePage() {
  const { refreshMe } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError(null);
        const result = await accountApi.profile();
        setProfile(result);
        setForm({ fullName: result.fullName, phone: result.phone });
      } catch (loadError) {
        setError(normalizeApiError(loadError).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullName = form.fullName.trim();
    const phone = digitsOnly(form.phone);

    if (!fullName) {
      setError("Full name is required.");
      return;
    }
    if (phone.length < minimumPhoneDigits) {
      setError("Phone number must contain at least 7 digits.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      const updatedProfile = await accountApi.updateProfile({ fullName, phone });
      setProfile(updatedProfile);
      setForm({ fullName: updatedProfile.fullName, phone: updatedProfile.phone });
      await refreshMe();
      setSuccess("Profile updated successfully.");
    } catch (saveError) {
      setError(normalizeApiError(saveError).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <div className="rounded-[2rem] border border-white/90 bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF0DA] p-6 shadow-[0_18px_45px_rgba(115,72,86,0.08)] ring-1 ring-[#F7D9E2] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FDECEF] text-[#EC4C84]">
              <UserRound className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EC4C84]">Admin account</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#1F1720]" style={{ fontFamily: "Georgia, serif" }}>Profile details</h2>
              <p className="mt-2 text-sm leading-6 text-[#6F6570]">Manage the contact details associated with your admin account.</p>
            </div>
          </div>
        </div>

        {isLoading ? <StatusMessage success>Loading profile...</StatusMessage> : null}
        {error ? <StatusMessage>{error}</StatusMessage> : null}
        {success ? <StatusMessage success>{success}</StatusMessage> : null}

        {!isLoading && profile ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <form className="rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-[0_14px_36px_rgba(115,72,86,0.08)] ring-1 ring-[#F7D9E2] sm:p-8" onSubmit={handleSubmit}>
              <h3 className="text-xl font-bold text-[#1F1720]">Contact information</h3>
              <p className="mt-2 text-sm text-[#6F6570]">Your email and account permissions are managed separately.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input label="Full name" onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} value={form.fullName} />
                <Input inputMode="numeric" label="Phone" maxLength={maximumPhoneDigits} onChange={(event) => setForm((current) => ({ ...current, phone: digitsOnly(event.target.value) }))} value={form.phone} />
                <Input className="cursor-not-allowed bg-stone-50 text-[#6F6570]" label="Email" readOnly value={profile.email ?? "Not provided"} />
                <Input className="cursor-not-allowed bg-stone-50 capitalize text-[#6F6570]" label="Role" readOnly value={formatLabel(profile.role)} />
                <Input className="cursor-not-allowed bg-stone-50 capitalize text-[#6F6570]" label="Account status" readOnly value={formatLabel(profile.status)} />
              </div>
              <button className="mt-6 rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-[#D93D73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4C84] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Update profile"}
              </button>
            </form>

            <div className="rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-[0_14px_36px_rgba(115,72,86,0.08)] ring-1 ring-[#F7D9E2] sm:p-8">
              <h3 className="text-xl font-bold text-[#1F1720]">Account overview</h3>
              <dl className="mt-6 grid gap-5 text-sm">
                <div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-[#EC4C84]" /><div><dt className="font-bold text-[#1F1720]">Email verification</dt><dd className="mt-1 text-[#6F6570]">{profile.emailVerified ? "Verified" : "Not verified"}</dd></div></div>
                <div className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-5 w-5 text-[#EC4C84]" /><div><dt className="font-bold text-[#1F1720]">Phone verification</dt><dd className="mt-1 text-[#6F6570]">{profile.phoneVerified ? "Verified" : "Not verified"}</dd></div></div>
                <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#EC4C84]" /><div><dt className="font-bold text-[#1F1720]">Access level</dt><dd className="mt-1 capitalize text-[#6F6570]">{formatLabel(profile.role)}</dd></div></div>
                <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-5 w-5 text-[#EC4C84]" /><div><dt className="font-bold text-[#1F1720]">Account dates</dt><dd className="mt-1 leading-6 text-[#6F6570]">Created {formatDate(profile.createdAt)}<br />Updated {formatDate(profile.updatedAt)}</dd></div></div>
              </dl>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
