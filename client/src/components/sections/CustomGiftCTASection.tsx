import { ArrowRight, PenLine, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export function CustomGiftCTASection() {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-rose-100 bg-[#332522] shadow-[0_26px_80px_rgba(51,37,34,0.18)]">
        <div className="grid gap-8 bg-[radial-gradient(circle_at_20%_20%,rgba(255,216,227,0.22),transparent_25rem)] px-6 py-10 sm:px-10 lg:grid-cols-[1fr_0.75fr] lg:px-12 lg:py-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#ffdce6] ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" />
              Custom gifting studio
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              Turn a name, date, note, or memory into a gift that feels made for them.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#f7d7df] sm:text-base">
              The frontend foundation is ready for custom options, reference
              notes, gift messages, and checkout workflows when future sprints
              connect the live experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/products">
                <Button>
                  Explore custom gifts
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button className="border-white/20 bg-white/10 text-white hover:bg-white/15" variant="secondary">
                  Create account
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid content-end">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
              <PenLine className="h-8 w-8 text-[#ffdce6]" />
              <p className="mt-5 text-lg font-semibold">Personal notes, colors, names, and gift messages.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-semibold text-[#f7d7df]">
                <span className="rounded-full bg-white/10 px-3 py-2 text-center">Name detail</span>
                <span className="rounded-full bg-white/10 px-3 py-2 text-center">Gift card</span>
                <span className="rounded-full bg-white/10 px-3 py-2 text-center">Blush wrap</span>
                <span className="rounded-full bg-white/10 px-3 py-2 text-center">Keepsake note</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
