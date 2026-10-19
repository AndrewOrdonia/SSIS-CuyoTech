import { useEffect, useState } from "react";
import { AtSign, Calendar, GraduationCap, Hash, User } from "lucide-react";
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
    { label: "Full name", value: user.name, icon: User },
    { label: "Username", value: user.username, icon: AtSign },
    { label: "Student number", value: studentNo, icon: Hash, accent: "gold" },
    { label: "Program", value: program, icon: GraduationCap },
    { label: "Year level", value: yearLevel, icon: Calendar, wide: true },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="mt-2 text-sm text-gray-500">Your personal and academic information.</p>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="relative flex flex-col items-center gap-5 overflow-hidden bg-[#153a33] p-6 text-white sm:flex-row sm:items-start sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 border-l border-white/[0.07]" />
          <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.08] text-3xl font-semibold text-[#f0d990]">
            {user.name?.[0]?.toUpperCase() || "S"}
          </div>
          <div className="relative flex-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Student account</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">{user.name || "Student"}</h2>
            <p className="mt-1 text-sm text-white/65">{program || "Program information unavailable"}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {studentNo && <span className="rounded-md border border-white/15 bg-white/[0.07] px-2.5 py-1 font-mono text-xs text-white/90">{studentNo}</span>}
              <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Active student
              </span>
            </div>
          </div>
          <div className="relative hidden h-12 w-12 items-center justify-center rounded-xl border border-[#dfc16e]/20 bg-[#dfc16e]/10 text-[#dfc16e] sm:flex">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>
        <div className="p-5 sm:p-8">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-800">Academic & account details</h3>
            <p className="mt-1 text-xs text-gray-500">Information associated with your university account.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon, accent, wide }) => (
              <div key={label} className={`flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 ${wide ? "sm:col-span-2" : ""}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${accent === "gold" ? "border-amber-100 bg-amber-50 text-amber-700" : "border-blue-100 bg-blue-50 text-blue-900"}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-gray-800">{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
