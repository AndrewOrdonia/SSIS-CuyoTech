import { useEffect, useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import { Card } from "./Card";

export default function StudentPicker({ selectedId, onSelect, step = 1, title = "Select Student" }) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      api.get("/students", { params: { search } })
        .then(({ data }) => setStudents(data.data ?? data))
        .catch(() => setStudents([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <Card className="mb-6 border border-gray-200/80">
      <h2 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">{step}</span>
        {title}
      </h2>
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or student number"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
        {loading && <p className="text-gray-400 text-sm py-4">Loading students...</p>}
        {!loading && students.length === 0 && <p className="text-gray-400 text-sm py-4">No students found.</p>}
        {students.map((s) => {
          const isSelected = selectedId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              className={`text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isSelected
                  ? "border-blue-900 bg-blue-50/50 shadow-xs ring-1 ring-blue-900/20"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
              }`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{s.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-mono">{s.student_no}</span> &middot; {s.program}
                </p>
              </div>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
