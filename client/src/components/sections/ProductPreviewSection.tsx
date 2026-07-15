import { ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SectionHeading } from "./SectionHeading";
import { formatCurrency } from "../../utils/formatCurrency";

const products = [
  {
    name: "Blush memory box",
    tag: "Personalized",
    price: 1450,
    gradient: "from-[#ffd7e2] via-[#fff7fa] to-[#fff0d6]",
  },
  {
    name: "Custom name mug",
    tag: "Daily gift",
    price: 850,
    gradient: "from-white via-[#fff1f5] to-[#ffe3ec]",
  },
  {
    name: "Warm candle set",
    tag: "Gift-ready",
    price: 1200,
    gradient: "from-[#fff4dd] via-white to-[#ffdce6]",
  },
];

export function ProductPreviewSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <SectionHeading
        action={
          <Link to="/products">
            <Button variant="secondary">
              View catalog
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
        description="Explore thoughtful handmade gifts for meaningful moments."
        eyebrow="Best-selling gift ideas"
        title="Pretty, personal, and ready to become someone's favorite."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {products.map((product) => (
          <Card className="group overflow-hidden p-3" key={product.name}>
            <div
              className={`relative aspect-[4/4.6] rounded-[1.5rem] bg-gradient-to-br ${product.gradient} p-4`}
            >
              <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/82 text-[#d85f83] shadow-sm">
                <Heart className="h-5 w-5" />
              </button>
              <div className="flex h-full items-end">
                <div className="w-full rounded-[1.25rem] border border-white/80 bg-white/65 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9d3f5b]">
                    {product.tag}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-[#332522]">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#9a6a1e]">
                    From {formatCurrency(product.price)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
