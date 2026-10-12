import { peso, formatDateTime } from "./format";

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Opens a printable official-receipt window for a payment object returned by the API. */
export function printReceipt(p) {
  const w = window.open("", "_blank", "width=480,height=640");
  if (!w) {
    alert("Please allow pop-ups to print the receipt.");
    return;
  }
  w.document.write(`<!doctype html><html><head><title>Receipt ${esc(p.reference_no)}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;color:#111827;padding:28px;max-width:420px;margin:auto}
  h1{font-size:18px;margin:0;text-align:center;color:#1e3a8a}
  p.sub{margin:2px 0 18px;text-align:center;font-size:12px;color:#6b7280}
  .ref{text-align:center;font-family:monospace;font-weight:700;font-size:15px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  td{padding:7px 0;border-bottom:1px solid #e5e7eb;vertical-align:top}
  td:first-child{color:#6b7280;width:38%}
  .total td{font-weight:700;font-size:15px;border-bottom:2px solid #1e3a8a}
  .foot{margin-top:22px;text-align:center;font-size:11px;color:#9ca3af}
</style></head><body>
<h1>CuyoTech University</h1>
<p class="sub">Official Payment Receipt</p>
<div class="ref">${esc(p.reference_no)}</div>
<table>
  <tr><td>Student</td><td>${esc(p.student_name)}</td></tr>
  <tr><td>Student No.</td><td>${esc(p.student_no)}</td></tr>
  <tr><td>Payment For</td><td>${esc(p.description)}</td></tr>
  <tr><td>Method</td><td style="text-transform:capitalize">${esc(p.method)}</td></tr>
  <tr><td>Date</td><td>${esc(formatDateTime(p.paid_at))}</td></tr>
  <tr><td>Received By</td><td>${esc(p.cashier)}</td></tr>
  <tr class="total"><td>Amount Paid</td><td>${esc(peso(p.amount))}</td></tr>
</table>
<p class="foot">This is a system-generated receipt.</p>
<script>window.onload=function(){window.print();}</script>
</body></html>`);
  w.document.close();
}
