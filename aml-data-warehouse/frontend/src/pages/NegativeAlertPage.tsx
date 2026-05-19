import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import { negativeAlertApi } from "../services";
import { mockAlerts } from "../mock-data";
import { Alert } from "../types";
import { formatDate } from "../utils/format";

export default function NegativeAlertPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Alert | null>(null);
  const [comments, setComments] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["negative-alerts"],
    queryFn: () => negativeAlertApi.list({ size: 100 }),
    placeholderData: { content: mockAlerts.filter((a) => a.alertType === "NEGATIVE"), page: 0, size: 100, totalElements: 0, totalPages: 1, last: true },
  });

  const cols: Column<Alert>[] = [
    { key: "alertId",   header: "Alert" },
    { key: "ruleName",  header: "Rule" },
    { key: "customerId",header: "Customer" },
    { key: "noMatchReason",      header: "No-match reason" },
    { key: "falsePositiveReason",header: "False-positive reason" },
    { key: "closureComments",    header: "Closure" },
    { key: "checkerUser",        header: "Checker" },
    { key: "status",   header: "Status", render: (a) => <StatusBadge value={a.status} /> },
    { key: "closedAt", header: "Closed",  render: (a) => formatDate(a.closedAt) },
  ];

  const close = async () => {
    if (!selected) return;
    try {
      await negativeAlertApi.close(selected.alertId, { comments });
      toast.success("Closed");
      setSelected(null);
      setComments("");
      qc.invalidateQueries({ queryKey: ["negative-alerts"] });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed");
    }
  };

  return (
    <>
      <PageTitle
        title="Negative Alerts"
        subtitle="False-positive / no-match alerts pending or closed with checker approval"
      />
      <DataTable<Alert>
        columns={cols}
        rows={data?.content ?? []}
        rowKey={(a) => a.alertId}
        loading={isLoading}
        onRowClick={(a) => { setSelected(a); setComments(a.closureComments ?? ""); }}
      />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.alertId}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
            <button className="btn-primary" onClick={close}>Confirm close (checker approval)</button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div><span className="font-medium">Rule:</span> {selected?.ruleName}</div>
          <div><span className="font-medium">No-match reason:</span> {selected?.noMatchReason ?? "—"}</div>
          <div><span className="font-medium">False-positive reason:</span> {selected?.falsePositiveReason ?? "—"}</div>
          <label className="label">Closure comments</label>
          <textarea
            className="input min-h-[120px]"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
