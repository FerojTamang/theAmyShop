import type { ReactNode } from "react";
import { Badge } from "../ui/Badge";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({
  action,
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <Badge tone="rose">{eyebrow}</Badge> : null}
        <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-[#332522] sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b5550] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
