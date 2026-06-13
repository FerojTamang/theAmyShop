import type { ReactNode } from "react";
import { Gift } from "lucide-react";
import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <Card className="grid place-items-center bg-gradient-to-br from-white via-[#fff7fa] to-[#fffaf1] py-12 text-center">
      <div className="mb-4 rounded-full bg-[#ffe5ed] p-4 text-[#b94767] shadow-sm shadow-rose-200/70">
        <Gift className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold text-[#332522]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#6b5550]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
