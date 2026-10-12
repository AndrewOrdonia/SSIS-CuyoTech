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
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Grades</h1>
        <Card className="flex items-center justify-center py-16 text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading grades...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Grades</h1>
      <Card className="overflow-hidden p-0 border border-gray-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Course Code</th>
                <th className="py-3.5 px-4 font-semibold">Descriptive Title</th>
                <th className="py-3.5 px-4 font-semibold text-center">Units</th>
                <th className="py-3.5 px-4 font-semibold text-right">Final Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GraduationCap className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-600">No grades recorded yet</p>
                      <p className="text-xs text-gray-400">Official grades will appear here once submitted by instructors.</p>
                    </div>
                  </td>
                </tr>
              )}
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-blue-900 font-mono text-sm">{g.course?.code}</td>
                  <td className="py-3.5 px-4 text-gray-800 font-medium">{g.course?.title}</td>
                  <td className="py-3.5 px-4 text-gray-600 text-center">{g.course?.units}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 font-mono">
                      {g.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}