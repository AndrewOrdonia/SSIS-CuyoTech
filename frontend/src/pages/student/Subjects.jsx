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
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Subjects</h1>
        <Card className="flex items-center justify-center py-16 text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading subjects...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Subjects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.length === 0 && (
          <Card className="col-span-full py-12 text-center text-gray-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <Library className="w-8 h-8 text-gray-300" />
              <p className="font-medium text-gray-600">No subjects enrolled</p>
              <p className="text-xs text-gray-400">Enrolled subjects for the current academic term will be displayed here.</p>
            </div>
          </Card>
        )}
        {subjects.map((s) => (
          <Card key={s.id} className="transition-all hover:shadow-md hover:border-blue-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  {s.code}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {s.units} units
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-base leading-snug">{s.title}</h3>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{s.schedule || "Schedule TBA"}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}