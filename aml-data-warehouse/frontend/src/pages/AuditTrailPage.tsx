import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageTitle from "../components/common/PageTitle";
import FilterPanel from "../components/common/FilterPanel";
import AuditTimeline from "../components/common/AuditTimeline";
import { auditApi } from "../services";
import { mockAudit } from "../mock-data";

export default function AuditTrailPage() {
  const [user, setUser] = useState("");
  const [moduleName, setModuleName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit", user, moduleName],
    queryFn: () =>
      user      ? auditApi.byUser(user, { size: 100 })
      : moduleName ? auditApi.byModule(moduleName, { size: 100 })
      : auditApi.all({ size: 100 }),
    placeholderData: { content: mockAudit, page: 0, size: 100, totalElements: mockAudit.length, totalPages: 1, last: true },
  });

  return (
    <>
      <PageTitle
        title="Audit Trail"
        subtitle="User activity, query execution, report download, STR / alert / access changes"
      />

      <FilterPanel onClear={() => { setUser(""); setModuleName(""); }}>
        <div><label className="label">User</label>
          <input className="input" value={user} onChange={(e) => setUser(e.target.value)} placeholder="username" /></div>
        <div><label className="label">Module</label>
          <select className="input" value={moduleName} onChange={(e) => setModuleName(e.target.value)}>
            <option value="">All</option>
            <option>AUTH</option><option>CUSTOMER</option><option>ACCOUNT</option>
            <option>TRANSACTION</option><option>ALERT</option><option>STR</option>
            <option>CTR</option><option>DORMANT</option><option>CATALOGUE</option>
            <option>AI</option><option>QUERY_BUILDER</option><option>DATA_QUALITY</option>
            <option>ETL</option><option>REPORT</option><option>USER</option>
          </select></div>
      </FilterPanel>

      <div className="mt-4">
        {isLoading
          ? <div className="text-slate-500 p-4">Loading audit trail…</div>
          : <AuditTimeline entries={data?.content ?? []} />}
      </div>
    </>
  );
}
