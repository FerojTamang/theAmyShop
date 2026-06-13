import { Coffee, Flame, Gift, Palette, Sparkles } from "lucide-react";
import { Card } from "../ui/Card";
import { SectionHeading } from "./SectionHeading";

const categories = [
  {
    name: "Gift boxes",
    detail: "Curated sets with notes and soft wrapping.",
    icon: Gift,
    gradient: "from-[#ffe0e9] to-[#fff7df]",
  },
  {
    name: "Custom mugs",
    detail: "Personalized daily keepsakes.",
    icon: Coffee,
    gradient: "from-[#fff1f5] to-white",
  },
  {
    name: "Candles",
    detail: "Warm scents for cozy gifting.",
    icon: Flame,
    gradient: "from-[#fff3d9] to-[#ffe8ef]",
  },
  {
    name: "Handmade decor",
    detail: "Soft details for rooms and celebrations.",
    icon: Palette,
    gradient: "from-white to-[#ffe4ed]",
  },
];

export function CategoryPreviewSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        description="A clean preview of the storefront categories that will later connect to live product collections."
        eyebrow="Shop by feeling"
        title="Personalized gifts with a soft, handmade finish."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Card
              className={`group overflow-hidden bg-gradient-to-br ${category.gradient} p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(154,76,98,0.14)]`}
              key={category.name}
            >
              <div className="flex aspect-[4/3] items-end rounded-[1.4rem] border border-white/80 bg-white/50 p-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#d85f83] shadow-sm">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#332522]">
                {category.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6b5550]">
                {category.detail}
              </p>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#9d3f5b]">
        <Sparkles className="h-4 w-4" />
        More collections will be powered by the catalog API in later frontend sprints.
      </div>
    </section>
  );
}
