import type { InputHTMLAttributes } from "react";
import { classNames } from "../../lib/classNames";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-[#6b5550]">
      {label ? <span>{label}</span> : null}
      <input
          className={classNames(
          "min-h-11 rounded-2xl border border-rose-100 bg-white/90 px-4 text-sm text-[#332522] shadow-sm shadow-rose-100/50 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100/80",
          className,
        )}
        id={inputId}
        {...props}
      />
    </label>
  );
}
