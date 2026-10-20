import { useEffect, useState } from "react";
import { AtSign, Calendar, GraduationCap, Hash, User, ShieldCheck } from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { ordinal } from "../../utils/format";

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/student/profile").then(({ data }) => setProfile(data)).catch(() => {});
  }, []);

  const user = { ...stored, ...(profile || {}) };
  const program = profile?.program_name || "";
  const studentNo = profile?.student_no || "";
  const yearLevel = ordinal(profile?.year_level);

  const details = [
    { label: "Full Name", value: user.name, icon: User },
    { label: "Portal Username", value: user.username, icon: AtSign },
    { label: "Student Number", value: studentNo, icon: Hash, accent: "gold" },
    { label: "Academic Program", value: program, icon: GraduationCap },
    { label: "Year Level", value: yearLevel, icon: Calendar, wide: true },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Profile</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Official institutional identity and academic registration details.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="relative flex flex-col items-center gap-5 bg-[#153a33] p-6 text-white sm:flex-row sm:items-start sm:p-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-bold text-[#f0d990]">
            {user.name?.[0]?.toUpperCase() || "S"}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Verified Student</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{user.name || "Student"}</h2>
            <p className="mt-1 text-xs sm:text-sm text-white/70">{program || "Program information unavailable"}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {studentNo && (
                <span className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-xs font-semibold text-white">
                  {studentNo}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Enrolled & Active
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Academic & Account Information</h3>
            <p className="mt-0.5 text-xs text-gray-500">Verified credentials linked to your institutional profile.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon, accent, wide }) => (
              <div
                key={label}
                className={`flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 ${
                  wide ? "sm:col-span-2" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                    accent === "gold"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-teal-200 bg-teal-50 text-[#153a33]"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="mt-0.5 break-words text-xs sm:text-sm font-semibold text-gray-900">
                    {value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
