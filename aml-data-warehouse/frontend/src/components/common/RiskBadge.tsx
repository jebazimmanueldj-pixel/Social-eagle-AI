import clsx from "clsx";

const palette: Record<string, string> = {
  LOW:      "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MEDIUM:   "bg-amber-50 text-amber-700 ring-amber-200",
  HIGH:     "bg-rose-50 text-rose-700 ring-rose-200",
  CRITICAL: "bg-rose-700 text-white ring-rose-700",
};

export default function RiskBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-slate-400">—</span>;
  return (
    <span className={clsx("badge", palette[value] ?? "bg-slate-100 text-slate-700 ring-slate-200")}>
      {value}
    </span>
  );
}
