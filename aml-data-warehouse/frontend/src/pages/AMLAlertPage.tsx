import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import FilterPanel from "../components/common/FilterPanel";
import SearchInput from "../components/common/SearchInput";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import RiskBadge from "../components/common/RiskBadge";
import SlideOver from "../components/common/SlideOver";
import Modal from "../components/common/Modal";
import { alertApi } from "../services";
import { mockAlerts } from "../mock-data";
import { Alert } from "../types";
import { formatDate, formatINR } from "../utils/format";

export default function AMLAlertPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [selected, setSelected] = useState<Alert | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeComments, setCloseComments] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", "AML", q, status, priority],
    queryFn: () => alertApi.search({ type: "AML", q, status, priority, size: 100 }),
    placeholderData: { content: mockAlerts.filter((a) => a.alertType === "AML"), page: 0, size: 100, totalElements: 0, totalPages: 1, last: true },
  });

  const cols: Column<Alert>[] = [
    { key: "alertId",   header: "Alert" },
    { key: "ruleName",  header: "Rule" },
    { key: "customerId",header: "Customer" },
    { key: "branchCode",header: "Branch" },
    { key: "riskScore", header: "Score", className: "text-right" },
    { key: "priority",  header: "Priority", render: (a) => <RiskBadge value={a.priority} /> },
    { key: "status",    header: "Status",   render: (a) => <StatusBadge value={a.status} /> },
    { key: "assignedTo",header: "Assignee" },
    { key: "agingDays", header: "Aging (d)", className: "text-right" },
    { key: "alertDate", header: "Date",     render: (a) => formatDate(a.alertDate) },
  ];

  const refresh = () => qc.invalidateQueries({ queryKey: ["alerts", "AML"] });

  const onAction = async (kind: "assign" | "escalate" | "convert-case" | "convert-str") => {
    if (!selected) return;
    try {
      switch (kind) {
        case "assign":       await alertApi.assign(selected.alertId, { assignee: "supervisor", comments: "Assigned for review" }); toast.success("Assigned"); break;
        case "escalate":     await alertApi.escalate(selected.alertId, { comments: "Escalated to compliance" }); toast.success("Escalated"); break;
        case "convert-case": await alertApi.convertToCase(selected.alertId); toast.success("Converted to case"); break;
        case "convert-str":  await alertApi.convertToStr(selected.alertId); toast.success("STR draft created"); break;
      }
      refresh();
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Action failed");
    }
  };

  const onClose = async () => {
    if (!selected) return;
    try {
      await alertApi.close(selected.alertId, { comments: closeComments });
      toast.success("Alert closed");
      setCloseOpen(false);
      setCloseComments("");
      refresh();
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Close failed");
    }
  };

  return (
    <>
      <PageTitle title="AML Alerts" subtitle="Triage queue, lifecycle actions and case conversion" />
      <FilterPanel onClear={() => { setQ(""); setStatus(""); setPriority(""); }}>
        <div><label className="label">Search</label>
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Alert ID, customer, rule" /></div>
        <div><label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option><option>OPEN</option><option>IN_REVIEW</option><option>ESCALATED</option><option>CLOSED</option><option>CONVERTED</option>
          </select></div>
        <div><label className="label">Priority</label>
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
          </select></div>
      </FilterPanel>

      <div className="mt-4">
        <DataTable<Alert>
          columns={cols}
          rows={data?.content ?? []}
          rowKey={(a) => a.alertId}
          loading={isLoading}
          onRowClick={setSelected}
        />
      </div>

      <SlideOver
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.alertId}
        subtitle={selected?.ruleName}
        width="w-[40rem]"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <RiskBadge value={selected.priority} />
              <StatusBadge value={selected.status} />
              <span className="badge bg-slate-100 text-slate-700 ring-slate-200">Score: {selected.riskScore}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KV k="Customer" v={selected.customerId} />
              <KV k="Account" v={selected.accountNumber} />
              <KV k="Branch" v={selected.branchCode} />
              <KV k="Assignee" v={selected.assignedTo} />
              <KV k="Threshold" v={formatINR(selected.thresholdValue)} />
              <KV k="Actual" v={formatINR(selected.actualValue)} />
              <KV k="Alert date" v={formatDate(selected.alertDate)} />
              <KV k="Aging (days)" v={selected.agingDays ?? 0} />
            </div>
            <div>
              <div className="label">Investigator comments</div>
              <p className="bg-slate-50 rounded-md p-3 whitespace-pre-wrap">{selected.investigatorComments ?? "—"}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <button className="btn-secondary" onClick={() => onAction("assign")}>Assign</button>
              <button className="btn-secondary" onClick={() => onAction("escalate")}>Escalate</button>
              <button className="btn-secondary" onClick={() => onAction("convert-case")}>Convert to case</button>
              <button className="btn-primary" onClick={() => onAction("convert-str")}>Convert to STR</button>
              <button className="btn-danger ml-auto" onClick={() => setCloseOpen(true)}>Close alert</button>
            </div>
          </div>
        )}
      </SlideOver>

      <Modal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Close alert"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setCloseOpen(false)}>Cancel</button>
            <button className="btn-danger" onClick={onClose}>Confirm close</button>
          </>
        }
      >
        <label className="label">Closure comments</label>
        <textarea
          className="input min-h-[120px]"
          value={closeComments}
          onChange={(e) => setCloseComments(e.target.value)}
          placeholder="Document the rationale, outcome and any compensating control…"
        />
      </Modal>
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
