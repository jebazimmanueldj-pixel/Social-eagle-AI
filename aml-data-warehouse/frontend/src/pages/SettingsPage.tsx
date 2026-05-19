import { useState } from "react";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import { useAuthStore } from "../store/auth";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [piiVisible, setPiiVisible] = useState(false);
  const [sessionMins, setSessionMins] = useState(30);

  return (
    <>
      <PageTitle title="Settings" subtitle="User preferences and platform settings" />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Profile">
          <Row k="Username"   v={user?.username} />
          <Row k="Full name"  v={user?.fullName} />
          <Row k="Email"      v={user?.email} />
          <Row k="Branch"     v={user?.branchCode} />
          <Row k="Department" v={user?.department} />
          <Row k="Roles"      v={user?.roles?.join(", ")} />
        </Card>

        <Card title="Preferences">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Theme</label>
              <select className="input" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                <option value="light">Light</option>
                <option value="dark">Dark (preview)</option>
              </select>
            </div>
            <div>
              <label className="label">Session timeout (minutes)</label>
              <input className="input" type="number" min={5} max={240} value={sessionMins} onChange={(e) => setSessionMins(Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" checked={piiVisible} onChange={(e) => setPiiVisible(e.target.checked)} />
              <label className="text-sm">Show un-masked PII (subject to role &amp; audit)</label>
            </div>
          </div>
          <button className="btn-primary mt-3" onClick={() => toast.success("Preferences saved")}>Save</button>
        </Card>

        <Card title="Security">
          <Row k="Password policy" v="Min 10 chars, 1 number, 1 special" />
          <Row k="MFA"               v="Disabled (prototype)" />
          <Row k="Last login"        v="Just now" />
          <button className="btn-secondary mt-3" onClick={() => toast.success("Password reset email sent")}>Reset password</button>
        </Card>

        <Card title="Platform">
          <Row k="Frontend"   v="React 18 + TypeScript + Vite" />
          <Row k="Backend"    v="Spring Boot 3 + Spring Security + JWT" />
          <Row k="Storage"    v="PostgreSQL + MongoDB" />
          <Row k="Build"      v={import.meta.env.MODE} />
          <Row k="API base"   v={import.meta.env.VITE_API_BASE ?? "/api"} />
        </Card>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-pad">
      <div className="text-sm font-semibold text-slate-700 mb-3">{title}</div>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <div className="text-slate-500">{k}</div>
      <div className="col-span-2">{v ?? "—"}</div>
    </div>
  );
}
