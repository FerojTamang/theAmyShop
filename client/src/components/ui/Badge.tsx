import type { PropsWithChildren } from "react";
import { classNames } from "../../lib/classNames";

type BadgeTone = "rose" | "amber" | "stone" | "green";

const toneStyles: Record<BadgeTone, string> = {
  rose: "bg-[#fff0f4] text-[#9d3f5b] ring-rose-200/80",
  amber: "bg-[#fff7df] text-[#9a6a1e] ring-amber-200/80",
  stone: "bg-[#f7f0ef] text-[#6b5550] ring-stone-200/80",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

export function Badge({
  children,
  className,
  tone = "rose",
}: PropsWithChildren<{ className?: string; tone?: BadgeTone }>) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
