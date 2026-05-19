import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageTitle from "../components/common/PageTitle";
import LineageGraphMock from "../components/charts/LineageGraphMock";
import { lineageApi } from "../services";
import { mockLineage } from "../mock-data";

export default function MetadataLineagePage() {
  const [table, setTable] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["lineage", table],
    queryFn: () => (table ? lineageApi.byTable(table) : lineageApi.full()),
    placeholderData: mockLineage,
  });

  return (
    <>
      <PageTitle
        title="Metadata & Lineage"
        subtitle="Source → warehouse → report data lineage and impact analysis"
      />

      <div className="card-pad mb-3 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[14rem]">
          <label className="label">Filter by table (optional)</label>
          <input
            className="input"
            placeholder="e.g. mst_customer or fact_alert"
            value={table}
            onChange={(e) => setTable(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-500 max-w-md">
          The lineage view is read from the <code>dw_metadata_lineage</code> table and
          augmented with the latest snapshot stored in MongoDB
          <code className="mx-1">data_lineage_graph_snapshot</code>.
        </div>
      </div>

      {isLoading ? (
        <div className="card-pad text-slate-500">Loading lineage…</div>
      ) : (
        <LineageGraphMock graph={data ?? mockLineage} />
      )}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Card title="Source systems" items={["Core Banking", "KYC System", "LOS", "Adverse Media API", "Sanctions API"]} />
        <Card title="Warehouse tables" items={["mst_customer", "mst_account", "fact_transaction", "fact_alert", "fact_str", "fact_loan_application"]} />
        <Card title="Reports" items={["AML Daily Alert Summary", "STR Filing Register", "CTR Filing Register", "Loan Risk Distribution"]} />
      </div>
    </>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card-pad">
      <div className="text-sm font-semibold text-slate-700 mb-2">{title}</div>
      <ul className="text-sm space-y-1">
        {items.map((i) => <li key={i} className="text-slate-600">· {i}</li>)}
      </ul>
    </div>
  );
}
