import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import Modal from "../components/common/Modal";
import { reportApi } from "../services";
import { CalendarClock, Download, FileBarChart2 } from "lucide-react";

interface ReportDef { id: string; name: string; category: string; description: string; format: string; }

export default function ReportLibraryPage() {
  const [scheduleOpen, setScheduleOpen] = useState<ReportDef | null>(null);
  const [cron, setCron] = useState("0 9 * * *");
  const [recipients, setRecipients] = useState("compliance@bank.local");

  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: reportApi.list as () => Promise<ReportDef[]>,
    placeholderData: [
      { id: "RPT-AML-001", name: "AML Daily Alert Summary", category: "AML", description: "Daily alert summary by branch and rule", format: "PDF/CSV" },
      { id: "RPT-AML-002", name: "STR Filing Register",     category: "AML", description: "STRs filed with FIU within the period", format: "PDF/CSV" },
      { id: "RPT-AML-003", name: "CTR Filing Register",     category: "AML", description: "Cash transactions reported to FIU",     format: "PDF/CSV" },
      { id: "RPT-DQ-001",  name: "Data Quality Scorecard",  category: "Governance", description: "DQ score per domain",             format: "PDF" },
      { id: "RPT-LOS-001", name: "Loan Risk Distribution",  category: "Risk", description: "Risk across AL/ML/CC/PL",                format: "PDF" },
      { id: "RPT-AUD-001", name: "User Activity Audit",     category: "Audit", description: "User activity in selected period",     format: "CSV" },
    ],
  });

  const generate = async (r: ReportDef) => {
    try {
      await reportApi.generate({ reportId: r.id, parameters: {} });
      toast.success(`${r.name} queued`);
    } catch {
      toast.error("Backend unreachable");
    }
  };

  const submitSchedule = async () => {
    if (!scheduleOpen) return;
    try {
      await reportApi.schedule({ reportId: scheduleOpen.id, cron, recipients });
      toast.success("Schedule saved");
      setScheduleOpen(null);
    } catch {
      toast.error("Backend unreachable");
    }
  };

  // Group by category
  const groups = (data ?? []).reduce<Record<string, ReportDef[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r); return acc;
  }, {});

  return (
    <>
      <PageTitle title="Reports & Dashboards" subtitle="Catalogue of reports — generate on demand or schedule" />

      <div className="space-y-6">
        {Object.entries(groups).map(([cat, list]) => (
          <div key={cat}>
            <div className="text-sm font-semibold text-slate-700 mb-2">{cat}</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((r) => (
                <div key={r.id} className="card-pad flex flex-col">
                  <div className="flex items-center gap-2 text-bank-500">
                    <FileBarChart2 className="h-4 w-4" />
                    <div className="text-xs uppercase tracking-wider font-semibold">{r.id}</div>
                  </div>
                  <div className="font-semibold text-slate-800 mt-1">{r.name}</div>
                  <p className="text-sm text-slate-600 mt-1 flex-1">{r.description}</p>
                  <div className="text-xs text-slate-500 mt-2">Format: {r.format}</div>
                  <div className="flex gap-2 mt-3">
                    <button className="btn-primary flex-1" onClick={() => generate(r)}>
                      <Download className="h-4 w-4" /> Generate
                    </button>
                    <button className="btn-secondary" onClick={() => setScheduleOpen(r)}>
                      <CalendarClock className="h-4 w-4" />
                    </button>
                    <a className="btn-secondary" href={reportApi.exportUrl(r.id)} target="_blank">Export</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(scheduleOpen)}
        onClose={() => setScheduleOpen(null)}
        title={`Schedule ${scheduleOpen?.name}`}
        footer={<>
          <button className="btn-secondary" onClick={() => setScheduleOpen(null)}>Cancel</button>
          <button className="btn-primary" onClick={submitSchedule}>Save schedule</button>
        </>}
      >
        <div className="space-y-3">
          <div>
            <label className="label">Cron expression</label>
            <input className="input" value={cron} onChange={(e) => setCron(e.target.value)} />
            <div className="text-xs text-slate-500 mt-1">Default: every day at 09:00</div>
          </div>
          <div>
            <label className="label">Recipients (comma-separated)</label>
            <input className="input" value={recipients} onChange={(e) => setRecipients(e.target.value)} />
          </div>
        </div>
      </Modal>
    </>
  );
}
