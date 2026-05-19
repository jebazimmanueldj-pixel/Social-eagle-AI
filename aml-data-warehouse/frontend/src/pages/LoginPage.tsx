import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../services";
import { useAuthStore } from "../store/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("Aml@12345");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await authApi.login(username, password);
      setSession({ accessToken: r.accessToken, refreshToken: r.refreshToken, user: r.user });
      toast.success(`Welcome, ${r.user.fullName}`);
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const quickLogins = [
    { user: "analyst",    label: "AML Analyst" },
    { user: "supervisor", label: "AML Supervisor" },
    { user: "compliance", label: "Compliance Officer" },
    { user: "sysadmin",   label: "System Admin" },
  ];

  return (
    <div>
      <div className="lg:hidden flex items-center gap-2 mb-6 text-bank-700">
        <div className="h-9 w-9 rounded-lg bg-bank-accent text-bank-700 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-bold">AML Data Warehouse</div>
          <div className="text-[11px] opacity-80">Banking Compliance Suite</div>
        </div>
      </div>

      <div className="card-pad">
        <h2 className="text-lg font-semibold text-slate-800">Sign in</h2>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          Use one of the seeded users (default password <code>Aml@12345</code>).
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="analyst"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-2">Quick login</div>
          <div className="flex flex-wrap gap-2">
            {quickLogins.map((q) => (
              <button
                key={q.user}
                type="button"
                onClick={() => { setUsername(q.user); setPassword("Aml@12345"); }}
                className="text-xs bg-slate-100 hover:bg-slate-200 rounded-md px-2 py-1 text-slate-700"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
