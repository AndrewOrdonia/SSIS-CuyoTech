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

  const actionBtn = "inline-flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Document Requests</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Process student applications for transcripts, certifications, and enrollment records.
        </p>
      </div>

      <Notice type={notice.type}>{notice.text}</Notice>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Document Request Archive</h2>
            <p className="mt-0.5 text-xs text-gray-500">TOR, COR, and Certificate requests</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or ID…"
                className="h-9 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-900 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="portal-table-wrap">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Document Type</th>
                <th className="px-5 py-3.5">Purpose</th>
                <th className="px-5 py-3.5 text-center">Copies</th>
                <th className="px-5 py-3.5">Fee & Status</th>
                <th className="px-5 py-3.5">Progress</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">No document requests found</p>
                      <p className="text-[11px] text-gray-400">Try adjusting your search criteria or status filter.</p>
                    </div>
                  </td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900">{r.student_name}</p>
                    <p className="font-mono text-[11px] text-gray-500">{r.student_no}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{r.type?.name}</p>
                    <p className="text-[10px] text-gray-400">{formatDateTime(r.created_at)}</p>
                  </td>
                  <td className="px-5 py-3.5 max-w-44 truncate text-gray-600" title={r.purpose}>
                    {r.purpose}
                  </td>
                  <td className="px-5 py-3.5 text-center font-medium text-gray-700">
                    {r.copies}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-mono font-semibold text-gray-900">{peso(r.fee)}</p>
                    <p className={`text-[10px] font-semibold ${r.paid ? "text-emerald-700" : "text-amber-700"}`}>
                      {r.paid ? "Paid" : "Unpaid"}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={r.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => setRequestStatus(r, "processing")}
                          className={`${actionBtn} bg-[#153a33] text-white hover:bg-[#102d28]`}
                        >
                          Process
                        </button>
                      )}
                      {r.status === "processing" && (
                        <button
                          type="button"
                          onClick={() => setRequestStatus(r, "approved")}
                          disabled={!r.paid}
                          title={r.paid ? "Approve request" : "Fee must be paid at cashier first"}
                          className={`${actionBtn} bg-emerald-700 text-white hover:bg-emerald-800`}
                        >
                          Approve
                        </button>
                      )}
                      {(r.status === "pending" || r.status === "processing") && (
                        <button
                          type="button"
                          onClick={() => setRequestStatus(r, "rejected")}
                          className={`${actionBtn} border border-rose-200 text-rose-700 hover:bg-rose-50`}
                        >
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
