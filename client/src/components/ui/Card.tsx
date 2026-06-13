import type { HTMLAttributes, PropsWithChildren } from "react";
import { classNames } from "../../lib/classNames";

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={classNames(
        "rounded-[1.75rem] border border-rose-100/90 bg-white/88 p-6 shadow-[0_18px_50px_rgba(154,76,98,0.09)] backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
