import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Notice from "../../components/ui/Notice";
import StudentPicker from "../../components/ui/StudentPicker";

export default function Enrollment() {
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [checked, setChecked] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "error", text: "" });

  useEffect(() => {
    api.get("/courses").then(({ data }) => setCourses(data.data ?? data)).catch(() => {});
  }, []);

  const loadEnrollments = (s) =>
    api.get(`/registrar/students/${s.id}/enrollments`)
      .then(({ data }) => setEnrollments(data.enrollments))
      .catch((err) => setNotice({ type: "error", text: getErrorMessage(err) }));

  const pickStudent = (s) => {
    setStudent(s);
    setChecked([]);
    setNotice({ type: "error", text: "" });
    loadEnrollments(s);
  };

  const current = enrollments.filter((e) => e.is_current);
  const enrolledCourseIds = current.map((e) => e.course.id);
  const available = courses.filter((c) => !enrolledCourseIds.includes(c.id));
  const totalUnits = current.reduce((sum, e) => sum + e.course.units, 0);

  const toggle = (id) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleEnroll = async () => {
    if (!student || checked.length === 0) return;
    setBusy(true);
    try {
      const { data } = await api.post("/enrollment", { student_id: student.id, course_ids: checked });
      setNotice({ type: "success", text: data.message });
      setChecked([]);
      await loadEnrollments(student);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (e) => {
    if (!window.confirm(`Remove ${e.course.code} from ${student.name}?`)) return;
    try {
      await api.delete(`/enrollment/${e.id}`);
      setNotice({ type: "success", text: `${e.course.code} removed.` });
      await loadEnrollments(student);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Enrollment</h1>

      <Notice type={notice.type}>{notice.text}</Notice>

      <StudentPicker selectedId={student?.id} onSelect={pickStudent} />

      {student && (
        <>
          <Card className="mb-6 overflow-hidden p-0 border border-gray-200/80">
            <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">2</span>
                Current Enrollment &mdash; {student.name}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                {totalUnits} units
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Course Code</th>
                    <th className="py-3.5 px-4 font-semibold">Descriptive Title</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Units</th>
                    <th className="py-3.5 px-4 font-semibold">Schedule</th>
                    <th className="py-3.5 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {current.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-gray-400 text-sm">Not enrolled in any subject this term.</td>
                    </tr>
                  )}
                  {current.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-blue-900 font-mono text-sm">{e.course.code}</td>
                      <td className="py-3.5 px-4 text-gray-800 font-medium">{e.course.title}</td>
                      <td className="py-3.5 px-4 text-gray-600 text-center">{e.course.units}</td>
                      <td className="py-3.5 px-4 text-gray-600">{e.schedule || "TBA"}</td>
                      <td className="py-3.5 px-4 text-right">
                        {e.grade === null && (
                          <button
                            onClick={() => handleRemove(e)}
                            className="text-red-500 hover:text-red-700 p-1 rounded cursor-pointer"
                            title="Remove subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="mb-6 border border-gray-200/80">
            <h2 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">3</span>
              Add Subjects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {available.length === 0 && <p className="text-gray-400 text-sm py-2">No more subjects available this term.</p>}
              {available.map((c) => {
                const isChecked = checked.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                      isChecked ? "border-blue-900 bg-blue-50/50 ring-1 ring-blue-900/20" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <input type="checkbox" checked={isChecked} onChange={() => toggle(c.id)} className="mt-1 accent-blue-900" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm leading-tight">
                        <span className="font-mono text-blue-900">{c.code}</span> &mdash; {c.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{c.units} units &middot; {c.schedule || "TBA"}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleEnroll}
                disabled={busy || checked.length === 0}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {busy ? "Enrolling..." : `Enroll Selected (${checked.length})`}
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
