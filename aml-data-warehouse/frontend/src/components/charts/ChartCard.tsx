import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  height?: number;
}

export default function ChartCard({ title, subtitle, actions, children, height = 280 }: Props) {
  return (
    <div className="card-pad">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-700">{title}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
        {actions}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}
