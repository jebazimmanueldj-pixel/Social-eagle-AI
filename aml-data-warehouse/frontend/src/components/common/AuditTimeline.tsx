import { Clock } from "lucide-react";
import { AuditEntry } from "../../types";
import { formatDate } from "../../utils/format";
import StatusBadge from "./StatusBadge";

export default function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length)
    return <div className="text-sm text-slate-500 p-4">No audit entries yet.</div>;
  return (
    <ol className="relative border-l-2 border-slate-200 pl-5 space-y-4 ml-2">
      {entries.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[27px] top-1 h-4 w-4 rounded-full bg-bank-500 ring-4 ring-bank-50 flex items-center justify-center">
            <Clock className="h-2.5 w-2.5 text-white" />
          </span>
          <div className="card-pad py-3 px-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-800">
                {e.username} <span className="text-slate-400 font-normal">·</span> {e.moduleName}
              </div>
              <StatusBadge value={e.status} />
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {e.action} {e.durationMs ? <>· {e.durationMs} ms</> : null}
              {e.ipAddress ? <> · IP {e.ipAddress}</> : null}
              <> · {formatDate(e.activityTime)}</>
            </div>
            {e.errorMessage && (
              <div className="text-xs text-rose-600 mt-1">⚠ {e.errorMessage}</div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
