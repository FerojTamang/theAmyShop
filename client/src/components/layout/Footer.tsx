import { Gift, Heart, Mail, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-rose-100/80 bg-gradient-to-b from-white/70 to-[#fff0f4]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-[#6b5550] sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ffe0e9] text-[#b94767]">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-[#332522]">The AMY Shop</p>
              <p className="text-xs">Handmade custom gifts</p>
            </div>
          </div>
          <p className="mt-4 max-w-md leading-6">
            Personalized keepsakes, gift boxes, candles, mugs, and handmade decor
            prepared with a soft, thoughtful touch.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[#332522]">Shop moments</p>
          <div className="mt-3 grid gap-2">
            <span>Birthday surprises</span>
            <span>Custom keepsakes</span>
            <span>Gift-ready packaging</span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-[#332522]">Made with care</p>
          <div className="mt-3 grid gap-2">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#d85f83]" /> Personalized details
            </span>
            <span className="inline-flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#d85f83]" /> Warm gift experience
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#d85f83]" /> Thoughtful support
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-rose-100/80 px-4 py-4 text-center text-xs text-[#8a706a]">
        (c) {new Date().getFullYear()} The AMY Shop. Thoughtful gifts, softly wrapped.
      </div>
    </footer>
  );
}
