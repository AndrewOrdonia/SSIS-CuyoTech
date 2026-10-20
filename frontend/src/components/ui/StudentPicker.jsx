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
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2.5 text-sm font-bold text-gray-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#153a33] text-xs font-bold text-white">
            {step}
          </span>
          {title}
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
          <UsersRound className="h-3.5 w-3.5" /> Search directory
        </span>
      </div>

      <label className="relative mb-3.5 block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name or ID number…"
          aria-label="Search students by name or student number"
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-xs sm:text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
        />
      </label>

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/70 py-6 text-xs text-gray-500">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#153a33]/25 border-t-[#153a33]" />
          Searching directory…
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 py-7 text-center">
          <UsersRound className="mx-auto h-5 w-5 text-gray-400" />
          <p className="mt-2 text-xs font-semibold text-gray-700">No students found</p>
          <p className="mt-0.5 text-[11px] text-gray-400">Try searching with a different name or ID.</p>
        </div>
      ) : (
        <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {students.map((student) => {
            const isSelected = selectedId === student.id;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelect(student)}
                aria-pressed={isSelected}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-[#205247] bg-[#eef5f3]/80 shadow-xs ring-1 ring-[#205247]"
                    : "border-gray-200/90 bg-white hover:border-gray-300 hover:bg-gray-50/80"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isSelected ? "bg-[#153a33] text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {student.name?.[0]?.toUpperCase() || "S"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-gray-900">{student.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-gray-500">
                      <span className="font-mono">{student.student_no}</span>
                      {student.program ? ` · ${student.program}` : ""}
                    </span>
                  </span>
                </span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-[#205247]" />}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
