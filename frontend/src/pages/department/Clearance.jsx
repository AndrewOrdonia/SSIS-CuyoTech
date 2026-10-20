import { useEffect, useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Notice from "../../components/ui/Notice";

export default function Clearance() {
  const [department, setDepartment] = useState("");
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState({ type: "error", text: "" });

  useEffect(() => {
    const t = setTimeout(() => {
      api.get("/clearance", { params: { search } })
        .then(({ data }) => {
          setDepartment(data.department);
          setStudents(data.students);
        })
        .catch((err) => setNotice({ type: "error", text: getErrorMessage(err) }))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, reload]);

  const update = async (s, status) => {
    let remarks = "";
    if (status === "rejected") {
      remarks = window.prompt(`Reason for rejecting clearance for ${s.name}:`) || "";
      if (!remarks.trim()) return;
    }
    try {
      await api.put(`/clearance/${s.id}`, { status, remarks: remarks.trim() || undefined });
      setNotice({ type: "success", text: `${s.name}: clearance status updated to ${status}.` });
      setReload((n) => n + 1);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  const actionBtn = "inline-flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-semibold transition-colors";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {department ? `${department} Clearance` : "Departmental Clearance"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Review, approve, or reject student clearance standing for graduation or enrollment.
        </p>
      </div>

      <Notice type={notice.type}>{notice.text}</Notice>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Student Clearance Roster</h2>
            <p className="mt-0.5 text-xs text-gray-500">Departmental sign-offs</p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or ID…"
              className="h-9 w-64 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-900 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
            />
          </div>
        </div>

        <div className="portal-table-wrap">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Academic Program</th>
                <th className="px-5 py-3.5">Clearance Status</th>
                <th className="px-5 py-3.5">Departmental Remarks</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ClipboardCheck className="h-8 w-8 text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">No students found</p>
                      <p className="text-[11px] text-gray-400">Try modifying your search query.</p>
                    </div>
                  </td>
                </tr>
              )}
              {students.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="font-mono text-[11px] text-gray-500">{s.student_no}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{s.program}</td>
                  <td className="px-5 py-3.5">
                    <Badge status={s.status} />
                  </td>
                  <td className="px-5 py-3.5 max-w-56 truncate text-gray-500" title={s.remarks || ""}>
                    {s.remarks || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {s.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => update(s, "approved")}
                          className={`${actionBtn} bg-emerald-700 text-white hover:bg-emerald-800`}
                        >
                          Approve
                        </button>
                      )}
                      {s.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => update(s, "rejected")}
                          className={`${actionBtn} border border-rose-200 text-rose-700 hover:bg-rose-50`}
                        >
                          Reject
                        </button>
                      )}
                      {s.status !== "pending" && (
                        <button
                          type="button"
                          onClick={() => update(s, "pending")}
                          className={`${actionBtn} border border-gray-200 text-gray-600 hover:bg-gray-100`}
                        >
                          Reset
                        </button>
                      )}
                    </div>
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
