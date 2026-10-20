import { useEffect, useState } from "react";
import { FileText, CheckCircle2, ArrowRight } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Notice from "../../components/ui/Notice";

export default function DocumentRequest() {
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [copies, setCopies] = useState(1);
  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "error", text: "" });

  useEffect(() => {
    api.get("/documents/types").then(({ data }) => setTypes(data.data ?? data)).catch(() => {});
    api.get("/documents/my-requests").then(({ data }) => setRequests(data.data ?? data)).catch(() => {});
  }, []);

  const total = selected ? selected.fee * copies : 0;

  const handleSubmit = async () => {
    if (!selected || !purpose.trim()) return;
    setSubmitting(true);
    setNotice({ type: "error", text: "" });
    try {
      const { data } = await api.post("/documents/request", {
        type_id: selected.id, purpose: purpose.trim(), copies,
      });
      setRequests([data.data ?? data, ...requests]);
      setSelected(null);
      setPurpose("");
      setCopies(1);
      setNotice({ type: "success", text: "Your document request has been submitted successfully." });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err, "Failed to submit request") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Request Official Documents</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Request official credentials, certifications, transcripts, and certificates of enrollment.
        </p>
      </div>

      <Notice type={notice.type}>{notice.text}</Notice>

      <Card>
        <h2 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold text-gray-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#153a33] text-xs font-bold text-white">
            1
          </span>
          Select Document Type
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {types.length === 0 && (
            <p className="col-span-full py-4 text-xs text-gray-400">Loading document catalog…</p>
          )}
          {types.map((d) => {
            const isSelected = selected?.id === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelected(d)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-[#205247] bg-[#eef5f3]/80 shadow-xs ring-1 ring-[#205247]"
                    : "border-gray-200/90 bg-white hover:border-gray-300 hover:bg-gray-50/70"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? "bg-[#153a33] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">{d.name}</p>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#205247]" />}
                  </div>
                  <span className="mt-2 inline-block rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-gray-700">
                    ₱{Number(d.fee).toFixed(2)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {selected && (
        <Card className="space-y-4">
          <h2 className="flex items-center gap-2.5 text-sm font-bold text-gray-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#153a33] text-xs font-bold text-white">
              2
            </span>
            Request Specifications
          </h2>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              Purpose of Request
            </span>
            <textarea
              rows="3"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs sm:text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
              placeholder="e.g., Employment requirement, scholarship renewal, licensure board exam"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              Number of Copies
            </span>
            <input
              type="number"
              min="1"
              max="5"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
              className="mt-1.5 h-10 w-28 rounded-xl border border-gray-200 bg-white px-3 font-mono text-sm text-gray-900 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#bed7d0] bg-[#eef5f3] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Total Assessment Fee
              </p>
              <p className="font-mono text-2xl font-bold text-[#153a33]">₱{total.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !purpose.trim()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#153a33] px-6 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#102d28] focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting…" : <>Submit Request <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-900">Request History</h2>
          <p className="mt-0.5 text-xs text-gray-500">Status of your submitted document requests.</p>
        </div>
        <div className="portal-table-wrap">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Document Type</th>
                <th className="px-5 py-3.5 text-center">Copies</th>
                <th className="px-5 py-3.5">Fee & Payment</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">No requests submitted yet</p>
                      <p className="text-[11px] text-gray-400">Your requests will appear here once submitted.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {r.type?.name || r.type_name}
                    </td>
                    <td className="px-5 py-3.5 text-center text-gray-600">
                      {r.copies}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      <span className="font-semibold text-gray-900">₱{Number(r.fee).toFixed(2)}</span>
                      <span
                        className={`block font-sans text-[11px] font-medium ${
                          r.paid ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {r.paid ? "Paid" : "Unpaid · settle at Cashier"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
