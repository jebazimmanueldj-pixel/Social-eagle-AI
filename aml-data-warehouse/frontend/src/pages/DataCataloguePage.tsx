import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageTitle from "../components/common/PageTitle";
import SearchInput from "../components/common/SearchInput";
import FilterPanel from "../components/common/FilterPanel";
import DataTable, { Column } from "../components/common/DataTable";
import ExportButton from "../components/common/ExportButton";
import { catalogueApi } from "../services";
import { mockCatalogue } from "../mock-data";
import { CatalogueGroup, DataCatalogueEntry } from "../types";

export default function DataCataloguePage() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("");
  const [relevance, setRelevance] = useState("");
  const [view, setView] = useState<"flat" | "grouped">("flat");

  const flat = useQuery({
    queryKey: ["catalogue", q, domain, relevance],
    queryFn: () => catalogueApi.search({ q, domain, relevance, size: 200 }),
    placeholderData: { content: mockCatalogue, page: 0, size: 200, totalElements: mockCatalogue.length, totalPages: 1, last: true },
  });

  const grouped = useQuery({
    queryKey: ["catalogue-grouped"],
    queryFn: () => catalogueApi.grouped(),
    enabled: view === "grouped",
    placeholderData: [
      { domain: "Customer", entries: mockCatalogue.filter((c) => c.domain === "Customer") },
      { domain: "Risk",     entries: mockCatalogue.filter((c) => c.domain === "Risk") },
    ] as CatalogueGroup[],
  });

  const cols: Column<DataCatalogueEntry>[] = [
    { key: "domain",      header: "Domain" },
    { key: "tableName",   header: "Table" },
    { key: "columnName",  header: "Column" },
    { key: "dataType",    header: "Type" },
    { key: "sourceSystem",header: "Source system" },
    { key: "sourceTable", header: "Source table" },
    { key: "sourceField", header: "Source field" },
    { key: "dataOwner",   header: "Owner" },
    { key: "dataQualityScore", header: "DQ", className: "text-right" },
    { key: "piiFlag",     header: "PII",
      render: (c) => c.piiFlag ? <span className="badge bg-rose-50 text-rose-700 ring-rose-200">PII</span> : <span className="text-slate-400">—</span> },
    { key: "amlRelevance",header: "AML",
      render: (c) => c.amlRelevance === "HIGH"
        ? <span className="badge bg-rose-50 text-rose-700 ring-rose-200">HIGH</span>
        : c.amlRelevance === "MEDIUM"
          ? <span className="badge bg-amber-50 text-amber-700 ring-amber-200">MED</span>
          : <span className="text-slate-400">{c.amlRelevance ?? "—"}</span> },
    { key: "businessDefinition", header: "Definition" },
  ];

  return (
    <>
      <PageTitle
        title="Data Catalogue"
        subtitle="Searchable, governed warehouse catalogue with grouped + flat exports"
        actions={
          <>
            <ExportButton href={catalogueApi.exportUrl()} label="Export flat (CSV)" />
            <button className="btn-secondary" onClick={() => alert("Grouped report queued")}>Export grouped</button>
          </>
        }
      />

      <div className="card-pad mb-3 flex gap-2">
        <button onClick={() => setView("flat")}    className={view === "flat"    ? "btn-primary" : "btn-secondary"}>Flat</button>
        <button onClick={() => setView("grouped")} className={view === "grouped" ? "btn-primary" : "btn-secondary"}>Grouped by domain</button>
      </div>

      <FilterPanel onClear={() => { setQ(""); setDomain(""); setRelevance(""); }}>
        <div><label className="label">Search</label>
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Table, column, definition" /></div>
        <div><label className="label">Domain</label>
          <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="">All</option>
            <option>Customer</option><option>Account</option><option>Transaction</option>
            <option>Risk</option><option>Compliance</option><option>LOS</option>
          </select></div>
        <div><label className="label">AML relevance</label>
          <select className="input" value={relevance} onChange={(e) => setRelevance(e.target.value)}>
            <option value="">All</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option><option>NONE</option>
          </select></div>
      </FilterPanel>

      <div className="mt-4">
        {view === "flat" && (
          <DataTable<DataCatalogueEntry>
            columns={cols}
            rows={flat.data?.content ?? []}
            rowKey={(c) => String(c.id)}
            loading={flat.isLoading}
          />
        )}
        {view === "grouped" && (
          <div className="space-y-4">
            {(grouped.data ?? []).map((g) => (
              <div key={g.domain}>
                <div className="text-sm font-semibold text-slate-700 mb-2">{g.domain}</div>
                <DataTable<DataCatalogueEntry>
                  columns={cols.filter((c) => c.key !== "domain")}
                  rows={g.entries}
                  rowKey={(c) => String(c.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
