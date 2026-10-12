import { useEffect, useState } from "react";
import { User, AtSign, Hash, GraduationCap, Calendar } from "lucide-react";
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

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      <Card className="overflow-hidden p-0 border border-gray-200/80">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-3xl font-bold shadow-inner shrink-0">
            {user.name?.[0]?.toUpperCase() || "S"}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-blue-200 text-sm mt-0.5">{program}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {studentNo}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active Student
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Academic & Account Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.name}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
                <AtSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Username</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.username}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Student Number</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{studentNo}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Program</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{program}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start gap-3 sm:col-span-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{yearLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}