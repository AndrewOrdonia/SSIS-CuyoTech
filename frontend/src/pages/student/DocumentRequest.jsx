import { useEffect, useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function DocumentRequest() {
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [copies, setCopies] = useState(1);
  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/documents/types").then(({ data }) => setTypes(data.data ?? data)).catch(() => {});
    api.get("/documents/my-requests").then(({ data }) => setRequests(data.data ?? data)).catch(() => {});
  }, []);

  const total = selected ? selected.fee * copies : 0;

  const handleSubmit = async () => {
    if (!selected || !purpose) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/documents/request", {
        type_id: selected.id, purpose, copies,
      });
      setRequests([data.data ?? data, ...requests]);
      setSelected(null); setPurpose(""); setCopies(1);
    } catch (err) {
      alert(getErrorMessage(err, "Failed to submit request"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Request a Document</h1>

      <Card className="mb-6 border border-gray-200/80">
        <h2 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">1</span>
          Select Document Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {types.length === 0 && <p className="text-gray-400 text-sm py-4">Loading document types...</p>}
          {types.map((d) => {
            const isSelected = selected?.id === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelected(d)}
                className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                  isSelected
                    ? "border-blue-900 bg-blue-50/50 shadow-xs ring-1 ring-blue-900/20"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{d.name}</p>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />}
                  </div>
                  <p className="text-xs font-semibold text-blue-900 bg-blue-100/60 inline-block px-2 py-0.5 rounded mt-2">
                    Fee: P{Number(d.fee).toFixed(2)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {selected && (
        <Card className="mb-6 border border-gray-200/80">
          <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">2</span>
            Request Details
          </h2>
          <label className="block mb-4">
            <span className="text-sm font-semibold text-gray-700">Purpose of Request</span>
            <textarea
              rows="3"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full mt-1.5 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="e.g., Employment application, Scholarship requirement, Board Exam"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Number of Copies</span>
            <input
              type="number" min="1" max="5"
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              className="w-32 mt-1.5 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </label>
        </Card>
      )}

      {selected && (
        <Card className="flex items-center justify-between mb-6 bg-blue-50/30 border border-blue-200/70 p-5">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Total Assessment Fee</p>
            <p className="text-3xl font-extrabold text-blue-900 font-mono mt-0.5">P{total.toFixed(2)}</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !purpose}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </Card>
      )}

      <Card className="overflow-hidden p-0 border border-gray-200/80">
        <div className="p-5 pb-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-base">My Document Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Document Type</th>
                <th className="py-3.5 px-4 font-semibold text-center">Copies</th>
                <th className="py-3.5 px-4 font-semibold">Assessment Fee</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-600">No requests submitted yet</p>
                      <p className="text-xs text-gray-400">Submitted document requests will be tracked here.</p>
                    </div>
                  </td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-gray-900">{r.type?.name || r.type_name}</td>
                  <td className="py-3.5 px-4 text-gray-600 text-center">{r.copies}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-gray-800">
                    P{Number(r.fee).toFixed(2)}
                    <span className={`block font-sans text-[11px] font-medium ${r.paid ? "text-emerald-600" : "text-amber-600"}`}>
                      {r.paid ? "Paid" : "Unpaid - pay at the Cashier"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4"><Badge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}