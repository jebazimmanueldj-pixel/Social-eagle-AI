import { GripHorizontal, Plus, Trash2 } from "lucide-react";
import { DragEvent, useState } from "react";

export interface QueryCanvasState {
  tables: string[];
  columns: string[];
  filters: { column: string; op: string; value: string }[];
  groupBy: string[];
  limit: number;
}

interface Props {
  state: QueryCanvasState;
  onChange: (s: QueryCanvasState) => void;
}

const TABLES: Record<string, string[]> = {
  mst_customer: ["customer_id", "customer_name", "risk_rating", "kyc_status", "branch_code", "pep_flag", "sanction_flag"],
  mst_account:  ["account_number", "customer_id", "product_code", "branch_code", "current_balance", "status", "dormant_flag"],
  fact_transaction: ["transaction_id", "account_number", "customer_id", "amount", "transaction_mode", "is_cash", "is_cross_border", "is_high_value", "branch_code"],
  fact_alert:   ["alert_id", "alert_type", "rule_code", "customer_id", "branch_code", "risk_score", "priority", "status"],
  fact_str:     ["str_id", "customer_id", "branch_code", "total_amount", "status", "filed_with"],
  fact_loan_application: ["application_id", "customer_id", "loan_type", "amount", "credit_score", "aml_risk", "status"],
};

const OPS = ["=", "!=", ">", "<", ">=", "<=", "LIKE", "IN"];

export default function QueryBuilderCanvas({ state, onChange }: Props) {
  const [drag, setDrag] = useState<{ kind: "table" | "column"; value: string } | null>(null);

  const onDragStart = (kind: "table" | "column", value: string) => () => setDrag({ kind, value });

  const accept =
    (target: "TABLE" | "COLUMN" | "GROUPBY") =>
    (e: DragEvent) => {
      e.preventDefault();
      if (!drag) return;
      if (target === "TABLE" && drag.kind === "table" && !state.tables.includes(drag.value))
        onChange({ ...state, tables: [...state.tables, drag.value] });
      if (target === "COLUMN" && drag.kind === "column" && !state.columns.includes(drag.value))
        onChange({ ...state, columns: [...state.columns, drag.value] });
      if (target === "GROUPBY" && drag.kind === "column" && !state.groupBy.includes(drag.value))
        onChange({ ...state, groupBy: [...state.groupBy, drag.value] });
      setDrag(null);
    };

  const removeAt = <K extends keyof QueryCanvasState>(field: K, idx: number) => {
    const arr = [...(state[field] as any[])];
    arr.splice(idx, 1);
    onChange({ ...state, [field]: arr } as QueryCanvasState);
  };

  return (
    <div className="grid lg:grid-cols-[18rem_1fr] gap-4">
      {/* Left palette */}
      <div className="card-pad space-y-3">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Tables</div>
        <ul className="space-y-1">
          {Object.keys(TABLES).map((t) => (
            <li
              key={t}
              draggable
              onDragStart={onDragStart("table", t)}
              className="text-sm bg-slate-50 hover:bg-slate-100 rounded-md px-2 py-1.5 cursor-grab flex items-center gap-2"
              title={`Drag ${t} into the canvas`}
            >
              <GripHorizontal className="h-3 w-3 text-slate-400" /> {t}
            </li>
          ))}
        </ul>

        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold pt-3">Columns</div>
        <div className="max-h-72 overflow-y-auto scrollbar-thin space-y-2">
          {state.tables.length === 0 && <div className="text-xs text-slate-500">Add a table to see its columns.</div>}
          {state.tables.map((t) => (
            <div key={t}>
              <div className="text-[11px] font-semibold text-slate-700 mt-1">{t}</div>
              <ul className="space-y-1 ml-1">
                {(TABLES[t] ?? []).map((c) => (
                  <li
                    key={`${t}.${c}`}
                    draggable
                    onDragStart={onDragStart("column", `${t}.${c}`)}
                    className="text-[12px] text-slate-600 hover:text-slate-900 cursor-grab"
                  >
                    · {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="space-y-3">
        <DropZone label="Tables (FROM / JOIN)" onDrop={accept("TABLE")}>
          {state.tables.map((t, i) => (
            <Pill key={t} label={t} onRemove={() => removeAt("tables", i)} />
          ))}
        </DropZone>

        <DropZone label="Columns (SELECT)" onDrop={accept("COLUMN")}>
          {state.columns.map((c, i) => (
            <Pill key={c} label={c} onRemove={() => removeAt("columns", i)} />
          ))}
        </DropZone>

        <div className="card-pad">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Filters (WHERE)</div>
            <button
              className="btn-secondary text-xs"
              onClick={() =>
                onChange({
                  ...state,
                  filters: [...state.filters, { column: "", op: "=", value: "" }],
                })
              }
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {state.filters.length === 0 && (
              <div className="text-xs text-slate-500">No filters — all rows.</div>
            )}
            {state.filters.map((f, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="input col-span-5"
                  placeholder="column"
                  value={f.column}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      filters: state.filters.map((x, ix) => (ix === i ? { ...x, column: e.target.value } : x)),
                    })
                  }
                />
                <select
                  className="input col-span-2"
                  value={f.op}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      filters: state.filters.map((x, ix) => (ix === i ? { ...x, op: e.target.value } : x)),
                    })
                  }
                >
                  {OPS.map((o) => <option key={o}>{o}</option>)}
                </select>
                <input
                  className="input col-span-4"
                  placeholder="value"
                  value={f.value}
                  onChange={(e) =>
                    onChange({
                      ...state,
                      filters: state.filters.map((x, ix) => (ix === i ? { ...x, value: e.target.value } : x)),
                    })
                  }
                />
                <button onClick={() => removeAt("filters", i)} className="text-slate-400 hover:text-rose-500 col-span-1 flex justify-center">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <DropZone label="Group By" onDrop={accept("GROUPBY")}>
          {state.groupBy.map((c, i) => (
            <Pill key={c} label={c} onRemove={() => removeAt("groupBy", i)} />
          ))}
        </DropZone>

        <div className="card-pad">
          <label className="label">Row limit</label>
          <input
            type="number"
            className="input w-32"
            value={state.limit}
            min={1}
            max={10000}
            onChange={(e) => onChange({ ...state, limit: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}

function DropZone({
  label, children, onDrop,
}: { label: string; children: React.ReactNode; onDrop: (e: DragEvent) => void }) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="card-pad min-h-[88px] border-dashed"
      style={{ borderStyle: "dashed", borderWidth: 1.5, borderColor: "#cbd5e1" }}
    >
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
      {(() => {
        const childArr = Array.isArray(children) ? children : [children];
        return childArr.filter(Boolean).length === 0 && (
          <div className="text-xs text-slate-500">Drop tables / columns here.</div>
        );
      })()}
    </div>
  );
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 bg-bank-50 text-bank-600 ring-1 ring-bank-500/20 rounded-full px-3 py-1 text-xs">
      {label}
      <button onClick={onRemove} className="text-bank-500 hover:text-rose-500">
        <Trash2 className="h-3 w-3" />
      </button>
    </span>
  );
}
