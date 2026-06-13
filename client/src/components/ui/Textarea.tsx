import type { TextareaHTMLAttributes } from "react";
import { classNames } from "../../lib/classNames";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ className, id, label, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-[#6b5550]">
      {label ? <span>{label}</span> : null}
      <textarea
        className={classNames(
          "min-h-28 rounded-2xl border border-rose-100 bg-white/90 px-4 py-3 text-sm text-[#332522] shadow-sm shadow-rose-100/50 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100/80",
          className,
        )}
        id={textareaId}
        {...props}
      />
    </label>
  );
}
