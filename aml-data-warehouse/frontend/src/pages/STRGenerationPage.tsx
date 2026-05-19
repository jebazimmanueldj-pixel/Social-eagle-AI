import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import SlideOver from "../components/common/SlideOver";
import ExportButton from "../components/common/ExportButton";
import { strApi, aiApi } from "../services";
import { mockStrs } from "../mock-data";
import { STR } from "../types";
import { formatINR, formatDate } from "../utils/format";
import { Sparkles } from "lucide-react";

export default function STRGenerationPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<STR | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["str", statusFilter],
    queryFn: () => strApi.list({ status: statusFilter, size: 100 }),
    placeholderData: { content: mockStrs, page: 0, size: 100, totalElements: 0, totalPages: 1, last: true },
  });

  const cols: Column<STR>[] = [
    { key: "strId",         header: "STR" },
    { key: "customerId",    header: "Customer" },
    { key: "accountNumber", header: "Account" },
    { key: "alertId",       header: "Linked alert" },
    { key: "totalAmount",   header: "Amount", className: "text-right",
      render: (s) => formatINR(s.totalAmount) },
    { key: "transactionCount", header: "# Txn" },
    { key: "status",        header: "Status", render: (s) => <StatusBadge value={s.status} /> },
    { key: "makerUser",     header: "Maker" },
    { key: "checkerUser",   header: "Checker" },
    { key: "filedWith",     header: "Filed with" },
    { key: "createdAt",     header: "Created", render: (s) => formatDate(s.createdAt) },
  ];

  const refresh = () => qc.invalidateQueries({ queryKey: ["str"] });

  const action = async (kind: "submit" | "approve" | "return" | "file") => {
    if (!selected) return;
    try {
      let r: STR;
      switch (kind) {
        case "submit":  r = await strApi.submit(selected.strId);  toast.success("Submitted to checker"); break;
        case "approve": r = await strApi.approve(selected.strId); toast.success("Approved"); break;
        case "return":  r = await strApi.return(selected.strId);  toast.success("Returned to maker"); break;
        case "file":    r = await strApi.file(selected.strId);    toast.success(`Filed: ${r.firReference ?? ""}`); break;
      }
      setSelected(r);
      refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Action failed");
    }
  };

  const generateNarrative = async () => {
    if (!selected) return;
    try {
      const r = await aiApi.strNarrative({
        customerName: selected.customerId,
        totalAmount: String(selected.totalAmount ?? ""),
        transactionCount: String(selected.transactionCount ?? ""),
      });
      setSelected({ ...selected, narrative: r.narrative });
      toast.success("AI narrative generated (saved on Update)");
    } catch {
      toast.error("AI service unavailable");
    }
  };

  const saveNarrative = async () => {
    if (!selected) return;
    try {
      const r = await strApi.update(selected.strId, {
        suspiciousIndicators: selected.suspiciousIndicators,
        narrative: selected.narrative,
        totalAmount: selected.totalAmount,
        transactionCount: selected.transactionCount,
      });
      setSelected(r);
      toast.success("Saved");
      refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Save failed");
    }
  };

  return (
    <>
      <PageTitle title="STR Generation" subtitle="Suspicious Transaction Reports — maker / checker workflow with AI narrative" />

      <div className="card-pad mb-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option>DRAFT</option><option>SUBMITTED</option><option>APPROVED</option>
            <option>RETURNED</option><option>FILED</option>
          </select>
        </div>
      </div>

      <DataTable<STR>
        columns={cols}
        rows={data?.content ?? []}
        rowKey={(s) => s.strId}
        loading={isLoading}
        onRowClick={setSelected}
      />

      <SlideOver
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.strId}
        subtitle={`${selected?.status} · ${formatINR(selected?.totalAmount ?? 0)}`}
        width="w-[44rem]"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={selected.status} />
              {selected.filedWith && <span className="badge bg-indigo-50 text-indigo-700 ring-indigo-200">{selected.filedWith}</span>}
              {selected.firReference && <span className="badge bg-emerald-50 text-emerald-700 ring-emerald-200">{selected.firReference}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KV k="Customer" v={selected.customerId} />
              <KV k="Account" v={selected.accountNumber} />
              <KV k="Linked alert" v={selected.alertId} />
              <KV k="Amount" v={formatINR(selected.totalAmount)} />
              <KV k="Transactions" v={selected.transactionCount} />
              <KV k="Branch" v={selected.branchCode} />
              <KV k="Maker" v={selected.makerUser} />
              <KV k="Checker" v={selected.checkerUser} />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label">Suspicious indicators</label>
              </div>
              <textarea
                className="input min-h-[80px]"
                value={selected.suspiciousIndicators ?? ""}
                onChange={(e) => setSelected({ ...selected, suspiciousIndicators: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label">Narrative</label>
                <button onClick={generateNarrative} className="text-xs text-bank-500 hover:underline inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Generate with AI
                </button>
              </div>
              <textarea
                className="input min-h-[160px]"
                value={selected.narrative ?? ""}
                onChange={(e) => setSelected({ ...selected, narrative: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <button className="btn-secondary" onClick={saveNarrative}>Save</button>
              {selected.status === "DRAFT" && <button className="btn-primary" onClick={() => action("submit")}>Submit</button>}
              {selected.status === "SUBMITTED" && (
                <>
                  <button className="btn-secondary" onClick={() => action("return")}>Return</button>
                  <button className="btn-primary"   onClick={() => action("approve")}>Approve</button>
                </>
              )}
              {selected.status === "APPROVED" && (
                <button className="btn-primary" onClick={() => action("file")}>File with FIU</button>
              )}
              <ExportButton href={strApi.exportUrl(selected.strId)} label="Export" />
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
