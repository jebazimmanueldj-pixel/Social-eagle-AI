import { useState } from "react";
import toast from "react-hot-toast";
import { Play, Save } from "lucide-react";
import PageTitle from "../components/common/PageTitle";
import QueryBuilderCanvas, { QueryCanvasState } from "../components/common/QueryBuilderCanvas";
import { queryBuilderApi } from "../services";

export default function QueryBuilderPage() {
  const [state, setState] = useState<QueryCanvasState>({
    tables: ["mst_customer"],
    columns: ["mst_customer.customer_id", "mst_customer.customer_name", "mst_customer.risk_rating"],
    filters: [{ column: "mst_customer.risk_rating", op: "=", value: "HIGH" }],
    groupBy: [],
    limit: 100,
  });
  const [sql, setSql] = useState("");
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [busy, setBusy] = useState(false);

  const execute = async () => {
    setBusy(true);
    try {
      const r = await queryBuilderApi.execute({
        tables: state.tables,
        columns: state.columns,
        filters: state.filters,
        groupBy: state.groupBy,
        limit: state.limit,
      });
      setSql(r.sql);
      setRows(r.rows ?? []);
    } catch {
      toast.error("Backend unreachable");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    const name = window.prompt("Template name") ?? "";
    if (!name.trim()) return;
    try {
      await queryBuilderApi.save({ name, description: "Saved from UI", sql });
      toast.success("Template saved");
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <>
      <PageTitle
        title="Drag-and-Drop Query Builder"
        subtitle="Compose SQL visually — drop tables and columns, add filters, run a preview"
        actions={
          <>
            <button className="btn-secondary" onClick={save} disabled={!sql}>
              <Save className="h-4 w-4" /> Save template
            </button>
            <button className="btn-primary" onClick={execute} disabled={busy}>
              <Play className="h-4 w-4" /> {busy ? "Running…" : "Run query"}
            </button>
          </>
        }
      />

      <QueryBuilderCanvas state={state} onChange={setState} />

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <div className="card-pad">
          <div className="text-sm font-semibold text-slate-700 mb-2">SQL preview</div>
          <pre className="bg-slate-900 text-emerald-200 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre">
            {sql || "-- Run the query to see generated SQL --"}
          </pre>
        </div>
        <div className="card-pad">
          <div className="text-sm font-semibold text-slate-700 mb-2">Result preview</div>
          {rows.length === 0 ? (
            <div className="text-sm text-slate-500">No rows yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>{Object.keys(rows[0]).map((k) => <th key={k}>{k}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      {Object.values(r).map((v, vi) => <td key={vi}>{String(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
