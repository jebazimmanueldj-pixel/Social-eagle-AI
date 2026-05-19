import { Filter, X } from "lucide-react";
import { ReactNode, useState } from "react";

interface Props {
  children: ReactNode;
  onApply?: () => void;
  onClear?: () => void;
}

export default function FilterPanel({ children, onApply, onClear }: Props) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700"
      >
        <span className="inline-flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filters
        </span>
        {open ? <X className="h-4 w-4" /> : null}
      </button>
      {open && (
        <div className="border-t border-slate-200 p-4">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">{children}</div>
          {(onApply || onClear) && (
            <div className="flex justify-end gap-2 mt-4">
              {onClear && <button onClick={onClear} className="btn-secondary">Reset</button>}
              {onApply && <button onClick={onApply} className="btn-primary">Apply</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
