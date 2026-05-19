import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import PageTitle from "../components/common/PageTitle";
import RiskBadge from "../components/common/RiskBadge";
import StatusBadge from "../components/common/StatusBadge";
import DataTable, { Column } from "../components/common/DataTable";
import { customerApi } from "../services";
import { formatINR, formatDateOnly } from "../utils/format";
import {
  Account, Alert, Customer, LoanApplication, STR, TransactionSummary,
} from "../types";

interface Customer360Dto {
  profile: Customer;
  accounts: Account[];
  loans: LoanApplication[];
  transactionSummary: TransactionSummary;
  recentAlerts: Alert[];
  strHistory: STR[];
  aiRiskSummary: string;
}

export default function Customer360Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["customer360", id],
    queryFn: () => customerApi.get360(id!) as Promise<Customer360Dto>,
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="p-6 text-slate-500">Loading customer profile…</div>;
  if (!data) return <div className="p-6 text-rose-600">Customer not found.</div>;

  const c = data.profile;

  const accountCols: Column<Account>[] = [
    { key: "accountNumber", header: "Account",  render: (a) => <a href={`/accounts/${a.accountNumber}`} className="text-bank-500 hover:underline">{a.accountNumber}</a> },
    { key: "productName",   header: "Product" },
    { key: "branchCode",    header: "Branch" },
    { key: "currency",      header: "Curr." },
    { key: "currentBalance",header: "Balance", render: (a) => formatINR(a.currentBalance, a.currency ?? "INR"), className: "text-right" },
    { key: "status",        header: "Status",  render: (a) => <StatusBadge value={a.status} /> },
  ];

  const loanCols: Column<LoanApplication>[] = [
    { key: "applicationId", header: "Application" },
    { key: "loanType",      header: "Type" },
    { key: "amount",        header: "Amount", render: (l) => formatINR(l.amount), className: "text-right" },
    { key: "creditScore",   header: "Credit" },
    { key: "amlRisk",       header: "AML",   render: (l) => <RiskBadge value={l.amlRisk} /> },
    { key: "status",        header: "Status", render: (l) => <StatusBadge value={l.status} /> },
  ];

  const alertCols: Column<Alert>[] = [
    { key: "alertId",  header: "Alert" },
    { key: "ruleName", header: "Rule" },
    { key: "priority", header: "Priority", render: (a) => <RiskBadge value={a.priority} /> },
    { key: "status",   header: "Status",   render: (a) => <StatusBadge value={a.status} /> },
    { key: "alertDate",header: "Date",     render: (a) => formatDateOnly(a.alertDate) },
  ];

  const strCols: Column<STR>[] = [
    { key: "strId",         header: "STR ID" },
    { key: "totalAmount",   header: "Amount", render: (s) => formatINR(s.totalAmount), className: "text-right" },
    { key: "transactionCount", header: "# Txn" },
    { key: "status",        header: "Status", render: (s) => <StatusBadge value={s.status} /> },
    { key: "filedWith",     header: "Filed With" },
  ];

  return (
    <>
      <PageTitle
        title={`${c.customerName}`}
        subtitle={`${c.customerId} · ${c.customerType ?? "—"} · ${c.branchCode ?? ""}`}
        actions={<button className="btn-secondary" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> Back</button>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card-pad lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <RiskBadge value={c.riskRating} />
            <StatusBadge value={c.kycStatus} />
            <StatusBadge value={c.status} />
            {c.pepFlag &&         <span className="badge bg-violet-50 text-violet-700 ring-violet-200">PEP</span>}
            {c.sanctionFlag &&    <span className="badge bg-rose-50 text-rose-700 ring-rose-200">Sanction Hit</span>}
            {c.adverseMediaFlag && <span className="badge bg-amber-50 text-amber-700 ring-amber-200">Adverse Media</span>}
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <KV label="Date of birth" value={c.dateOfBirth} />
            <KV label="Gender"        value={c.gender} />
            <KV label="Occupation"    value={c.occupation} />
            <KV label="Industry"      value={c.industry} />
            <KV label="Nationality"   value={c.nationality} />
            <KV label="Country"       value={c.countryCode} />
            <KV label="Mobile"        value={c.mobile} />
            <KV label="Email"         value={c.email} />
            <KV label="PAN"           value={c.panNumber} />
            <KV label="Aadhaar"       value={c.aadhaarNumber} />
            <KV label="Address"       value={c.address} className="sm:col-span-2" />
            <KV label="Onboarded"     value={c.onboardingDate} />
          </div>
        </div>

        <div className="card-pad bg-bank-50 border-bank-500/30">
          <div className="flex items-center gap-2 text-bank-600 font-semibold mb-2">
            <Sparkles className="h-4 w-4" /> AI risk summary
          </div>
          <p className="text-sm text-slate-700">{data.aiRiskSummary}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 mt-6">
        <Tile label="Total transactions"   value={data.transactionSummary.totalCount} />
        <Tile label="Total debit"          value={formatINR(data.transactionSummary.totalDebitAmount)} />
        <Tile label="Total credit"         value={formatINR(data.transactionSummary.totalCreditAmount)} />
        <Tile label="High-value amount"    value={formatINR(data.transactionSummary.highValueAmount)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Section title="Linked accounts">
          <DataTable<Account>
            columns={accountCols}
            rows={data.accounts}
            rowKey={(a) => a.accountNumber}
            empty="No accounts"
          />
        </Section>
        <Section title="Linked loans">
          <DataTable<LoanApplication>
            columns={loanCols}
            rows={data.loans}
            rowKey={(l) => l.applicationId}
            empty="No loan applications"
          />
        </Section>
        <Section title="Recent alerts">
          <DataTable<Alert>
            columns={alertCols}
            rows={data.recentAlerts}
            rowKey={(a) => a.alertId}
            empty="No alerts"
          />
        </Section>
        <Section title="STR history">
          <DataTable<STR>
            columns={strCols}
            rows={data.strHistory}
            rowKey={(s) => s.strId}
            empty="No STRs filed"
          />
        </Section>
      </div>
    </>
  );
}

function KV({ label, value, className }: { label: string; value: any; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="text-sm">{value ?? "—"}</div>
    </div>
  );
}
function Tile({ label, value }: { label: string; value: any }) {
  return (
    <div className="card-pad">
      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-2xl font-semibold mt-1 text-slate-800">{value ?? "—"}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700 mb-2">{title}</div>
      {children}
    </div>
  );
}
