import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, ReceiptText, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";

const money = (amount) =>
  `P${Number(amount || 0).toLocaleString("en-PH", {
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
    <div>
      <button
        type="button"
        onClick={() => navigate("/student/dashboard")}
        className="flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-700 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Balance and Payment History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your charges, recorded payments, and remaining balance.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="py-12 text-center text-gray-500">
          Loading your financial records...
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Outstanding Balance</p>
                  <p className="text-xl font-bold text-gray-900">
                    {money(history.total_balance)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                  <ReceiptText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Charges</p>
                  <p className="text-xl font-bold text-gray-900">
                    {money(totalCharges)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Payments</p>
                  <p className="text-xl font-bold text-gray-900">
                    {money(totalPayments)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mb-6 overflow-hidden p-0">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Charges and Remaining Balances</h2>
              <p className="text-xs text-gray-500 mt-1">
                Tuition and document fees recorded in your account.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-4">Description</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Charge</th>
                    <th className="p-4 text-right">Remaining</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {charges.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">
                        No charges recorded yet.
                      </td>
                    </tr>
                  ) : (
                    charges.map((charge) => {
                      const balance = Number(charge.balance || 0);
                      const paid = balance <= 0;

                      return (
                        <tr key={charge.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-800">
                            {charge.description}
                          </td>
                          <td className="p-4 text-gray-500 whitespace-nowrap">
                            {formatDate(charge.created_at)}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            {money(charge.amount)}
                          </td>
                          <td className="p-4 text-right font-semibold whitespace-nowrap">
                            {money(balance)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                                paid
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {paid ? "Paid" : "Unpaid / Partial"}
                            </span>
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
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Payment Transactions</h2>
              <p className="text-xs text-gray-500 mt-1">
                Payments recorded by the cashier.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-4">Reference No.</th>
                    <th className="p-4">Charge</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Date Paid</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => {
                      const charge = charges.find(
                        (item) => item.id === payment.charge_id
                      );

                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="p-4 font-mono text-xs text-blue-900">
                            {payment.reference_no}
                          </td>
                          <td className="p-4 text-gray-700">
                            {charge?.description || "Charge"}
                          </td>
                          <td className="p-4 capitalize text-gray-600">
                            {payment.method}
                          </td>
                          <td className="p-4 text-gray-500 whitespace-nowrap">
                            {formatDate(payment.paid_at)}
                          </td>
                          <td className="p-4 text-right font-semibold text-emerald-700 whitespace-nowrap">
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