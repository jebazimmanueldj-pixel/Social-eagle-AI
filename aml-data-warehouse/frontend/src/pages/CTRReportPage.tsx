import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import ExportButton from "../components/common/ExportButton";
import { ctrApi } from "../services";
import { mockCtrs } from "../mock-data";
import { CTR } from "../types";
import { formatINR, formatDateOnly } from "../utils/format";

export default function CTRReportPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [threshold, setThreshold] = useState(1000000);

  const { data, isLoading } = useQuery({
    queryKey: ["ctr"],
    queryFn: () => ctrApi.list({ size: 100 }),
    placeholderData: { content: mockCtrs, page: 0, size: 100, totalElements: 0, totalPages: 1, last: true },
  });

  const cols: Column<CTR>[] = [
    { key: "ctrId",       header: "CTR" },
    { key: "customerId",  header: "Customer" },
    { key: "accountNumber", header: "Account" },
    { key: "branchCode",  header: "Branch" },
    { key: "reportDate",  header: "Report date", render: (c) => formatDateOnly(c.reportDate) },
    { key: "transactionCount", header: "# Txn" },
    { key: "totalCashAmount", header: "Cash amount", className: "text-right",
      render: (c) => formatINR(c.totalCashAmount, c.currency ?? "INR") },
    { key: "thresholdAmount", header: "Threshold", className: "text-right",
      render: (c) => formatINR(c.thresholdAmount, c.currency ?? "INR") },
    { key: "status",      header: "Status",   render: (c) => <StatusBadge value={c.status} /> },
    { key: "approverUser",header: "Approver" },
    { key: "actions",     header: "",
      render: (c) => (
        <div className="flex gap-2 justify-end">
          {c.status === "DRAFT" && (
            <button
              className="btn-secondary text-xs"
              onClick={async (e) => {
                e.stopPropagation();
                await ctrApi.approve(c.ctrId);
                toast.success("Approved");
                qc.invalidateQueries({ queryKey: ["ctr"] });
              }}
            >
              Approve
            </button>
          )}
          <a href={`/api/ctr/${c.ctrId}/export`} className="btn-secondary text-xs" target="_blank">Export</a>
        </div>
      ) },
  ];

  const generate = async () => {
    try {
      await ctrApi.generate({ reportDate, thresholdAmount: threshold });
      toast.success("CTR queued for review");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["ctr"] });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Generate failed");
    }
  };

  return (
    <>
      <PageTitle
        title="CTR Reports"
        subtitle="Cash Transaction Reports — generate, approve and file with the regulator"
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>Generate CTR</button>}
      />
      <DataTable<CTR>
        columns={cols}
        rows={data?.content ?? []}
        rowKey={(c) => c.ctrId}
        loading={isLoading}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Generate CTR"
        footer={<>
          <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={generate}>Generate</button>
        </>}
      >
        <div className="space-y-3">
          <div>
            <label className="label">Report date</label>
            <input type="date" className="input" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Threshold amount</label>
            <input type="number" className="input" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
            <div className="text-xs text-slate-500 mt-1">Default — INR 10,00,000 (10 lakh)</div>
          </div>
        </div>
      </Modal>
    </>
  );
}
