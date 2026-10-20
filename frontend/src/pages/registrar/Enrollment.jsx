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
      setNotice({ type: "success", text: `${e.course.code} removed from enrollment.` });
      await loadEnrollments(student);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Enrollment</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Manage subject loads, add courses, and verify term registrations.
        </p>
      </div>

      <Notice type={notice.type}>{notice.text}</Notice>

      <StudentPicker selectedId={student?.id} onSelect={pickStudent} step={1} title="Select Student" />

      {student && (
        <>
          <Card className="overflow-hidden p-0">
            <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2.5 text-sm font-bold text-gray-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#153a33] text-xs font-bold text-white">
                  2
                </span>
                Current Enrollment · <span className="text-[#153a33]">{student.name}</span>
              </h2>
              <span className="self-start sm:self-auto rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                Total Load: <strong className="ml-1 text-gray-900">{totalUnits} units</strong>
              </span>
            </div>

            <div className="portal-table-wrap">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-3.5">Course Code</th>
                    <th className="px-5 py-3.5">Descriptive Title</th>
                    <th className="px-5 py-3.5 text-center">Units</th>
                    <th className="px-5 py-3.5">Schedule</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {current.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-xs text-gray-400">
                        Not currently enrolled in any subject this term.
                      </td>
                    </tr>
                  ) : (
                    current.map((e) => (
                      <tr key={e.id} className="transition-colors hover:bg-gray-50/60">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#153a33]">
                          {e.course.code}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-800">
                          {e.course.title}
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-600">
                          {e.course.units}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {e.schedule || "TBA"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {e.grade === null && (
                            <button
                              type="button"
                              onClick={() => handleRemove(e)}
                              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                              title="Drop subject"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#153a33] text-xs font-bold text-white">
                3
              </span>
              Available Subjects to Enroll
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {available.length === 0 && (
                <p className="col-span-full py-4 text-xs text-gray-400">
                  No additional courses available for this term.
                </p>
              )}
              {available.map((c) => {
                const isChecked = checked.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all cursor-pointer ${
                      isChecked
                        ? "border-[#205247] bg-[#eef5f3]/80 shadow-xs ring-1 ring-[#205247]"
                        : "border-gray-200/90 bg-white hover:border-gray-300 hover:bg-gray-50/70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(c.id)}
                      className="mt-1 h-4 w-4 rounded accent-[#153a33]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                        <span className="font-mono text-[#153a33]">{c.code}</span> — {c.title}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {c.units} units · {c.schedule || "Schedule TBA"}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={handleEnroll}
                disabled={busy || checked.length === 0}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#153a33] px-5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#102d28] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Enrolling…" : `Confirm Enrollment (${checked.length} selected)`}
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
