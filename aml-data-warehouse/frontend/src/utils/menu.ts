/* Menu definition shared between Sidebar and AppRoutes. */

import {
  LayoutDashboard, Users, CreditCard, Activity, Bell, ShieldAlert,
  ShieldCheck, ShieldX, FileWarning, Banknote, MoonStar, Briefcase,
  Database, Bot, MousePointer2, Gauge, GitBranch, Cpu, FileBarChart2,
  ScrollText, UserCog, Settings as SettingsIcon,
} from "lucide-react";

export interface MenuEntry {
  id: string;
  title: string;
  path: string;
  icon: any;
  group: string;
}

export const MENU: MenuEntry[] = [
  { id: "dashboard",          title: "Dashboard",            path: "/",                   icon: LayoutDashboard, group: "Operations" },
  { id: "customer-360",       title: "Customer 360",         path: "/customers",          icon: Users,           group: "Operations" },
  { id: "account-360",        title: "Account 360",          path: "/accounts",           icon: CreditCard,      group: "Operations" },
  { id: "transaction-explorer",title: "Transaction Explorer",path: "/transactions",       icon: Activity,        group: "Operations" },

  { id: "aml-alerts",         title: "AML Alerts",           path: "/alerts",             icon: Bell,            group: "AML" },
  { id: "positive-alerts",    title: "Positive Alerts",      path: "/positive-alerts",    icon: ShieldAlert,     group: "AML" },
  { id: "negative-alerts",    title: "Negative Alerts",      path: "/negative-alerts",    icon: ShieldX,         group: "AML" },
  { id: "str-generation",     title: "STR Generation",       path: "/str",                icon: FileWarning,     group: "AML" },
  { id: "ctr-reports",        title: "CTR Reports",          path: "/ctr",                icon: Banknote,        group: "AML" },
  { id: "dormant-accounts",   title: "Dormant Accounts",     path: "/dormant",            icon: MoonStar,        group: "AML" },

  { id: "los",                title: "LOS Data Mart",        path: "/los",                icon: Briefcase,       group: "Lending" },

  { id: "data-catalogue",     title: "Data Catalogue",       path: "/catalogue",          icon: Database,        group: "Governance" },
  { id: "ai-query-assistant", title: "AI Query Assistant",   path: "/ai",                 icon: Bot,             group: "Governance" },
  { id: "query-builder",      title: "Drag-Drop Query Bldr", path: "/query-builder",      icon: MousePointer2,   group: "Governance" },
  { id: "data-quality",       title: "Data Quality",         path: "/data-quality",       icon: Gauge,           group: "Governance" },
  { id: "metadata-lineage",   title: "Metadata & Lineage",   path: "/lineage",            icon: GitBranch,       group: "Governance" },
  { id: "etl-job-monitor",    title: "ETL Job Monitor",      path: "/etl",                icon: Cpu,             group: "Governance" },

  { id: "reports",            title: "Reports & Dashboards", path: "/reports",            icon: FileBarChart2,   group: "Reporting" },
  { id: "audit-trail",        title: "Audit Trail",          path: "/audit",              icon: ScrollText,      group: "Reporting" },

  { id: "user-access",        title: "User Access",          path: "/users",              icon: UserCog,         group: "Admin" },
  { id: "settings",           title: "Settings",             path: "/settings",           icon: SettingsIcon,    group: "Admin" },
];

export const MENU_BY_ID = Object.fromEntries(MENU.map((m) => [m.id, m]));
