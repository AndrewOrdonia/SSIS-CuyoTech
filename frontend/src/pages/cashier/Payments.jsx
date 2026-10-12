import { useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Notice from "../../components/ui/Notice";
import StudentPicker from "../../components/ui/StudentPicker";
import { peso } from "../../utils/format";
import { printReceipt } from "../../utils/receipt";

export default function Payments() {
  const [student, setStudent] = useState(null);
  const [account, setAccount] = useState(null); // { balance, charges }
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
      setNotice({ type: "success", text: `Payment recorded. Reference no. ${data.reference_no}` });
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
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payments</h1>

      <Notice type={notice.type}>{notice.text}</Notice>

      {lastPayment && (
        <Card className="mb-6 flex items-center justify-between bg-emerald-50/40 border border-emerald-200/70">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Last Receipt</p>
            <p className="font-mono font-bold text-blue-900">{lastPayment.reference_no}</p>
            <p className="text-xs text-gray-500">{peso(lastPayment.amount)} &middot; {lastPayment.description}</p>
          </div>
          <button
            onClick={() => printReceipt(lastPayment)}
            className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Print Receipt
          </button>
        </Card>
      )}

      <StudentPicker selectedId={student?.id} onSelect={pickStudent} />

      {student && account && (
        <>
          <Card className="mb-6 overflow-hidden p-0 border border-gray-200/80">
            <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">2</span>
                Assessment &mdash; {student.name}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                Outstanding: {peso(account.balance)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4"></th>
                    <th className="py-3.5 px-4 font-semibold">Description</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {account.charges.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-400 text-sm">No charges on this account.</td>
                    </tr>
                  )}
                  {account.charges.map((c) => {
                    const settled = c.balance <= 0;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => !settled && pickCharge(c)}
                        className={`transition-colors ${settled ? "opacity-60" : "cursor-pointer hover:bg-gray-50/60"} ${chargeId === c.id ? "bg-blue-50/50" : ""}`}
                      >
                        <td className="py-3.5 px-4">
                          <input type="radio" disabled={settled} checked={chargeId === c.id} onChange={() => pickCharge(c)} className="accent-blue-900" />
                        </td>
                        <td className="py-3.5 px-4 text-gray-800 font-medium">{c.description}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-600">{peso(c.amount)}</td>
                        <td className={`py-3.5 px-4 text-right font-mono font-semibold ${settled ? "text-emerald-600" : "text-gray-800"}`}>
                          {settled ? "Paid" : peso(c.balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {selected && (
            <Card className="mb-6 border border-gray-200/80">
              <h2 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">3</span>
                Payment Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Amount (max {peso(selected.balance)})</span>
                  <input
                    type="number" min="0.01" step="0.01" max={selected.balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1.5 border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Payment Method</span>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full mt-1.5 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={busy || !amount || Number(amount) <= 0}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {busy ? "Processing..." : "Record Payment"}
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
