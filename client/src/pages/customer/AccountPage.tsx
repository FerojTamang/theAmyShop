import { Gift, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

export function AccountPage() {
  const { user } = useAuth();

  return (
    <section className="grid gap-6">
      <div>
        <Badge tone="rose">Customer account</Badge>
        <h1 className="mt-3 text-3xl font-bold text-stone-950">My account</h1>
        <p className="mt-2 text-stone-600">
          Profile, verification, and gifting preferences will grow from this shell.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-950">Profile details</h2>
              <p className="text-sm text-stone-500">Connected to auth state.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" readOnly value={user?.fullName ?? ""} />
            <Input label="Phone" readOnly value={user?.phone ?? ""} />
            <Input label="Email" readOnly value={user?.email ?? ""} />
            <Input label="Role" readOnly value={user?.role ?? ""} />
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-700" />
            <div>
              <h2 className="font-semibold text-stone-950">Account safety</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Password change and phone verification UI will be refined in a later sprint.
              </p>
            </div>
          </div>
        </Card>
      </div>
      <EmptyState
        description="Saved addresses, rewards, and referrals will be composed here as the customer dashboard grows."
        title="Customer dashboard sections ready"
        action={<Gift className="h-5 w-5 text-rose-700" />}
      />
    </section>
  );
}
