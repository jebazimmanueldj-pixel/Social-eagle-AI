import clsx from "clsx";

const palette: Record<string, string> = {
  // Generic
  ACTIVE:      "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CLOSED:      "bg-slate-100 text-slate-700 ring-slate-200",
  PENDING:     "bg-amber-50 text-amber-700 ring-amber-200",
  // Alert
  OPEN:        "bg-rose-50 text-rose-700 ring-rose-200",
  IN_REVIEW:   "bg-amber-50 text-amber-700 ring-amber-200",
  ESCALATED:   "bg-rose-100 text-rose-800 ring-rose-300",
  CONVERTED:   "bg-violet-50 text-violet-700 ring-violet-200",
  // STR
  DRAFT:       "bg-slate-100 text-slate-700 ring-slate-200",
  SUBMITTED:   "bg-sky-50 text-sky-700 ring-sky-200",
  APPROVED:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  RETURNED:    "bg-amber-50 text-amber-700 ring-amber-200",
  FILED:       "bg-indigo-50 text-indigo-700 ring-indigo-200",
  // ETL
  SUCCESS:     "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FAILED:      "bg-rose-50 text-rose-700 ring-rose-200",
  RUNNING:     "bg-sky-50 text-sky-700 ring-sky-200",
  // KYC
  VERIFIED:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  EXPIRED:     "bg-amber-50 text-amber-700 ring-amber-200",
  // Dormant
  DORMANT:     "bg-slate-200 text-slate-700 ring-slate-300",
  REACTIVATED: "bg-violet-50 text-violet-700 ring-violet-200",
  ASSIGNED:    "bg-sky-50 text-sky-700 ring-sky-200",
  RESOLVED:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DISBURSED:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED:    "bg-rose-50 text-rose-700 ring-rose-200",
  UNDER_REVIEW:"bg-amber-50 text-amber-700 ring-amber-200",
  POSTED:      "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REVERSED:    "bg-rose-50 text-rose-700 ring-rose-200",
  QUEUED:      "bg-sky-50 text-sky-700 ring-sky-200",
};

export default function StatusBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const klass = palette[value] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span className={clsx("badge", klass)}>{value.replace(/_/g, " ")}</span>
  );
}
