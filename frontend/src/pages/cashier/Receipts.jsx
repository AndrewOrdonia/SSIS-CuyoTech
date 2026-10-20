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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Official Receipts</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Lookup posted payment transactions and reprint official university receipts.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Receipt Archive</h2>
            <p className="mt-0.5 text-xs text-gray-500">Historical transaction logs</p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or student…"
              className="h-9 w-64 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-900 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
            />
          </div>
        </div>

        <div className="portal-table-wrap">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Reference No.</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Assessment Description</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Date Paid</th>
                <th className="px-5 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ReceiptIcon className="h-8 w-8 text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">No receipts found</p>
                      <p className="text-[11px] text-gray-400">Transactions processed by the cashier will be cataloged here.</p>
                    </div>
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#153a33]">
                    {p.reference_no}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900">{p.student_name}</p>
                    <p className="font-mono text-[11px] text-gray-500">{p.student_no}</p>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">
                    {p.description}
                  </td>
                  <td className="px-5 py-3.5 capitalize text-gray-600">
                    {p.method}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900">
                    {peso(p.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-[11px] text-gray-500">
                    {formatDateTime(p.paid_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => printReceipt(p)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                      title="Print receipt"
                    >
                      <Printer className="h-4 w-4" />
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
