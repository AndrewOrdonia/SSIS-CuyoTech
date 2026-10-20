import { useEffect, useState } from "react";
import { Clock, Library } from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/subjects")
      .then(({ data }) => setSubjects(data.data ?? data))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Enrolled Subjects</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">Your current class schedule and course list.</p>
        </div>
        <Card className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#153a33]/20 border-t-[#153a33] mb-3" />
          <p className="text-xs font-medium text-gray-500">Loading course schedule…</p>
        </Card>
      </div>
    );
  }

  const totalUnits = subjects.reduce((sum, s) => sum + (Number(s.units) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Enrolled Subjects</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Current academic term enrollments and weekly class schedule.
          </p>
        </div>
        {subjects.length > 0 && (
          <span className="inline-flex items-center self-start sm:self-auto rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-xs">
            Total Enrolled Units: <strong className="ml-1 text-gray-900">{totalUnits}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {subjects.length === 0 ? (
          <Card className="col-span-full py-14 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Library className="h-8 w-8 text-gray-300" />
              <p className="text-xs font-semibold text-gray-700">No subjects currently enrolled</p>
              <p className="text-[11px] text-gray-400">
                Subjects for the ongoing academic term will appear once confirmed by the registrar.
              </p>
            </div>
          </Card>
        ) : (
          subjects.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col justify-between transition-all duration-150 hover:border-gray-300 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-md border border-[#153a33]/20 bg-[#eef5f3] px-2.5 py-1 font-mono text-xs font-bold text-[#153a33]">
                    {s.code}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                    {s.units} units
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                  {s.title}
                </h3>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{s.schedule || "Schedule to be announced"}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
