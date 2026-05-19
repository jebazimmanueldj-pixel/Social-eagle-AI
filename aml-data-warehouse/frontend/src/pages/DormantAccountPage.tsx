import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { dormantApi } from "../services";
import { mockDormants } from "../mock-data";
import { DormantAccount } from "../types";
import { formatDateOnly } from "../utils/format";

export default function DormantAccountPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["dormant"],
    queryFn: () => dormantApi.list({ size: 100 }),
    placeholderData: { content: mockDormants, page: 0, size: 100, totalElements: 0, totalPages: 1, last: true },
  });

  const cols: Column<DormantAccount>[] = [
    { key: "accountNumber", header: "Account" },
    { key: "customerId",    header: "Customer" },
    { key: "branchCode",    header: "Branch" },
    { key: "lastTransactionDate", header: "Last txn", render: (d) => formatDateOnly(d.lastTransactionDate) },
    { key: "dormancyPeriodDays", header: "Days dormant", className: "text-right" },
    { key: "dormancyStatus", header: "Status", render: (d) => <StatusBadge value={d.dormancyStatus} /> },
    { key: "reactivationDate", header: "Reactivated on", render: (d) => formatDateOnly(d.reactivationDate) },
    { key: "suspiciousReactivationFlag", header: "Suspicious",
      render: (d) => d.suspiciousReactivationFlag
        ? <span className="badge bg-rose-50 text-rose-700 ring-rose-200">YES</span>
        : <span className="text-slate-400">—</span> },
    { key: "alertGenerated", header: "Alert",
      render: (d) => d.alertGenerated
        ? <span className="badge bg-amber-50 text-amber-700 ring-amber-200">RAISED</span>
        : <button
            className="btn-secondary text-xs"
            onClick={async (e) => {
              e.stopPropagation();
              await dormantApi.generateAlert(d.accountNumber);
              toast.success("Alert generated");
              qc.invalidateQueries({ queryKey: ["dormant"] });
            }}
          >Raise alert</button> },
  ];

  return (
    <>
      <PageTitle
        title="Dormant Account Monitoring"
        subtitle="Dormant accounts and suspicious reactivations across the network"
      />
      <DataTable<DormantAccount>
        columns={cols}
        rows={data?.content ?? []}
        rowKey={(d) => d.accountNumber}
        loading={isLoading}
      />
    </>
  );
}
