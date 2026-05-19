import { Bell, ChevronDown, LogOut, Search, Settings, UserCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { authApi } from "../../services";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(false);

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    clear();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sticky top-0 z-20">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search customers, accounts, alerts, STR…"
            className="input pl-9 bg-slate-50 border-slate-200"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) navigate(`/customers?q=${encodeURIComponent(v)}`);
              }
            }}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 relative">
        <div className="relative">
          <button onClick={() => setNotifs(!notifs)} className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full"></span>
          </button>
          {notifs && (
            <div className="absolute right-0 top-12 w-80 card p-0 shadow-xl z-30">
              <div className="px-4 py-2 border-b border-slate-200 text-sm font-semibold">Notifications</div>
              <ul className="text-sm divide-y divide-slate-100">
                <li className="px-4 py-3 hover:bg-slate-50">
                  <span className="font-medium">3 critical alerts</span> awaiting investigation
                </li>
                <li className="px-4 py-3 hover:bg-slate-50">
                  <span className="font-medium">STR-2024-002</span> submitted for approval
                </li>
                <li className="px-4 py-3 hover:bg-slate-50">
                  ETL job <span className="font-medium">load_kyc_screening</span> failed
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <UserCircle className="h-7 w-7 text-slate-600" />
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium text-slate-800 leading-tight">{user?.fullName ?? "Guest"}</div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {user?.roles?.[0]?.replace(/_/g, " ") ?? "—"}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {open && (
            <div className="absolute right-0 top-12 w-60 card p-0 shadow-xl z-30">
              <div className="px-4 py-3 border-b border-slate-200">
                <div className="text-sm font-semibold">{user?.fullName}</div>
                <div className="text-[11px] text-slate-500">{user?.email}</div>
                <div className="text-[11px] text-slate-500">Branch: {user?.branchCode}</div>
              </div>
              <button
                onClick={() => { setOpen(false); navigate("/settings"); }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <button
                onClick={logout}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-rose-600"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
