import { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Notice from "../../components/ui/Notice";
import { peso, formatDateTime } from "../../utils/format";

export default function DocumentRequests() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState({ type: "error", text: "" });

  useEffect(() => {
    const t = setTimeout(() => {
      api.get("/registrar/documents", { params: { status, search } })
        .then(({ data }) => setRequests(data.data ?? data))
        .catch((err) => setNotice({ type: "error", text: getErrorMessage(err) }))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [status, search, reload]);

  const setRequestStatus = async (r, next) => {
    try {
      await api.put(`/registrar/documents/${r.id}`, { status: next });
      setNotice({ type: "success", text: `Request #${r.id} marked as ${next}.` });
      setReload((n) => n + 1);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  const btn = "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Document Requests</h1>

      <Notice type={notice.type}>{notice.text}</Notice>

      <Card className="overflow-hidden p-0 border border-gray-200/80">
        <div className="p-5 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-gray-800 text-base">TOR, COR &amp; Certification Requests</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student"
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Student</th>
                <th className="py-3.5 px-4 font-semibold">Document</th>
                <th className="py-3.5 px-4 font-semibold">Purpose</th>
                <th className="py-3.5 px-4 font-semibold text-center">Copies</th>
                <th className="py-3.5 px-4 font-semibold">Fee</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-600">No document requests found</p>
                    </div>
                  </td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-900">{r.student_name}</p>
                    <p className="text-xs text-gray-500 font-mono">{r.student_no}</p>
                  </td>
                  <td className="py-3.5 px-4 text-gray-800">
                    {r.type?.name}
                    <p className="text-[11px] text-gray-400">{formatDateTime(r.created_at)}</p>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 max-w-48 truncate" title={r.purpose}>{r.purpose}</td>
                  <td className="py-3.5 px-4 text-gray-600 text-center">{r.copies}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-mono font-semibold text-gray-800">{peso(r.fee)}</p>
                    <p className={`text-[11px] font-medium ${r.paid ? "text-emerald-600" : "text-amber-600"}`}>
                      {r.paid ? "Paid" : "Unpaid"}
                    </p>
                  </td>
                  <td className="py-3.5 px-4"><Badge status={r.status} /></td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {r.status === "pending" && (
                        <button onClick={() => setRequestStatus(r, "processing")} className={`${btn} bg-blue-900 hover:bg-blue-800 text-white`}>
                          Process
                        </button>
                      )}
                      {r.status === "processing" && (
                        <button
                          onClick={() => setRequestStatus(r, "approved")}
                          disabled={!r.paid}
                          title={r.paid ? "Approve request" : "Fee must be paid at the cashier first"}
                          className={`${btn} bg-emerald-600 hover:bg-emerald-700 text-white`}
                        >
                          Approve
                        </button>
                      )}
                      {(r.status === "pending" || r.status === "processing") && (
                        <button onClick={() => setRequestStatus(r, "rejected")} className={`${btn} border border-red-200 text-red-600 hover:bg-red-50`}>
                          Reject
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
