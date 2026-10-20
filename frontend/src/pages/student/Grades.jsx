import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";

export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/grades")
      .then(({ data }) => setGrades(data.data ?? data))
      .catch(() => setGrades([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic Grades</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">Official student grade evaluation.</p>
        </div>
        <Card className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#153a33]/20 border-t-[#153a33] mb-3" />
          <p className="text-xs font-medium text-gray-500">Loading grade records…</p>
        </Card>
      </div>
    );
  }

  const totalUnits = grades.reduce((sum, g) => sum + (Number(g.course?.units) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic Grades</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Official term evaluation and submitted subject marks.
          </p>
        </div>
        {grades.length > 0 && (
          <span className="inline-flex items-center self-start sm:self-auto rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-xs">
            Total Evaluated Units: <strong className="ml-1 text-gray-900">{totalUnits}</strong>
          </span>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="portal-table-wrap">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Course Code</th>
                <th className="px-5 py-3.5">Descriptive Title</th>
                <th className="px-5 py-3.5 text-center">Units</th>
                <th className="px-5 py-3.5 text-right">Final Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GraduationCap className="h-8 w-8 text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">No grades recorded yet</p>
                      <p className="text-[11px] text-gray-400">
                        Official grades will appear here once submitted by your instructors.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#153a33]">
                      {g.course?.code}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {g.course?.title}
                    </td>
                    <td className="px-5 py-3.5 text-center text-gray-600">
                      {g.course?.units}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center justify-center rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 font-mono text-xs font-bold text-[#153a33]">
                        {g.grade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
