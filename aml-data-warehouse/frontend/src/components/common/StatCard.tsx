import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}

const tones: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-700",
  good:    "bg-emerald-100 text-emerald-700",
  warn:    "bg-amber-100 text-amber-700",
  bad:     "bg-rose-100 text-rose-700",
  info:    "bg-sky-100 text-sky-700",
};

export default function StatCard({ title, value, icon: Icon, hint, tone = "neutral" }: Props) {
  return (
    <div className="stat-card">
      <div className={clsx("h-10 w-10 rounded-lg flex items-center justify-center", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{title}</div>
        <div className="text-2xl font-semibold text-slate-800 mt-1 truncate">{value}</div>
        {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
