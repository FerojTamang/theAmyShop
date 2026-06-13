import type { PropsWithChildren } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  title: string;
  onClose: () => void;
}>;

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl shadow-stone-950/20">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
          <Button className="h-9 w-9 px-0" onClick={onClose} variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
