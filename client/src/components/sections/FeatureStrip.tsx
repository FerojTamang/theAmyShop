import { PackageCheck, ShieldCheck, Sparkles, Truck } from "lucide-react";

const features = [
  { label: "Handmade details", icon: Sparkles },
  { label: "Gift-ready packing", icon: PackageCheck },
  { label: "Order details confirmed at checkout", icon: ShieldCheck },
  { label: "Delivery-ready orders", icon: Truck },
];

export function FeatureStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-[2rem] border border-rose-100/90 bg-white/78 p-3 shadow-[0_18px_50px_rgba(154,76,98,0.08)] backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              className="flex items-center gap-3 rounded-[1.5rem] bg-[#fff7fa] px-4 py-4"
              key={feature.label}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ffe0e9] text-[#b94767]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-[#5d4742]">
                {feature.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
