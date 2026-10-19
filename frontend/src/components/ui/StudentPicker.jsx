import { useEffect, useState } from "react";
import { Check, Search, UsersRound } from "lucide-react";
import api from "../../services/api";
import { Card } from "./Card";

export default function StudentPicker({ selectedId, onSelect, step = 1, title = "Select Student" }) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      api.get("/students", { params: { search } })
        .then(({ data }) => { if (active) setStudents(data.data ?? data); })
        .catch(() => { if (active) setStudents([]); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);

  return (
    <Card className="mb-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-3 text-base font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-xs font-bold text-white">{step}</span>
          {title}
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
          <UsersRound className="h-3.5 w-3.5" /> Search the student directory
        </span>
      </div>
      <label className="relative mb-4 block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or student number"
          aria-label="Search students by name or student number"
          className="w-full pl-10 pr-3 py-2.5 text-sm outline-none transition"
        />
      </label>
      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-5 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-900/25 border-t-blue-900" /> Searching students…
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-7 text-center">
          <UsersRound className="mx-auto h-5 w-5 text-gray-400" />
          <p className="mt-2 text-sm font-semibold text-gray-700">No students found</p>
          <p className="mt-1 text-xs text-gray-500">Try another name or student number.</p>
        </div>
      ) : (
        <div className="grid max-h-72 grid-cols-1 gap-2.5 overflow-y-auto sm:grid-cols-2">
          {students.map((student) => {
            const isSelected = selectedId === student.id;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelect(student)}
                aria-pressed={isSelected}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition ${
                  isSelected
                    ? "border-blue-900 bg-blue-50 shadow-[0_0_0_2px_rgba(21,58,51,0.08)]"
                    : "border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isSelected ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {student.name?.[0]?.toUpperCase() || "S"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-800">{student.name}</span>
                    <span className="mt-1 block truncate text-[11px] text-gray-500">
                      <span className="font-mono">{student.student_no}</span>{student.program ? ` · ${student.program}` : ""}
                    </span>
                  </span>
                </span>
                {isSelected && <Check className="h-[18px] w-[18px] shrink-0 text-blue-900" />}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
