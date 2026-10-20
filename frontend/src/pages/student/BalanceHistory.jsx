import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, ReceiptText, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const money = (amount) =>
  `₱${Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  const parsedDate = new Date(date.replace(" ", "T"));
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function BalanceHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState({
    total_balance: 0,
    charges: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/student/balance")
      .then(({ data }) => {
        setHistory(data.data ?? data);
      })
      .catch(() => {
        setError("Unable to load your balance history. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const charges = history.charges ?? [];
  const payments = history.payments ?? [];

  const totalCharges = charges.reduce(
    (total, charge) => total + Number(charge.amount || 0),
    0
  );

  const totalPayments = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/student/dashboard")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#153a33] hover:text-[#102d28]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Balance & Payment History
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Review your assessment charges, posted payments, and current balance.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="py-12 text-center text-xs text-gray-500">
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#153a33]/25 border-t-[#153a33] mb-2" />
          <p>Loading financial records…</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Outstanding Balance
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-gray-900">
                    {money(history.total_balance)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#205247]">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Total Charges
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-gray-900">
                    {money(totalCharges)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Total Payments
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-gray-900">
                    {money(totalPayments)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-sm font-bold text-gray-900">Charges and Account Assessment</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Tuition, institutional fees, and document requests.
              </p>
            </div>

            <div className="portal-table-wrap">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Charge</th>
                    <th className="px-5 py-3.5 text-right">Remaining</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {charges.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-gray-400">
                        No charges recorded yet.
                      </td>
                    </tr>
                  ) : (
                    charges.map((charge) => {
                      const balance = Number(charge.balance || 0);
                      const paid = balance <= 0;

                      return (
                        <tr key={charge.id} className="transition-colors hover:bg-gray-50/60">
                          <td className="px-5 py-3.5 font-medium text-gray-900">
                            {charge.description}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                            {formatDate(charge.created_at)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono text-gray-700">
                            {money(charge.amount)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono font-semibold text-gray-900">
                            {money(balance)}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge status={paid ? "paid" : "unpaid"} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-sm font-bold text-gray-900">Payment Transactions</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Official cashier receipts posted to your account.
              </p>
            </div>

            <div className="portal-table-wrap">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-3.5">Reference No.</th>
                    <th className="px-5 py-3.5">Charge Purpose</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Date Paid</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-gray-400">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => {
                      const charge = charges.find(
                        (item) => item.id === payment.charge_id
                      );

                      return (
                        <tr key={payment.id} className="transition-colors hover:bg-gray-50/60">
                          <td className="px-5 py-3.5 font-mono font-semibold text-[#153a33]">
                            {payment.reference_no}
                          </td>
                          <td className="px-5 py-3.5 text-gray-700">
                            {charge?.description || "Assessment"}
                          </td>
                          <td className="px-5 py-3.5 capitalize text-gray-600">
                            {payment.method}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                            {formatDate(payment.paid_at)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono font-bold text-emerald-700">
                            {money(payment.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
