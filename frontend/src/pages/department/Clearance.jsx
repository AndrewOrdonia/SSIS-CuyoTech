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
      remarks = window.prompt(`Reason for rejecting ${s.name}'s clearance:`) || "";
      if (!remarks.trim()) return;
    }
    try {
      await api.put(`/clearance/${s.id}`, { status, remarks: remarks.trim() || undefined });
      setNotice({ type: "success", text: `${s.name}: clearance ${status}.` });
      setReload((n) => n + 1);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  const btn = "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Clearance</h1>

      <Notice type={notice.type}>{notice.text}</Notice>

      <Card className="overflow-hidden p-0 border border-gray-200/80">
        <div className="p-5 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-gray-800 text-base">{department ? `${department} Clearance` : "Departmental Clearance"}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or student no."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Student</th>
                <th className="py-3.5 px-4 font-semibold">Program</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Remarks</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ClipboardCheck className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-600">No students found</p>
                    </div>
                  </td>
                </tr>
              )}
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{s.student_no}</p>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{s.program}</td>
                  <td className="py-3.5 px-4"><Badge status={s.status} /></td>
                  <td className="py-3.5 px-4 text-gray-500 text-xs max-w-56 truncate" title={s.remarks || ""}>{s.remarks || "—"}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {s.status !== "approved" && (
                        <button onClick={() => update(s, "approved")} className={`${btn} bg-emerald-600 hover:bg-emerald-700 text-white`}>Approve</button>
                      )}
                      {s.status !== "rejected" && (
                        <button onClick={() => update(s, "rejected")} className={`${btn} border border-red-200 text-red-600 hover:bg-red-50`}>Reject</button>
                      )}
                      {s.status !== "pending" && (
                        <button onClick={() => update(s, "pending")} className={`${btn} border border-gray-200 text-gray-600 hover:bg-gray-50`}>Reset</button>
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
