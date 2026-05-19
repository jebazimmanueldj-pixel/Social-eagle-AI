import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageTitle from "../components/common/PageTitle";
import SearchInput from "../components/common/SearchInput";
import FilterPanel from "../components/common/FilterPanel";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import ExportButton from "../components/common/ExportButton";
import SlideOver from "../components/common/SlideOver";
import { transactionApi } from "../services";
import { mockTransactions } from "../mock-data";
import { Transaction } from "../types";
import { formatINR, formatDate } from "../utils/format";

type Lens = "all" | "high-value" | "cash" | "cross-border";

export default function TransactionExplorerPage() {
  const [lens, setLens] = useState<Lens>("all");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [mode, setMode] = useState("");
  const [minAmt, setMinAmt] = useState<string>("");
  const [maxAmt, setMaxAmt] = useState<string>("");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["txn", lens, q, type, mode, minAmt, maxAmt],
    queryFn: () => {
      const params: Record<string, any> = { q, type, mode, size: 100 };
      if (minAmt) params.minAmt = minAmt;
      if (maxAmt) params.maxAmt = maxAmt;
      switch (lens) {
        case "high-value":   return transactionApi.highValue(params);
        case "cash":         return transactionApi.cash(params);
        case "cross-border": return transactionApi.crossBorder(params);
        default:             return transactionApi.search(params);
      }
    },
    placeholderData: { content: mockTransactions, page: 0, size: 100, totalElements: mockTransactions.length, totalPages: 1, last: true },
  });

  const cols: Column<Transaction>[] = [
    { key: "transactionId",   header: "Txn ID" },
    { key: "transactionDate", header: "Date", render: (t) => formatDate(t.transactionDate) },
    { key: "accountNumber",   header: "Account" },
    { key: "transactionType", header: "Type" },
    { key: "transactionMode", header: "Mode" },
    { key: "amount", header: "Amount", className: "text-right",
      render: (t) => formatINR(t.amount, t.currency ?? "INR") },
    { key: "counterpartyName", header: "Counterparty" },
    { key: "flags", header: "Flags",
      render: (t) => (
        <span className="space-x-1">
          {t.isCash         && <span className="badge bg-amber-50 text-amber-700 ring-amber-200">CASH</span>}
          {t.isCrossBorder  && <span className="badge bg-violet-50 text-violet-700 ring-violet-200">XBORDER</span>}
          {t.isHighValue    && <span className="badge bg-rose-50 text-rose-700 ring-rose-200">HIGH-VAL</span>}
        </span>
      ) },
    { key: "status", header: "Status", render: (t) => <StatusBadge value={t.status} /> },
  ];

  const lenses: { id: Lens; label: string }[] = [
    { id: "all",         label: "All" },
    { id: "high-value",  label: "High-value" },
    { id: "cash",        label: "Cash" },
    { id: "cross-border",label: "Cross-border" },
  ];

  return (
    <>
      <PageTitle
        title="Transaction Explorer"
        subtitle="Search, filter and inspect transactions across the warehouse"
        actions={
          <>
            <button className="btn-secondary" onClick={() => alert("Saved query 'last-search'")}>Save query</button>
            <ExportButton onClick={() => alert("CSV export queued")} />
          </>
        }
      />

      <div className="card-pad mb-3">
        <div className="flex flex-wrap gap-2">
          {lenses.map((l) => (
            <button
              key={l.id}
              onClick={() => setLens(l.id)}
              className={lens === l.id ? "btn-primary" : "btn-secondary"}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <FilterPanel onClear={() => { setQ(""); setType(""); setMode(""); setMinAmt(""); setMaxAmt(""); }}>
        <div><label className="label">Search</label>
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID, account, counterparty" /></div>
        <div><label className="label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option><option>DEBIT</option><option>CREDIT</option>
          </select></div>
        <div><label className="label">Mode</label>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">All</option>
            <option>CASH</option><option>NEFT</option><option>RTGS</option><option>IMPS</option>
            <option>UPI</option><option>SWIFT</option><option>ATM</option>
          </select></div>
        <div><label className="label">Min amount</label>
          <input type="number" className="input" value={minAmt} onChange={(e) => setMinAmt(e.target.value)} /></div>
        <div><label className="label">Max amount</label>
          <input type="number" className="input" value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} /></div>
      </FilterPanel>

      <div className="mt-4">
        <DataTable<Transaction>
          columns={cols}
          rows={data?.content ?? []}
          rowKey={(t) => t.transactionId}
          loading={isLoading}
          onRowClick={setSelected}
        />
      </div>

      <SlideOver
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.transactionId}
        subtitle={selected ? `${selected.transactionType} · ${formatINR(selected.amount, selected.currency)}` : undefined}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <KV k="Date" v={formatDate(selected.transactionDate)} />
              <KV k="Value date" v={formatDate(selected.valueDate)} />
              <KV k="Account" v={selected.accountNumber} />
              <KV k="Customer" v={selected.customerId} />
              <KV k="Mode" v={selected.transactionMode} />
              <KV k="Channel" v={selected.channel} />
              <KV k="Counterparty" v={selected.counterpartyName} />
              <KV k="Counterparty A/C" v={selected.counterpartyAccount} />
              <KV k="Counterparty bank" v={selected.counterpartyBank} />
              <KV k="Counterparty country" v={selected.counterpartyCountry} />
              <KV k="Branch" v={selected.branchCode} />
              <KV k="Status" v={<StatusBadge value={selected.status} />} />
            </div>
            <div>
              <div className="label">Narration</div>
              <p className="text-sm">{selected.narration ?? "—"}</p>
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
