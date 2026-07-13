import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Gift, Heart, MapPin, ShieldCheck, Sparkles, Trash2, UserRound } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { normalizeApiError } from "../../lib/apiError";
import { accountApi, type AccountProfile } from "../../services/accountApi";
import { addressApi, type Address, type AddressPayload } from "../../services/addressApi";
import { formatCurrency } from "../../utils/formatCurrency";

type AddressFormState = AddressPayload;

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
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

const minimumPhoneDigits = 7;
const maximumPhoneDigits = 15;

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

const buildAddressPayload = (form: AddressFormState): AddressPayload => ({
  fullName: form.fullName.trim(),
  phone: form.phone.trim(),
  province: form.province.trim(),
  district: form.district.trim(),
  city: form.city.trim(),
  streetAddress: form.streetAddress.trim(),
  isDefault: form.isDefault,
  ...(form.landmark?.trim() && { landmark: form.landmark.trim() }),
});

const validateAddressForm = (form: AddressFormState) => {
  if (!form.fullName.trim()) return "Full name is required.";
  if (!form.phone.trim()) return "Phone number is required.";
  if (!/^\d+$/.test(form.phone)) return "Phone number must contain digits only.";
  if (form.phone.length < minimumPhoneDigits) return "Phone number must contain at least 7 digits.";
  if (!form.province.trim()) return "Province is required.";
  if (!form.district.trim()) return "District is required.";
  if (!form.city.trim()) return "City is required.";
  if (!form.streetAddress.trim()) return "Street address is required.";
  return null;
};

function StateMessage({
  message,
  tone = "rose",
}: {
  message: string;
  tone?: "rose" | "green";
}) {
  return (
    <p
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
        tone === "green"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700 shadow-emerald-100"
          : "border-red-100 bg-red-50 text-red-700 shadow-red-100"
      }`}
    >
      {message}
    </p>
  );
}

function AddressForm({
  form,
  isSaving,
  onCancel,
  onChange,
  onSubmit,
}: {
  form: AddressFormState;
  isSaving: boolean;
  onCancel: () => void;
  onChange: (form: AddressFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const update = (updates: Partial<AddressFormState>) => onChange({ ...form, ...updates });

  return (
    <form className="mt-5 grid gap-4 rounded-[1.5rem] border border-[#F7D9E2] bg-[#FFF9FA] p-5" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name *" onChange={(event) => update({ fullName: event.target.value })} value={form.fullName} />
        <Input
          inputMode="numeric"
          label="Phone *"
          maxLength={maximumPhoneDigits}
          onChange={(event) => update({ phone: digitsOnly(event.target.value) })}
          value={form.phone}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Province *" onChange={(event) => update({ province: event.target.value })} value={form.province} />
        <Input label="District *" onChange={(event) => update({ district: event.target.value })} value={form.district} />
        <Input label="City *" onChange={(event) => update({ city: event.target.value })} value={form.city} />
      </div>
      <Input label="Street address *" onChange={(event) => update({ streetAddress: event.target.value })} value={form.streetAddress} />
      <Input label="Landmark" onChange={(event) => update({ landmark: event.target.value })} value={form.landmark ?? ""} />
      <label className="flex items-center gap-2 text-sm font-semibold text-[#6F6570]">
        <input
          checked={form.isDefault}
          className="h-4 w-4 accent-[#EC4C84]"
          onChange={(event) => update({ isDefault: event.target.checked })}
          type="checkbox"
        />
        Save as default address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving..." : "Save address"}
        </button>
        <button
          className="rounded-xl border border-[#F7D9E2] bg-white px-5 py-3 text-sm font-bold text-[#EC4C84]"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AccountPage() {
  const { refreshMe, user } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const accountCards = useMemo<Array<[string, string, typeof Heart]>>(
    () => [
      ["Saved addresses", `${addresses.length} saved delivery ${addresses.length === 1 ? "address" : "addresses"}.`, MapPin],
      ["Orders", `${profile?.profile?.totalOrders ?? 0} orders placed.`, Sparkles],
      ["Total spent", formatCurrency(profile?.profile?.totalSpent ?? 0), Gift],
    ],
    [addresses.length, profile?.profile?.totalOrders, profile?.profile?.totalSpent],
  );

  const loadAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileResult, addressResult] = await Promise.all([
        accountApi.profile(),
        addressApi.listMine(),
      ]);
      setProfile(profileResult);
      setAddresses(addressResult);
      setProfileForm({
        fullName: profileResult.fullName,
        phone: profileResult.phone,
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAccount();
  }, []);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phone = digitsOnly(profileForm.phone);

    if (!profileForm.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (phone.length < minimumPhoneDigits) {
      setError("Phone number must contain at least 7 digits.");
      return;
    }

    try {
      setIsSavingProfile(true);
      setError(null);
      setSuccessMessage(null);
      const updatedProfile = await accountApi.updateProfile({
        fullName: profileForm.fullName.trim(),
        phone,
      });
      setProfile(updatedProfile);
      setProfileForm({
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone,
      });
      setSuccessMessage("Profile updated successfully.");
      await refreshMe();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const startAddressCreate = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setAddressError(null);
    setShowAddressForm(true);
  };

  const startAddressEdit = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      fullName: address.fullName,
      phone: digitsOnly(address.phone),
      province: address.province,
      district: address.district,
      city: address.city,
      streetAddress: address.streetAddress,
      landmark: address.landmark ?? "",
      isDefault: address.isDefault,
    });
    setAddressError(null);
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateAddressForm(addressForm);

    if (validationError) {
      setAddressError(validationError);
      return;
    }

    try {
      setIsSavingAddress(true);
      setError(null);
      setAddressError(null);
      setSuccessMessage(null);
      const payload = buildAddressPayload(addressForm);
      const savedAddress = editingAddressId
        ? await addressApi.update(editingAddressId, payload)
        : await addressApi.create(payload);

      setAddresses((currentAddresses) => {
        const nextAddresses = editingAddressId
          ? currentAddresses.map((address) => (
              address.id === savedAddress.id ? savedAddress : address
            ))
          : [savedAddress, ...currentAddresses];

        return nextAddresses.map((address) => ({
          ...address,
          isDefault: savedAddress.isDefault && address.id !== savedAddress.id
            ? false
            : address.isDefault,
        }));
      });
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddressForm);
      setSuccessMessage(editingAddressId ? "Address updated successfully." : "Address added successfully.");
    } catch (saveError) {
      setAddressError(getApiErrorMessage(saveError));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleAddressDelete = async (address: Address) => {
    const confirmed = window.confirm(`Delete address for ${address.fullName}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setAddressError(null);
      setSuccessMessage(null);
      await addressApi.delete(address.id);
      setAddresses((currentAddresses) => currentAddresses.filter((item) => item.id !== address.id));
      setSuccessMessage("Address deleted successfully.");
    } catch (deleteError) {
      const message = getApiErrorMessage(deleteError);
      setAddressError(
        message.toLowerCase().includes("used by an order")
          ? "This address is linked to an order and cannot be deleted."
          : message,
      );
    }
  };

  return (
    <section className="grid gap-7">
      <div className="overflow-hidden rounded-[2rem] border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF0DA] p-7 shadow-sm shadow-pink-100">
        <Badge tone="rose">Customer account</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-[#1F1720]" style={serifStyle}>
          My AMY Shop
        </h1>
        <p className="mt-3 max-w-2xl text-[#6F6570]">
          Manage your profile and saved delivery addresses in one place.
        </p>
      </div>

      {isLoading ? <StateMessage message="Loading your account..." tone="green" /> : null}
      {error ? <StateMessage message={error} /> : null}
      {successMessage ? <StateMessage message={successMessage} tone="green" /> : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <Card className="bg-white/90">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-[#FDECEF] p-3 text-[#EC4C84]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#1F1720]">Profile details</h2>
              <p className="text-sm text-[#6F6570]">Update the profile details currently available for your account.</p>
            </div>
          </div>
          <form className="grid gap-4" onSubmit={handleProfileSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))} value={profileForm.fullName} />
              <Input
                inputMode="numeric"
                label="Phone"
                maxLength={maximumPhoneDigits}
                onChange={(event) => setProfileForm((current) => ({ ...current, phone: digitsOnly(event.target.value) }))}
                value={profileForm.phone}
              />
              <Input label="Email" readOnly value={profile?.email ?? user?.email ?? ""} />
              <Input label="Role" readOnly value={profile?.role ?? user?.role ?? ""} />
              <Input label="Status" readOnly value={profile?.status ?? user?.status ?? ""} />
              <Input label="Phone verified" readOnly value={(profile?.phoneVerified ?? user?.phoneVerified) ? "Yes" : "No"} />
            </div>
            <button
              className="w-fit rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 disabled:cursor-not-allowed disabled:bg-[#EAB5C6] disabled:shadow-none"
              disabled={isSavingProfile || isLoading}
              type="submit"
            >
              {isSavingProfile ? "Saving..." : "Update profile"}
            </button>
          </form>
        </Card>

        <Card className="bg-[#FFF5F7]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-6 w-6 text-[#39B86D]" />
            <div>
              <h2 className="font-bold text-[#1F1720]">Account safety</h2>
              <p className="mt-2 text-sm leading-6 text-[#6F6570]">
                Password changes and profile image uploads are coming soon in the customer UI.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="stone">Password Soon</Badge>
                <Badge tone="stone">Profile image Soon</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {accountCards.map(([title, description, Icon]) => (
          <Card className="bg-white/90" key={title}>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#FDECEF] text-[#EC4C84]">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="font-bold text-[#1F1720]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#6F6570]">{description}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-white/90">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1F1720]">Saved addresses</h2>
            <p className="mt-1 text-sm text-[#6F6570]">Create, edit, or remove your saved delivery addresses.</p>
          </div>
          <button
            className="rounded-xl bg-[#EC4C84] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200"
            onClick={startAddressCreate}
            type="button"
          >
            Add address
          </button>
        </div>
        {addressError ? <div className="mt-5"><StateMessage message={addressError} /></div> : null}
        {showAddressForm ? (
          <AddressForm
            form={addressForm}
            isSaving={isSavingAddress}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddressId(null);
              setAddressError(null);
            }}
            onChange={(nextForm) => {
              setAddressForm({ ...nextForm, phone: digitsOnly(nextForm.phone) });
              setAddressError(null);
            }}
            onSubmit={(event) => void handleAddressSubmit(event)}
          />
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {addresses.length > 0 ? addresses.map((address) => (
            <div className="rounded-2xl border border-[#F7D9E2] bg-[#FFF9FA] p-5" key={address.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#1F1720]">{address.fullName}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6F6570]">
                    {address.streetAddress}<br />
                    {address.city}, {address.district}<br />
                    {address.province}<br />
                    {address.phone}
                  </p>
                  {address.landmark ? <p className="mt-2 text-xs text-[#9D8F98]">Landmark: {address.landmark}</p> : null}
                </div>
                {address.isDefault ? <Badge tone="rose">Default</Badge> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-xl border border-[#F7D9E2] bg-white px-4 py-2 text-sm font-bold text-[#EC4C84]" onClick={() => startAddressEdit(address)} type="button">
                  Edit
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-bold text-red-600" onClick={() => void handleAddressDelete(address)} type="button">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-[#F7D9E2] bg-[#FFF9FA] p-6 text-sm text-[#6F6570]">
              No saved addresses yet.
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
