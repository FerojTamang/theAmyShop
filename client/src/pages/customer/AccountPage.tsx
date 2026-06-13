import { Gift, Heart, MapPin, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

const serifStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const accountCards: Array<[string, string, typeof Heart]> = [
  ["Saved addresses", "Default delivery details ready for checkout.", MapPin],
  ["Rewards", "Gems and transactions can appear here without forcing automatic redemption.", Sparkles],
  ["Referrals", "Shareable referral code and history are ready for the customer flow.", Gift],
];

export function AccountPage() {
  const { user } = useAuth();

  return (
    <section className="grid gap-7">
      <div className="overflow-hidden rounded-[2rem] border border-[#F7D9E2] bg-gradient-to-br from-white via-[#FFF5F7] to-[#FFF0DA] p-7 shadow-sm shadow-pink-100">
        <Badge tone="rose">Customer account</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-[#1F1720]" style={serifStyle}>
          My AMY Shop
        </h1>
        <p className="mt-3 max-w-2xl text-[#6F6570]">
          Manage your profile, gifting preferences, saved addresses, rewards, and referrals from one soft little dashboard.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <Card className="bg-white/90">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-[#FDECEF] p-3 text-[#EC4C84]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#1F1720]">Profile details</h2>
              <p className="text-sm text-[#6F6570]">Safe account fields from auth state.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" readOnly value={user?.fullName ?? ""} />
            <Input label="Phone" readOnly value={user?.phone ?? ""} />
            <Input label="Email" readOnly value={user?.email ?? ""} />
            <Input label="Role" readOnly value={user?.role ?? ""} />
          </div>
        </Card>

        <Card className="bg-[#FFF5F7]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-6 w-6 text-[#39B86D]" />
            <div>
              <h2 className="font-bold text-[#1F1720]">Account safety</h2>
              <p className="mt-2 text-sm leading-6 text-[#6F6570]">
                Password changes, phone verification, and profile image updates are supported by backend account APIs and can be wired into forms later.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {accountCards.map(([title, description, Icon]) => {
          return (
            <Card className="bg-white/90" key={title}>
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#FDECEF] text-[#EC4C84]">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="font-bold text-[#1F1720]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6F6570]">{description}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
