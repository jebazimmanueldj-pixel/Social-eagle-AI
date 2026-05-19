import { useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, Send, ClipboardCopy } from "lucide-react";
import PageTitle from "../components/common/PageTitle";
import { aiApi } from "../services";

interface Conversation {
  prompt: string;
  sql?: string;
  explanation?: string;
  preview?: Array<Record<string, any>>;
}

const STARTERS = [
  "Show high-risk customers with cash transactions above 300000",
  "Generate branch-wise STR count",
  "Show dormant accounts reactivated in last 30 days",
  "Find all fields used for STR generation",
];

export default function AIQueryAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Conversation[]>([]);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setBusy(true);
    setPrompt("");
    try {
      const r = await aiApi.query(q);
      setHistory((h) => [{ prompt: q, sql: r.sql, explanation: r.explanation, preview: r.preview }, ...h]);
    } catch {
      setHistory((h) => [
        {
          prompt: q,
          sql: "SELECT customer_id, customer_name, risk_rating FROM mst_customer WHERE risk_rating IN ('HIGH','CRITICAL');",
          explanation: "Backend unreachable — sample SQL.",
        },
        ...h,
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle
        title="AI Query Assistant"
        subtitle="Natural language → SQL with explanation and result preview"
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="card-pad">
            <form onSubmit={(e) => { e.preventDefault(); ask(prompt); }} className="flex gap-2">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. show top 10 customers by cash deposits last week"
                className="input flex-1"
              />
              <button type="submit" disabled={busy} className="btn-primary">
                <Send className="h-4 w-4" /> {busy ? "Thinking…" : "Ask"}
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1 text-slate-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {history.length === 0 && (
            <div className="card-pad text-center py-12">
              <Sparkles className="h-8 w-8 text-bank-500 mx-auto mb-3" />
              <div className="font-semibold text-slate-700">Ask the warehouse a question</div>
              <div className="text-sm text-slate-500">
                The assistant generates safe SQL grounded in your data catalogue.
              </div>
            </div>
          )}

          {history.map((c, i) => (
            <div key={i} className="card-pad">
              <div className="font-semibold text-slate-700 mb-2">{c.prompt}</div>
              {c.explanation && <p className="text-sm text-slate-600 mb-2">{c.explanation}</p>}
              {c.sql && (
                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-200 rounded-lg p-3 text-xs overflow-x-auto">
                    {c.sql}
                  </pre>
                  <button
                    onClick={() => { navigator.clipboard.writeText(c.sql ?? ""); toast.success("SQL copied"); }}
                    className="absolute top-2 right-2 text-slate-300 hover:text-white"
                    title="Copy SQL"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </button>
                </div>
              )}
              {c.preview && c.preview.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Preview</div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {Object.keys(c.preview[0]).map((k) => <th key={k}>{k}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {c.preview.map((row, ri) => (
                          <tr key={ri}>
                            {Object.values(row).map((v, vi) => <td key={vi}>{String(v)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <aside className="card-pad h-fit">
          <div className="text-sm font-semibold text-slate-700 mb-2">Tips</div>
          <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
            <li>Mention an entity (customer, account, transaction, alert, STR).</li>
            <li>Specify a filter: risk rating, branch, date range, threshold.</li>
            <li>Ask for an aggregate (count, sum) by branch / product.</li>
            <li>Generated SQL is read-only and runs against governed views.</li>
          </ul>
          <div className="mt-4 text-xs text-slate-500">
            All prompts and responses are logged in MongoDB
            <code className="mx-1">ai_conversation_history</code> for audit.
          </div>
        </aside>
      </div>
    </>
  );
}
