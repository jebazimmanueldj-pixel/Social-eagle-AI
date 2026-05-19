import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageTitle from "../components/common/PageTitle";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import RiskBadge from "../components/common/RiskBadge";
import { losApi } from "../services";
import { mockLoans } from "../mock-data";
import { LoanApplication } from "../types";
import { formatINR, formatDateOnly } from "../utils/format";

const TABS: { id: "al" | "ml" | "cc" | "pl"; label: string; description: string }[] = [
  { id: "al", label: "Auto Loan",     description: "Vehicle financing applications" },
  { id: "ml", label: "Mortgage Loan", description: "Home and commercial property loans" },
  { id: "cc", label: "Credit Card",   description: "Credit card applications" },
  { id: "pl", label: "Personal Loan", description: "Unsecured personal loans" },
];

export default function LOSDataMartPage() {
  const [tab, setTab] = useState<"al" | "ml" | "cc" | "pl">("al");

  const { data, isLoading } = useQuery({
    queryKey: ["los", tab],
    queryFn: () => losApi.byType(tab, { size: 100 }),
    placeholderData: { content: mockLoans.filter((l) => l.loanType === tab.toUpperCase()), page: 0, size: 100, totalElements: 0, totalPages: 1, last: true },
  });

  const cols: Column<LoanApplication>[] = [
    { key: "applicationId", header: "App ID" },
    { key: "customerId",    header: "Customer" },
    { key: "productName",   header: "Product" },
    { key: "amount", header: "Amount", className: "text-right",
      render: (l) => formatINR(l.amount) },
    { key: "tenureMonths", header: "Tenure (m)", className: "text-right" },
    { key: "interestRate", header: "Rate %",     className: "text-right" },
    { key: "creditScore",  header: "Credit",     className: "text-right" },
    { key: "amlRisk",      header: "AML",        render: (l) => <RiskBadge value={l.amlRisk} /> },
    { key: "linkedAlerts", header: "Linked alerts", className: "text-right" },
    { key: "status",       header: "Status",     render: (l) => <StatusBadge value={l.status} /> },
    { key: "branchCode",   header: "Branch" },
    { key: "appliedOn",    header: "Applied", render: (l) => formatDateOnly(l.appliedOn) },
  ];

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <>
      <PageTitle title="LOS Data Mart" subtitle="Loan Origination System portfolios with embedded AML risk" />

      <div className="card-pad mb-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={tab === t.id ? "btn-primary" : "btn-secondary"}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 mt-2">{active.description}</div>
      </div>

      <DataTable<LoanApplication>
        columns={cols}
        rows={data?.content ?? []}
        rowKey={(l) => l.applicationId}
        loading={isLoading}
      />
    </>
  );
}
