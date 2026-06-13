import { ArrowRight, Gift, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const keepsakeTiles = [
  { label: "Gift boxes", className: "from-[#ffd8e3] to-[#fff7df]" },
  { label: "Custom mugs", className: "from-[#fff1f5] to-white" },
  { label: "Candles", className: "from-[#fff5df] to-[#ffe7ef]" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-[#ffd8e3]/50 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
        <div className="relative z-10 flex flex-col justify-center">
          <Badge className="w-fit" tone="amber">
            <Sparkles className="h-3.5 w-3.5" />
            Handmade custom gifts
          </Badge>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.02] text-[#332522] sm:text-6xl lg:text-7xl">
            Softly made gifts for moments that matter.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6b5550]">
            Personalized keepsakes, curated gift boxes, candles, mugs, and
            handmade decor designed to feel thoughtful from first glance to final
            unboxing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/products">
              <Button className="min-h-12 px-6">
                Shop gift ideas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button className="min-h-12 px-6" variant="secondary">
                Start a custom order
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center text-xs font-semibold text-[#7a5d56]">
            {["Personalized", "Gift-ready", "Handmade"].map((item) => (
              <div
                className="rounded-full border border-rose-100 bg-white/70 px-3 py-2 shadow-sm shadow-rose-100/60"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-full bg-[#f5d7a6]/60 blur-2xl sm:block" />
          <div className="rounded-[2.5rem] border border-white/80 bg-white/70 p-3 shadow-[0_30px_90px_rgba(154,76,98,0.18)] backdrop-blur">
            <div className="rounded-[2rem] bg-gradient-to-br from-[#ffe1ea] via-[#fff7fa] to-[#fff1d8] p-5">
              <div className="rounded-[1.6rem] border border-white/80 bg-white/72 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge tone="rose">Signature set</Badge>
                    <h2 className="mt-4 text-3xl font-bold text-[#332522]">
                      Blush keepsake box
                    </h2>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-[#6b5550]">
                      A polished preview shell for product photography,
                      personalization choices, and future cart actions.
                    </p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#d85f83] shadow-sm">
                    <Heart className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-8 grid gap-3">
                  <div className="aspect-[5/3] rounded-[1.5rem] bg-[linear-gradient(135deg,#ffd6e2,#fffaf1_52%,#f7d7df)] p-4">
                    <div className="flex h-full items-end justify-between rounded-[1.1rem] border border-white/70 bg-white/35 p-4">
                      <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#9d3f5b]">
                        Custom note
                      </span>
                      <Gift className="h-10 w-10 text-[#b94767]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {keepsakeTiles.map((tile) => (
                      <div
                        className={`rounded-2xl bg-gradient-to-br ${tile.className} px-3 py-5 text-center text-xs font-semibold text-[#7a5d56] shadow-sm shadow-rose-100/60`}
                        key={tile.label}
                      >
                        {tile.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
