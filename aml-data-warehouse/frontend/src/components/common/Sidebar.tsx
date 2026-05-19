import clsx from "clsx";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import { MENU } from "../../utils/menu";
import { useAuthStore } from "../../store/auth";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  const user = useAuthStore((s) => s.user);
  // Show every menu if backend hasn't computed access (fallback for offline mode)
  const allowed = user?.menus?.length ? new Set(user.menus) : null;

  // Group entries
  const groups = MENU.reduce<Record<string, typeof MENU>>((acc, m) => {
    (acc[m.group] ??= []).push(m);
    return acc;
  }, {});

  return (
    <aside
      className={clsx(
        "h-full bg-bank-700 text-slate-100 flex flex-col transition-[width] duration-200 sticky top-0",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="h-16 px-4 flex items-center gap-2 border-b border-white/10">
        <div className="h-9 w-9 rounded-lg bg-bank-accent text-bank-700 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex-1">
            <div className="text-sm font-bold">AML DW</div>
            <div className="text-[11px] text-slate-300">Compliance Suite</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-md hover:bg-white/10 transition"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className={clsx("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
        {Object.entries(groups).map(([group, items]) => {
          const visible = allowed
            ? items.filter((i) => allowed.has(i.id))
            : items;
          if (!visible.length) return null;
          return (
            <div key={group} className="mb-3">
              {!collapsed && (
                <div className="px-4 text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  {group}
                </div>
              )}
              {visible.map((m) => (
                <NavLink
                  key={m.id}
                  to={m.path}
                  end={m.path === "/"}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-4 py-2 text-sm transition relative",
                      isActive
                        ? "bg-white/10 text-white border-l-4 border-bank-accent"
                        : "text-slate-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                    )
                  }
                  title={collapsed ? m.title : undefined}
                >
                  <m.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{m.title}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10 text-[11px] text-slate-400">
          v1.0 · Build {new Date().toISOString().slice(0, 10)}
        </div>
      )}
    </aside>
  );
}
