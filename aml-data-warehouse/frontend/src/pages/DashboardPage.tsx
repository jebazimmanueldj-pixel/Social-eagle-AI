import { useQuery } from "@tanstack/react-query";
import {
  Activity, AlertTriangle, Banknote, CreditCard, Database,
  FileWarning, Gauge, MoonStar, ShieldAlert, ShieldX, Users,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import PageTitle from "../components/common/PageTitle";
import StatCard from "../components/common/StatCard";
import ChartCard from "../components/charts/ChartCard";
import { dashboardApi } from "../services";
import {
  mockSummary, mockAlertTrend, mockStrTrend,
  mockBranchAlerts, mockProductRisk, mockDqTrend,
} from "../mock-data";
import { formatNumber } from "../utils/format";

export default function DashboardPage() {
  const summary = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardApi.summary,
    placeholderData: mockSummary,
  });
  const alertTrend = useQuery({
    queryKey: ["dashboard", "alertTrend"],
    queryFn: dashboardApi.alertTrend,
    placeholderData: mockAlertTrend,
  });
  const strTrend = useQuery({
    queryKey: ["dashboard", "strTrend"],
    queryFn: dashboardApi.strTrend,
    placeholderData: mockStrTrend,
  });
  const branchAlerts = useQuery({
    queryKey: ["dashboard", "branchAlerts"],
    queryFn: dashboardApi.branchAlerts,
    placeholderData: mockBranchAlerts,
  });
  const dqScore = useQuery({
    queryKey: ["dashboard", "dq"],
    queryFn: dashboardApi.dataQualityScore,
    placeholderData: mockDqTrend,
  });

  const s = summary.data ?? mockSummary;

  return (
    <>
      <PageTitle
        title="AML Warehouse Dashboard"
        subtitle="Real-time view of AML, compliance and data-warehouse health"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <StatCard tone="info"    title="Total Customers"    value={formatNumber(s.totalCustomers)}    icon={Users} />
        <StatCard tone="info"    title="Total Accounts"     value={formatNumber(s.totalAccounts)}     icon={CreditCard} />
        <StatCard tone="neutral" title="Total Transactions" value={formatNumber(s.totalTransactions)} icon={Activity} />
        <StatCard tone="warn"    title="Positive Alerts"    value={formatNumber(s.positiveAlerts)}    icon={ShieldAlert} hint="Threshold breaches" />
        <StatCard tone="neutral" title="Negative Alerts"    value={formatNumber(s.negativeAlerts)}    icon={ShieldX}      hint="Closed false-positives" />
        <StatCard tone="bad"     title="STR Generated"      value={formatNumber(s.strGenerated)}      icon={FileWarning} />
        <StatCard tone="bad"     title="CTR Generated"      value={formatNumber(s.ctrGenerated)}      icon={Banknote} />
        <StatCard tone="warn"    title="Dormant Accounts"   value={formatNumber(s.dormantAccounts)}   icon={MoonStar} />
        <StatCard tone="bad"     title="High-Risk Customers"value={formatNumber(s.highRiskCustomers)} icon={AlertTriangle} />
        <StatCard tone="bad"     title="Failed ETL Jobs"    value={formatNumber(s.failedEtlJobs)}     icon={Database} />
        <StatCard tone="good"    title="Data Quality Score" value={`${s.dataQualityScore}%`}          icon={Gauge}    hint="Across all governed tables" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <ChartCard title="Alert Trend" subtitle="Monthly alert volume">
          <ResponsiveContainer>
            <LineChart data={alertTrend.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="STR Trend" subtitle="Suspicious Transaction Reports filed per month">
          <ResponsiveContainer>
            <LineChart data={strTrend.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Branch-wise Alerts" subtitle="Alert volume per branch">
          <ResponsiveContainer>
            <BarChart data={branchAlerts.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {(branchAlerts.data ?? []).map((_, i) => (
                  <Cell key={i} fill={`hsl(${(i * 28 + 200) % 360}, 60%, 55%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product-wise Risk" subtitle="Open alerts grouped by product line">
          <ResponsiveContainer>
            <BarChart data={mockProductRisk}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Data Quality Trend" subtitle="Trailing 12 weeks (higher is better)" >
          <ResponsiveContainer>
            <LineChart data={dqScore.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[80, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
