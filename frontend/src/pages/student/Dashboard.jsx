import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, CreditCard, ClipboardCheck } from "lucide-react";
import api from "../../services/api";
import { StatCard, Card } from "../../components/ui/Card";

const typeStyles = {
  document: { icon: FileText, box: "bg-amber-50 text-amber-700 border-amber-200/80" },
  grade: { icon: BookOpen, box: "bg-teal-50 text-[#205247] border-teal-200/80" },
  clearance: { icon: ClipboardCheck, box: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  payment: { icon: CreditCard, box: "bg-sky-50 text-sky-700 border-sky-200/80" },
};

const toneText = {
  amber: "text-amber-700 font-medium",
  blue: "text-[#205247] font-medium",
  emerald: "text-emerald-700 font-medium",
  red: "text-rose-700 font-medium",
  gray: "text-gray-500",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/student/dashboard")
      .then(({ data }) => setSummary(data))
      .catch(() => {});
  }, []);

  const stats = summary?.stats;
  const activity = summary?.activity ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {user.name || "Student"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Here is your academic overview and university service status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => navigate("/student/subjects")}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#205247]"
        >
          <StatCard
            icon={BookOpen}
            title="Enrolled Subjects"
            value={stats ? String(stats.enrolled_subjects) : "—"}
            color="bg-[#153a33]"
          />
        </button>

        <button
          type="button"
          onClick={() => navigate("/student/documents")}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <StatCard
            icon={FileText}
            title="Pending Documents"
            value={stats ? String(stats.pending_documents) : "—"}
            color="bg-amber-600"
          />
        </button>

        <button
          type="button"
          onClick={() => navigate("/student/balance")}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <StatCard
            icon={CreditCard}
            title="Outstanding Balance"
            value={
              stats
                ? `₱${Number(stats.outstanding_balance).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "—"
            }
            color="bg-rose-600"
          />
        </button>

        <div className="text-left">
          <StatCard
            icon={ClipboardCheck}
            title="Clearance Status"
            value={stats ? stats.clearance : "—"}
            color="bg-emerald-600"
          />
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
            <p className="mt-0.5 text-xs text-gray-400">Chronological notifications and status updates</p>
          </div>
          <span className="text-[11px] font-medium text-gray-400">Live feed</span>
        </div>

        <div className="divide-y divide-gray-100">
          {activity.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">
              No recent activity recorded.
            </p>
          ) : (
            activity.map((a, i) => {
              const style = typeStyles[a.type] || typeStyles.document;
              const Icon = style.icon;

              return (
                <div key={i} className="flex items-start gap-3 py-3 transition hover:bg-gray-50/50 rounded-lg px-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${style.box} mt-0.5`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {a.title}
                    </p>
                    <p className={`mt-0.5 text-xs ${toneText[a.tone] || toneText.gray}`}>
                      {a.subtitle}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
