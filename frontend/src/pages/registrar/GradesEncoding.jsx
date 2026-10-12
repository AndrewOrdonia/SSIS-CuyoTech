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
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Grades Encoding</h1>

      <Notice type={notice.type}>{notice.text}</Notice>

      <StudentPicker selectedId={student?.id} onSelect={pickStudent} />

      {student && (
        <Card className="overflow-hidden p-0 border border-gray-200/80">
          <div className="p-5 pb-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              Encode Grades &mdash; {student.name}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Course Code</th>
                  <th className="py-3.5 px-4 font-semibold">Descriptive Title</th>
                  <th className="py-3.5 px-4 font-semibold">Term</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Units</th>
                  <th className="py-3.5 px-4 font-semibold">Final Grade</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-gray-400 text-sm">This student has no enrolled subjects.</td>
                  </tr>
                )}
                {enrollments.map((e) => {
                  const value = edits[e.id] ?? (e.grade === null ? "" : String(e.grade));
                  const dirty = edits[e.id] !== undefined && edits[e.id] !== "";
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-blue-900 font-mono text-sm">{e.course.code}</td>
                      <td className="py-3.5 px-4 text-gray-800 font-medium">{e.course.title}</td>
                      <td className="py-3.5 px-4 text-gray-600 text-xs">{e.term}</td>
                      <td className="py-3.5 px-4 text-gray-600 text-center">{e.course.units}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={value}
                          onChange={(ev) => setEdits({ ...edits, [e.id]: ev.target.value })}
                          className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">&mdash;</option>
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={String(g)}>{g.toFixed(2)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => save(e)}
                          disabled={!dirty || savingId === e.id}
                          className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          {savingId === e.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
