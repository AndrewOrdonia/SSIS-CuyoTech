import { useEffect, useState } from "react";
import { Receipt as ReceiptIcon, Search, Printer } from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { peso, formatDateTime } from "../../utils/format";
import { printReceipt } from "../../utils/receipt";

export default function Receipts() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      api.get("/payments", { params: { search } })
        .then(({ data }) => setPayments(data.data ?? data))
        .catch(() => setPayments([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Receipts</h1>
      <Card className="overflow-hidden p-0 border border-gray-200/80">
        <div className="p-5 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-gray-800 text-base">Official Receipts Archive</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or student"
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Reference No.</th>
                <th className="py-3.5 px-4 font-semibold">Student</th>
                <th className="py-3.5 px-4 font-semibold">Payment For</th>
                <th className="py-3.5 px-4 font-semibold">Method</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ReceiptIcon className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-600">No receipts found</p>
                      <p className="text-xs text-gray-400">Recorded payments will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-900">{p.reference_no}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-900">{p.student_name}</p>
                    <p className="text-xs text-gray-500 font-mono">{p.student_no}</p>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700">{p.description}</td>
                  <td className="py-3.5 px-4 text-gray-600 capitalize">{p.method}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-800">{peso(p.amount)}</td>
                  <td className="py-3.5 px-4 text-gray-500 text-xs">{formatDateTime(p.paid_at)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => printReceipt(p)}
                      className="text-blue-900 hover:text-blue-700 p-1 rounded cursor-pointer"
                      title="Print receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
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
