import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { classNames } from "../../lib/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#d85f83] text-white shadow-lg shadow-rose-300/35 hover:bg-[#c94f75] focus-visible:outline-[#d85f83]",
  secondary:
    "border border-rose-200/80 bg-white/85 text-[#8a3450] shadow-sm shadow-rose-100/70 hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-[#d85f83]",
  ghost:
    "text-[#5d4742] hover:bg-rose-50 hover:text-[#9d3f5b] focus-visible:outline-[#d85f83]",
  danger:
    "bg-red-600 text-white shadow-sm shadow-red-900/15 hover:bg-red-700 focus-visible:outline-red-600",
};

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
