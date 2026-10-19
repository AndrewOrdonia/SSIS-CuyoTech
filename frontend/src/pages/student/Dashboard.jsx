import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, CreditCard, ClipboardCheck } from "lucide-react";
import api from "../../services/api";
import { StatCard, Card } from "../../components/ui/Card";

const typeStyles = {
  document: { icon: FileText, box: "bg-amber-50 text-amber-600 border-amber-100" },
  grade: { icon: BookOpen, box: "bg-blue-50 text-blue-900 border-blue-100" },
  clearance: { icon: ClipboardCheck, box: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  payment: { icon: CreditCard, box: "bg-blue-50 text-blue-900 border-blue-100" },
};

const toneText = {
  amber: "text-amber-600 font-medium",
  blue: "text-blue-600 font-medium",
  emerald: "text-emerald-600 font-medium",
  red: "text-red-600 font-medium",
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
<div>
<div className="mb-6">
<h1 className="text-2xl font-bold text-gray-800">
Welcome back, {user.name}!
</h1>
<p className="text-sm text-gray-500 mt-1">
Here's your academic overview and current service status.
</p>
</div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <button
      type="button"
      onClick={() => navigate("/student/subjects")}
      className="text-left rounded-xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
    >
      <StatCard
        icon={BookOpen}
        title="Enrolled Subjects"
        value={stats ? String(stats.enrolled_subjects) : "-"}
        color="bg-blue-900"
      />
    </button>

    <button
      type="button"
      onClick={() => navigate("/student/documents")}
      className="text-left rounded-xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
    >
      <StatCard
        icon={FileText}
        title="Pending Documents"
        value={stats ? String(stats.pending_documents) : "-"}
        color="bg-amber-500"
      />
    </button>

    <button
      type="button"
      onClick={() => navigate("/student/balance")}
      className="text-left rounded-xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
    >
      <StatCard
        icon={CreditCard}
        title="Outstanding Balance"
        value={
          stats
            ? `P${Number(stats.outstanding_balance).toLocaleString("en-PH")}`
            : "-"
        }
        color="bg-red-500"
      />
    </button>

    <StatCard
      icon={ClipboardCheck}
      title="Clearance"
      value={stats ? stats.clearance : "-"}
      color="bg-emerald-500"
    />
  </div>

  <Card className="mt-6">
    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
      <h2 className="font-bold text-gray-800 text-base">Recent Activity</h2>
      <span className="text-xs text-gray-400 font-medium">
        Latest updates
      </span>
    </div>

    <div className="divide-y divide-gray-100">
      {activity.length === 0 && (
        <p className="py-6 text-center text-sm text-gray-400">
          No recent activity yet.
        </p>
      )}

      {activity.map((a, i) => {
        const style = typeStyles[a.type] || typeStyles.document;
        const Icon = style.icon;

        return (
          <div key={i} className="py-3 flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${style.box}`}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">
                {a.title}
              </p>
              <p className={`text-xs ${toneText[a.tone] || toneText.gray}`}>
                {a.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </Card>
</div>

);
}