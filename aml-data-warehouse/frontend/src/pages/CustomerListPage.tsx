import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageTitle from "../components/common/PageTitle";
import SearchInput from "../components/common/SearchInput";
import FilterPanel from "../components/common/FilterPanel";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import RiskBadge from "../components/common/RiskBadge";
import ExportButton from "../components/common/ExportButton";
import { customerApi } from "../services";
import { mockCustomers } from "../mock-data";
import { Customer } from "../types";

export default function CustomerListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [risk, setRisk] = useState(params.get("risk") ?? "");
  const [kyc, setKyc] = useState(params.get("kyc") ?? "");
  const [branch, setBranch] = useState(params.get("branch") ?? "");

  useEffect(() => {
    setParams({ ...(q && { q }), ...(risk && { risk }), ...(kyc && { kyc }), ...(branch && { branch }) });
  }, [q, risk, kyc, branch, setParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", q, risk, kyc, branch],
    queryFn: () => customerApi.search({ q, risk, kyc, branch, size: 50 }),
    placeholderData: { content: mockCustomers, page: 0, size: 50, totalElements: mockCustomers.length, totalPages: 1, last: true },
  });

  const columns: Column<Customer>[] = [
    { key: "customerId", header: "Customer ID", width: "150px" },
    { key: "customerName", header: "Name" },
    { key: "customerType", header: "Type", render: (r) => r.customerType ?? "—" },
    { key: "branchCode", header: "Branch" },
    { key: "kycStatus", header: "KYC", render: (r) => <StatusBadge value={r.kycStatus} /> },
    { key: "riskRating", header: "Risk", render: (r) => <RiskBadge value={r.riskRating} /> },
    {
      key: "flags",
      header: "Flags",
      render: (r) => (
        <span className="space-x-1">
          {r.pepFlag &&         <span className="badge bg-violet-50 text-violet-700 ring-violet-200">PEP</span>}
          {r.sanctionFlag &&    <span className="badge bg-rose-50 text-rose-700 ring-rose-200">SANCTION</span>}
          {r.adverseMediaFlag && <span className="badge bg-amber-50 text-amber-700 ring-amber-200">ADVERSE</span>}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <PageTitle
        title="Customer 360"
        subtitle="Search the customer warehouse and open the consolidated 360° profile"
        actions={<ExportButton onClick={() => alert("CSV export queued")} />}
      />

      <FilterPanel onClear={() => { setQ(""); setRisk(""); setKyc(""); setBranch(""); }}>
        <div>
          <label className="label">Search</label>
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID, name, mobile, email" />
        </div>
        <div>
          <label className="label">Risk Rating</label>
          <select className="input" value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option value="">All</option>
            <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
          </select>
        </div>
        <div>
          <label className="label">KYC Status</label>
          <select className="input" value={kyc} onChange={(e) => setKyc(e.target.value)}>
            <option value="">All</option>
            <option>VERIFIED</option><option>PENDING</option><option>EXPIRED</option>
          </select>
        </div>
        <div>
          <label className="label">Branch</label>
          <input className="input" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="BR-MUM-01" />
        </div>
      </FilterPanel>

      <div className="mt-4">
        <DataTable<Customer>
          columns={columns}
          rows={data?.content ?? []}
          rowKey={(r) => r.customerId}
          loading={isLoading}
          onRowClick={(r) => navigate(`/customers/${r.customerId}`)}
        />
      </div>
    </>
  );
}
