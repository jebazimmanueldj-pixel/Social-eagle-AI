import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
} from "recharts";
import PageTitle from "../components/common/PageTitle";
import StatCard from "../components/common/StatCard";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import RiskBadge from "../components/common/RiskBadge";
import ChartCard from "../components/charts/ChartCard";
import { dataQualityApi } from "../services";
import { mockDqIssues } from "../mock-data";
import { DataQualityIssue } from "../types";
import { AlertOctagon, Database, Gauge, ShieldCheck } from "lucide-react";
import { formatDate } from "../utils/format";

export default function DataQualityPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");

  const summary = useQuery({
    queryKey: ["dq-summary"],
    queryFn: () => dataQualityApi.summary(),
    placeholderData: { totalIssues: 10, openIssues: 7, resolvedIssues: 2, dataQualityScore: 94 },
  });

  const issues = useQuery({
    queryKey: ["dq-issues", statusFilter],
    queryFn: () => dataQualityApi.issues({ status: statusFilter, size: 100 }),
    placeholderData: { content: mockDqIssues, page: 0, size: 100, totalElements: mockDqIssues.length, totalPages: 1, last: true },
  });

  const cols: Column<DataQualityIssue>[] = [
    { key: "ruleCode",  header: "Rule" },
    { key: "ruleName",  header: "Description" },
    { key: "tableName", header: "Table" },
    { key: "columnName",header: "Column" },
    { key: "issueType", header: "Type" },
    { key: "severity",  header: "Severity", render: (i) => <RiskBadge value={i.severity} /> },
    { key: "recordCount", header: "Records", className: "text-right" },
    { key: "status",    header: "Status", render: (i) => <StatusBadge value={i.status} /> },
    { key: "assignedTo",header: "Assignee" },
    { key: "detectedAt",header: "Detected", render: (i) => formatDate(i.detectedAt) },
    { key: "actions", header: "",
      render: (i) => (
        <div className="flex gap-2 justify-end">
          {i.status !== "RESOLVED" && (
            <>
              <button
                className="btn-secondary text-xs"
                onClick={async (e) => {
                  e.stopPropagation();
                  const a = window.prompt("Assign to (username)") ?? "";
                  if (!a) return;
                  await dataQualityApi.assign(i.id, a);
                  toast.success("Assigned");
                  qc.invalidateQueries({ queryKey: ["dq-issues"] });
                }}
              >Assign</button>
              <button
                className="btn-primary text-xs"
                onClick={async (e) => {
                  e.stopPropagation();
                  await dataQualityApi.resolve(i.id);
                  toast.success("Resolved");
                  qc.invalidateQueries({ queryKey: ["dq-issues"] });
                  qc.invalidateQueries({ queryKey: ["dq-summary"] });
                }}
              >Resolve</button>
            </>
          )}
        </div>
      ) },
  ];

  // Issue type breakdown for the pie chart
  const breakdown = (issues.data?.content ?? []).reduce<Record<string, number>>((acc, i) => {
    const k = i.issueType ?? "OTHER";
    acc[k] = (acc[k] ?? 0) + (i.recordCount ?? 0);
    return acc;
  }, {});
  const pieData = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  const COLORS = ["#1e40af", "#dc2626", "#10b981", "#f59e0b", "#8b5cf6", "#0ea5e9"];

  const s = summary.data ?? { totalIssues: 0, openIssues: 0, resolvedIssues: 0, dataQualityScore: 0 };

  return (
    <>
      <PageTitle title="Data Quality Dashboard" subtitle="Quality score, open issues and remediation workflow" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard tone="good" title="Quality score" value={`${s.dataQualityScore}%`} icon={Gauge} />
        <StatCard tone="bad"  title="Open issues"   value={String(s.openIssues)}      icon={AlertOctagon} />
        <StatCard tone="info" title="Total issues"  value={String(s.totalIssues)}     icon={Database} />
        <StatCard tone="good" title="Resolved"      value={String(s.resolvedIssues)}  icon={ShieldCheck} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <ChartCard title="Issues by type" subtitle="Distribution of open data-quality issues">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="lg:col-span-2 card-pad">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-700">Open issue queue</div>
            <select className="input w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option>OPEN</option><option>ASSIGNED</option><option>RESOLVED</option>
            </select>
          </div>
          <DataTable<DataQualityIssue>
            columns={cols}
            rows={issues.data?.content ?? []}
            rowKey={(i) => String(i.id)}
            loading={issues.isLoading}
          />
        </div>
      </div>
    </>
  );
}
