import { Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bank-700">
      <div className="hidden lg:flex flex-col justify-between p-10 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-bank-accent text-bank-700 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold">AML Data Warehouse</div>
            <div className="text-xs opacity-80">Banking Compliance Suite</div>
          </div>
        </div>
        <div className="space-y-3 max-w-md">
          <h1 className="text-3xl font-bold">A single pane of glass for AML investigations.</h1>
          <p className="opacity-80 text-sm">
            360° customer view, alert triage, STR / CTR generation, drag-and-drop query builder,
            data lineage, and an AI assistant — all on top of an enterprise warehouse.
          </p>
          <ul className="text-sm space-y-2 opacity-90">
            <li>• 22 modules, role-based access</li>
            <li>• PostgreSQL + MongoDB hybrid storage</li>
            <li>• Maker-checker workflows for STR / CTR</li>
            <li>• Built-in audit trail and data quality dashboard</li>
          </ul>
        </div>
        <div className="text-[11px] opacity-60">© AML Platform Team — internal prototype</div>
      </div>

      <div className="flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
