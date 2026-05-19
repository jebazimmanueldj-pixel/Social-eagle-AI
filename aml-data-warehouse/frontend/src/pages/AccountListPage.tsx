import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../components/common/PageTitle";
import SearchInput from "../components/common/SearchInput";
import FilterPanel from "../components/common/FilterPanel";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { accountApi } from "../services";
import { mockAccounts } from "../mock-data";
import { Account } from "../types";
import { formatINR } from "../utils/format";

export default function AccountListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState("");
  const [branch, setBranch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["accounts", q, status, product, branch],
    queryFn: () => accountApi.search({ q, status, product, branch, size: 50 }),
    placeholderData: { content: mockAccounts, page: 0, size: 50, totalElements: mockAccounts.length, totalPages: 1, last: true },
  });

  const cols: Column<Account>[] = [
    { key: "accountNumber",   header: "Account #",  width: "180px" },
    { key: "customerId",      header: "Customer" },
    { key: "productName",     header: "Product" },
    { key: "branchCode",      header: "Branch" },
    { key: "currency",        header: "Curr." },
    { key: "currentBalance",  header: "Balance", className: "text-right",
      render: (a) => formatINR(a.currentBalance, a.currency ?? "INR") },
    { key: "status",          header: "Status",  render: (a) => <StatusBadge value={a.status} /> },
    { key: "dormantFlag",     header: "Dormant", render: (a) => a.dormantFlag ? <StatusBadge value="DORMANT" /> : <span className="text-slate-400">—</span> },
  ];

  return (
    <>
      <PageTitle title="Account 360" subtitle="Search bank accounts and open the consolidated 360° view" />

      <FilterPanel onClear={() => { setQ(""); setStatus(""); setProduct(""); setBranch(""); }}>
        <div><label className="label">Search</label>
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Account or Customer ID" /></div>
        <div><label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option><option>ACTIVE</option><option>DORMANT</option><option>CLOSED</option><option>FROZEN</option>
          </select></div>
        <div><label className="label">Product</label>
          <select className="input" value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="">All</option><option>SAV</option><option>CUR</option><option>FD</option><option>RD</option><option>CC</option><option>LON</option>
          </select></div>
        <div><label className="label">Branch</label>
          <input className="input" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="BR-MUM-01" /></div>
      </FilterPanel>

      <div className="mt-4">
        <DataTable<Account>
          columns={cols}
          rows={data?.content ?? []}
          rowKey={(a) => a.accountNumber}
          loading={isLoading}
          onRowClick={(a) => navigate(`/accounts/${a.accountNumber}`)}
        />
      </div>
    </>
  );
}
