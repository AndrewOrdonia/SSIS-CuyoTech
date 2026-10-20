import { useState } from "react";
import { Printer } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Notice from "../../components/ui/Notice";
import StudentPicker from "../../components/ui/StudentPicker";
import { peso } from "../../utils/format";
import { printReceipt } from "../../utils/receipt";

export default function Payments() {
  const [student, setStudent] = useState(null);
  const [account, setAccount] = useState(null);
  const [chargeId, setChargeId] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "error", text: "" });
  const [lastPayment, setLastPayment] = useState(null);

  const load = (s) =>
    api.get(`/cashier/students/${s.id}/charges`)
      .then(({ data }) => setAccount(data))
      .catch((err) => setNotice({ type: "error", text: getErrorMessage(err) }));

  const pickStudent = (s) => {
    setStudent(s);
    setChargeId(null);
    setAmount("");
    setLastPayment(null);
    setNotice({ type: "error", text: "" });
    load(s);
  };

  const pickCharge = (c) => {
    setChargeId(c.id);
    setAmount(String(c.balance));
  };

  const selected = account?.charges.find((c) => c.id === chargeId);

  const handleSubmit = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { data } = await api.post("/payments", { charge_id: selected.id, amount: Number(amount), method });
      setNotice({ type: "success", text: `Payment recorded. Reference No: ${data.reference_no}` });
      const receipt = await api.get(`/payments/${data.id}`);
      setLastPayment(receipt.data);
      setChargeId(null);
      setAmount("");
      await load(student);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cashier Payments</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Process tuition installments, document processing fees, and generate official receipts.
        </p>
      </div>

      <Notice type={notice.type}>{notice.text}</Notice>

      {lastPayment && (
        <Card className="flex flex-col gap-3 border-[#bed7d0] bg-[#eef5f3] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Payment Processed</span>
            <p className="font-mono text-base font-bold text-[#153a33]">{lastPayment.reference_no}</p>
            <p className="text-xs text-gray-600">
              {peso(lastPayment.amount)} · {lastPayment.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => printReceipt(lastPayment)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#153a33] px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#102d28]"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        </Card>
      )}

      <StudentPicker selectedId={student?.id} onSelect={pickStudent} step={1} title="Select Student" />

      {student && account && (
        <>
          <Card className="overflow-hidden p-0">
            <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2.5 text-sm font-bold text-gray-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#153a33] text-xs font-bold text-white">
                  2
                </span>
                Outstanding Charges · <span className="text-[#153a33]">{student.name}</span>
              </h2>
              <span className="self-start sm:self-auto rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-rose-800">
                Outstanding: {peso(account.balance)}
              </span>
            </div>

            <div className="portal-table-wrap">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-3.5 w-10"></th>
                    <th className="px-5 py-3.5">Charge Description</th>
                    <th className="px-5 py-3.5 text-right">Total Assessment</th>
                    <th className="px-5 py-3.5 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {account.charges.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-xs text-gray-400">
                        No charges on record for this student.
                      </td>
                    </tr>
                  ) : (
                    account.charges.map((c) => {
                      const settled = c.balance <= 0;
                      const isChosen = chargeId === c.id;
                      return (
                        <tr
                          key={c.id}
                          onClick={() => !settled && pickCharge(c)}
                          className={`transition-colors ${
                            settled
                              ? "opacity-50"
                              : isChosen
                              ? "bg-[#eef5f3] cursor-pointer"
                              : "cursor-pointer hover:bg-gray-50/60"
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <input
                              type="radio"
                              disabled={settled}
                              checked={isChosen}
                              onChange={() => pickCharge(c)}
                              className="h-4 w-4 accent-[#153a33]"
                            />
                          </td>
                          <td className="px-5 py-3.5 font-medium text-gray-900">
                            {c.description}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-gray-600">
                            {peso(c.amount)}
                          </td>
                          <td
                            className={`px-5 py-3.5 text-right font-mono font-bold ${
                              settled ? "text-emerald-700" : "text-gray-900"
                            }`}
                          >
                            {settled ? "Settled" : peso(c.balance)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {selected && (
            <Card>
              <h2 className="mb-4 flex items-center gap-2.5 text-sm font-bold text-gray-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#153a33] text-xs font-bold text-white">
                  3
                </span>
                Payment Entry
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Payment Amount (max {peso(selected.balance)})
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={selected.balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 font-mono text-sm text-gray-900 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Payment Channel
                  </span>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm text-gray-900 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
                  >
                    <option value="cash">Cash Tender</option>
                    <option value="gcash">GCash</option>
                    <option value="card">Debit / Credit Card</option>
                    <option value="bank">Bank Deposit / Transfer</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={busy || !amount || Number(amount) <= 0}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#153a33] px-6 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#102d28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Processing…" : "Record Payment & Issue Receipt"}
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
