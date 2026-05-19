import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw, Terminal } from "lucide-react";
import PageTitle from "../components/common/PageTitle";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import SlideOver from "../components/common/SlideOver";
import { etlApi } from "../services";
import { mockEtl } from "../mock-data";
import { EtlJob } from "../types";
import { formatDate, formatNumber } from "../utils/format";

export default function ETLJobMonitorPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<EtlJob | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["etl"],
    queryFn: () => etlApi.list({ size: 100 }),
    refetchInterval: 30_000,
    placeholderData: { content: mockEtl, page: 0, size: 100, totalElements: mockEtl.length, totalPages: 1, last: true },
  });

  const cols: Column<EtlJob>[] = [
    { key: "jobId",      header: "Job ID" },
    { key: "jobName",    header: "Name" },
    { key: "sourceSystem", header: "Source" },
    { key: "targetTable",  header: "Target" },
    { key: "loadType",   header: "Load" },
    { key: "startTime",  header: "Start", render: (j) => formatDate(j.startTime) },
    { key: "endTime",    header: "End",   render: (j) => formatDate(j.endTime) },
    { key: "recordsExtracted", header: "Extracted", className: "text-right",
      render: (j) => formatNumber(j.recordsExtracted) },
    { key: "recordsLoaded",    header: "Loaded",    className: "text-right",
      render: (j) => formatNumber(j.recordsLoaded) },
    { key: "recordsRejected",  header: "Rejected",  className: "text-right",
      render: (j) => formatNumber(j.recordsRejected) },
    { key: "status",     header: "Status", render: (j) => <StatusBadge value={j.status} /> },
    { key: "actions",    header: "",
      render: (j) => (
        <div className="flex gap-2 justify-end">
          <button
            className="btn-secondary text-xs"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const r = await etlApi.logs(j.jobId);
                setLogs(r);
                setSelected(j);
              } catch {
                setLogs(["Backend unreachable"]);
                setSelected(j);
              }
            }}
          ><Terminal className="h-3 w-3" /> Logs</button>
          {j.status === "FAILED" && (
            <button
              className="btn-primary text-xs"
              onClick={async (e) => {
                e.stopPropagation();
                await etlApi.rerun(j.jobId);
                toast.success("Re-run scheduled");
                qc.invalidateQueries({ queryKey: ["etl"] });
              }}
            ><RefreshCw className="h-3 w-3" /> Re-run</button>
          )}
        </div>
      ) },
  ];

  return (
    <>
      <PageTitle
        title="ETL Job Monitor"
        subtitle="Monitor pipelines feeding the AML warehouse — refreshes every 30 seconds"
      />
      <DataTable<EtlJob>
        columns={cols}
        rows={data?.content ?? []}
        rowKey={(j) => j.jobId}
        loading={isLoading}
      />

      <SlideOver
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.jobId}
        subtitle={selected?.jobName}
        width="w-[42rem]"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <KV k="Source" v={selected.sourceSystem} />
              <KV k="Target" v={selected.targetTable} />
              <KV k="Load type" v={selected.loadType} />
              <KV k="Status" v={<StatusBadge value={selected.status} />} />
              <KV k="Start" v={formatDate(selected.startTime)} />
              <KV k="End"   v={formatDate(selected.endTime)} />
              <KV k="Extracted" v={formatNumber(selected.recordsExtracted)} />
              <KV k="Loaded"    v={formatNumber(selected.recordsLoaded)} />
              <KV k="Rejected"  v={formatNumber(selected.recordsRejected)} />
            </div>

            {selected.errorMessage && (
              <div className="bg-rose-50 text-rose-700 rounded-md p-3 text-xs">
                <span className="font-semibold">Error:</span> {selected.errorMessage}
              </div>
            )}

            <div>
              <div className="label">Logs</div>
              <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs whitespace-pre-wrap">
                {logs.join("\n") || "Loading…"}
              </pre>
            </div>
          </div>
        )}
      </SlideOver>
    </>
  );
}

function KV({ k, v }: { k: string; v: any }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{k}</div>
      <div>{v ?? "—"}</div>
    </div>
  );
}
