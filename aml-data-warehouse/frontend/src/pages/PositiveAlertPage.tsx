import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import RiskBadge from "../components/common/RiskBadge";
import SlideOver from "../components/common/SlideOver";
import { positiveAlertApi, aiApi } from "../services";
import { mockAlerts } from "../mock-data";
import { Alert } from "../types";
import { formatDate, formatINR } from "../utils/format";
import { Sparkles } from "lucide-react";

export default function PositiveAlertPage() {
  const [selected, setSelected] = useState<Alert | null>(null);
  const [explanation, setExplanation] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["positive-alerts"],
    queryFn: () => positiveAlertApi.list({ size: 100 }),
    placeholderData: { content: mockAlerts.filter((a) => a.alertType === "POSITIVE"), page: 0, size: 100, totalElements: 0, totalPages: 1, last: true },
  });

  const cols: Column<Alert>[] = [
    { key: "alertId",   header: "Alert" },
    { key: "ruleName",  header: "Rule triggered" },
    { key: "customerId",header: "Customer" },
    { key: "thresholdValue", header: "Threshold", className: "text-right",
      render: (a) => formatINR(a.thresholdValue) },
    { key: "actualValue", header: "Actual", className: "text-right",
      render: (a) => formatINR(a.actualValue) },
    { key: "riskScore", header: "Score", className: "text-right" },
    { key: "priority",  header: "Priority", render: (a) => <RiskBadge value={a.priority} /> },
    { key: "status",    header: "Status",   render: (a) => <StatusBadge value={a.status} /> },
    { key: "alertDate", header: "Date",     render: (a) => formatDate(a.alertDate) },
  ];

  const explain = async (a: Alert) => {
    setSelected(a);
    setExplanation("Generating AI explanation…");
    try {
      const r = await aiApi.alertExplanation({
        ruleName: a.ruleName,
        actualValue: String(a.actualValue ?? ""),
        thresholdValue: String(a.thresholdValue ?? ""),
      });
      setExplanation(r.explanation);
    } catch {
      setExplanation(
        "Backend unreachable — sample explanation: rule triggered because the actual value exceeded the configured threshold and the customer profile contains additional risk indicators."
      );
    }
  };

  const review = async () => {
    if (!selected) return;
    try {
      await positiveAlertApi.review(selected.alertId, { assignee: "supervisor", comments: "Reviewed via UI" });
      toast.success("Sent for review");
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed");
    }
  };

  return (
    <>
      <PageTitle
        title="Positive Alerts"
        subtitle="Rule-triggered positive alerts (threshold breaches) — investigate and act"
      />

      <DataTable<Alert>
        columns={cols}
        rows={data?.content ?? []}
        rowKey={(a) => a.alertId}
        loading={isLoading}
        onRowClick={explain}
      />

      <SlideOver
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.alertId}
        subtitle={selected?.ruleName}
        width="w-[40rem]"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-2">
              <RiskBadge value={selected.priority} />
              <StatusBadge value={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KV k="Customer" v={selected.customerId} />
              <KV k="Account" v={selected.accountNumber} />
              <KV k="Threshold" v={formatINR(selected.thresholdValue)} />
              <KV k="Actual" v={formatINR(selected.actualValue)} />
              <KV k="Score" v={selected.riskScore} />
              <KV k="Branch" v={selected.branchCode} />
            </div>

            <div className="card-pad bg-bank-50 border-bank-500/30">
              <div className="flex items-center gap-2 text-bank-600 font-semibold mb-1">
                <Sparkles className="h-4 w-4" /> AI explanation
              </div>
              <p>{explanation}</p>
            </div>

            <div>
              <div className="label">Investigator comments</div>
              <textarea className="input min-h-[80px]" placeholder="Document next steps…" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn-primary" onClick={review}>Send for supervisor review</button>
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
