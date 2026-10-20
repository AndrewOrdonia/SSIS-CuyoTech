import { useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Notice from "../../components/ui/Notice";
import StudentPicker from "../../components/ui/StudentPicker";

const GRADE_OPTIONS = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 5];

export default function GradesEncoding() {
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [notice, setNotice] = useState({ type: "error", text: "" });

  const load = (s) =>
    api.get(`/registrar/students/${s.id}/enrollments`)
      .then(({ data }) => setEnrollments(data.enrollments))
      .catch((err) => setNotice({ type: "error", text: getErrorMessage(err) }));

  const pickStudent = (s) => {
    setStudent(s);
    setEdits({});
    setNotice({ type: "error", text: "" });
    load(s);
  };

  const save = async (e) => {
    const value = edits[e.id];
    if (value === undefined || value === "") return;
    setSavingId(e.id);
    try {
      await api.post("/grades", { student_id: student.id, course_id: e.course.id, grade: Number(value) });
      setNotice({ type: "success", text: `Grade saved for ${e.course.code}.` });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[e.id];
        return next;
      });
      await load(student);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Grades Encoding</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Enter official grading marks for enrolled subjects.
        </p>
      </div>

      <Notice type={notice.type}>{notice.text}</Notice>

      <StudentPicker selectedId={student?.id} onSelect={pickStudent} step={1} title="Select Student" />

      {student && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-gray-100 p-5">
            <h2 className="flex items-center gap-2.5 text-sm font-bold text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#153a33] text-xs font-bold text-white">
                2
              </span>
              Encode Grades · <span className="text-[#153a33]">{student.name}</span>
            </h2>
          </div>

          <div className="portal-table-wrap">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3.5">Course Code</th>
                  <th className="px-5 py-3.5">Descriptive Title</th>
                  <th className="px-5 py-3.5">Term</th>
                  <th className="px-5 py-3.5 text-center">Units</th>
                  <th className="px-5 py-3.5">Final Mark</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-xs text-gray-400">
                      This student has no enrolled subjects for this term.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e) => {
                    const value = edits[e.id] ?? (e.grade === null ? "" : String(e.grade));
                    const dirty = edits[e.id] !== undefined && edits[e.id] !== "";
                    const isSaving = savingId === e.id;

                    return (
                      <tr key={e.id} className="transition-colors hover:bg-gray-50/60">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#153a33]">
                          {e.course.code}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-800">
                          {e.course.title}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {e.term}
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-600">
                          {e.course.units}
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={value}
                            onChange={(ev) => setEdits({ ...edits, [e.id]: ev.target.value })}
                            className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 font-mono text-xs text-gray-900 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
                          >
                            <option value="">— Unassigned —</option>
                            {GRADE_OPTIONS.map((g) => (
                              <option key={g} value={String(g)}>
                                {g.toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => save(e)}
                            disabled={!dirty || isSaving}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-[#153a33] px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#102d28] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isSaving ? "Saving…" : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
