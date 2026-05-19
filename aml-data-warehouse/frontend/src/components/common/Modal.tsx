import { X } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes: Record<string, string> = {
  sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl",
};

export default function Modal({ open, onClose, title, children, footer, size = "md" }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className={`card w-full ${sizes[size]}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
