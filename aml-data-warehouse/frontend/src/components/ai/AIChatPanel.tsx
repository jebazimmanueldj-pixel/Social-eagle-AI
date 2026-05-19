import { Bot, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { aiApi } from "../../services";

interface Message {
  role: "user" | "ai";
  content: string;
  sql?: string;
}

const STARTERS = [
  "Show high-risk customers with cash transactions above 300000",
  "Generate branch-wise STR count",
  "Show dormant accounts reactivated in last 30 days",
  "Find all fields used for STR generation",
];

export default function AIChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hi! I'm the AML Data Warehouse AI assistant. Ask me about customers, alerts, " +
        "STR / CTR or data lineage. I can also generate SQL from plain English.",
    },
  ]);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    try {
      const r = await aiApi.query(q);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: r.explanation ?? "Here is the generated SQL:",
          sql: r.sql,
        },
      ]);
    } catch {
      // Backend offline — graceful fallback
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content:
            "Backend unreachable — here's a sample SQL based on the prompt. " +
            "Connect the backend to get live results.",
          sql:
            "SELECT customer_id, customer_name, risk_rating\n" +
            "FROM   mst_customer\n" +
            "WHERE  risk_rating IN ('HIGH','CRITICAL')\n" +
            "ORDER  BY customer_name;",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-bank-500 text-white shadow-xl
                   hover:bg-bank-600 flex items-center justify-center"
        aria-label="AI Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[26rem] max-w-[92vw] h-[34rem] z-30
                        card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-bank-500 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <div className="text-sm font-semibold">AML AI Assistant</div>
                <div className="text-[11px] opacity-80">Natural language → SQL · Narratives</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    m.role === "user"
                      ? "inline-block max-w-[85%] bg-bank-500 text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm"
                      : "inline-block max-w-[95%] bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 text-sm shadow-sm"
                  }
                >
                  <div>{m.content}</div>
                  {m.sql && (
                    <pre className="mt-2 text-xs bg-slate-900 text-emerald-200 rounded-md p-2 overflow-x-auto whitespace-pre">
                      {m.sql}
                    </pre>
                  )}
                  {m.sql && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.sql ?? "");
                        toast.success("SQL copied");
                      }}
                      className="mt-1 text-[11px] text-bank-500 hover:underline"
                    >
                      Copy SQL
                    </button>
                  )}
                </div>
              </div>
            ))}
            {busy && <div className="text-xs text-slate-500">Thinking…</div>}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-slate-200 bg-white">
              <div className="text-[11px] text-slate-500 mb-1">Try asking:</div>
              <div className="flex flex-wrap gap-1">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 rounded-full px-2 py-1 text-slate-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); ask(input); }}
            className="p-3 border-t border-slate-200 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask in plain English…"
              className="input flex-1"
            />
            <button type="submit" className="btn-primary" disabled={busy}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
