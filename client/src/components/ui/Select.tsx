import type { SelectHTMLAttributes } from "react";
import { classNames } from "../../lib/classNames";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ children, className, id, label, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-[#6b5550]">
      {label ? <span>{label}</span> : null}
      <select
        className={classNames(
          "min-h-11 rounded-2xl border border-rose-100 bg-white/90 px-4 text-sm text-[#332522] shadow-sm shadow-rose-100/50 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100/80",
          className,
        )}
        id={selectId}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
