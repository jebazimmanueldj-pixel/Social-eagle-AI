import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageTitle from "../components/common/PageTitle";
import StatusBadge from "../components/common/StatusBadge";
import RiskBadge from "../components/common/RiskBadge";
import DataTable, { Column } from "../components/common/DataTable";
import { accountApi } from "../services";
import { formatINR, formatDate, formatDateOnly } from "../utils/format";
import { Account, Alert, Customer, TransactionSummary } from "../types";

interface Account360Dto {
  profile: Account;
  customer: Customer;
  transactionSummary: TransactionSummary;
  alerts: Alert[];
}

export default function Account360Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["account360", id],
    queryFn: () => accountApi.get360(id!) as Promise<Account360Dto>,
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="p-6 text-slate-500">Loading…</div>;
  if (!data) return <div className="p-6 text-rose-600">Account not found.</div>;

  const a = data.profile;
  const c = data.customer;

  const alertCols: Column<Alert>[] = [
    { key: "alertId", header: "Alert" },
    { key: "ruleName", header: "Rule" },
    { key: "priority", header: "Priority", render: (a) => <RiskBadge value={a.priority} /> },
    { key: "status",   header: "Status",   render: (a) => <StatusBadge value={a.status} /> },
    { key: "alertDate",header: "Date",     render: (a) => formatDate(a.alertDate) },
  ];

  return (
    <>
      <PageTitle
        title={a.accountNumber}
        subtitle={`${a.productName} · ${a.branchCode} · ${a.currency}`}
        actions={<button className="btn-secondary" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> Back</button>}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-pad">
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge value={a.status} />
            {a.dormantFlag && <StatusBadge value="DORMANT" />}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <KV label="Current balance"   value={formatINR(a.currentBalance, a.currency ?? "INR")} />
            <KV label="Available balance" value={formatINR(a.availableBalance, a.currency ?? "INR")} />
            <KV label="Open date"         value={formatDateOnly(a.openDate)} />
            <KV label="Last txn"          value={formatDateOnly(a.lastTransactionDate)} />
            <KV label="Dormancy days"     value={a.dormancyPeriodDays ?? 0} />
            <KV label="Branch"            value={a.branchCode} />
          </div>
        </div>
        <div className="card-pad">
          <div className="text-sm font-semibold text-slate-700 mb-2">Linked customer</div>
          <a href={`/customers/${c.customerId}`} className="text-bank-500 hover:underline font-medium">
            {c.customerName} ({c.customerId})
          </a>
          <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
            <KV label="Risk"     value={<RiskBadge value={c.riskRating} />} />
            <KV label="KYC"      value={<StatusBadge value={c.kycStatus} />} />
            <KV label="Mobile"   value={c.mobile} />
            <KV label="Email"    value={c.email} />
            <KV label="PAN"      value={c.panNumber} />
            <KV label="Branch"   value={c.branchCode} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mt-6">
        <Tile label="Total transactions" value={data.transactionSummary.totalCount} />
        <Tile label="Debits"              value={`${data.transactionSummary.debitCount} (${formatINR(data.transactionSummary.totalDebitAmount)})`} />
        <Tile label="Credits"             value={`${data.transactionSummary.creditCount} (${formatINR(data.transactionSummary.totalCreditAmount)})`} />
        <Tile label="Cash / Cross-border" value={`${data.transactionSummary.cashCount} / ${data.transactionSummary.crossBorderCount}`} />
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-slate-700 mb-2">Alerts on this account</div>
        <DataTable<Alert> columns={alertCols} rows={data.alerts} rowKey={(a) => a.alertId} empty="No alerts" />
      </div>
    </>
  );
}

function KV({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="text-sm">{value ?? "—"}</div>
    </div>
  );
}
function Tile({ label, value }: { label: string; value: any }) {
  return (
    <div className="card-pad">
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="text-lg font-semibold mt-1 text-slate-800">{value}</div>
    </div>
  );
}
