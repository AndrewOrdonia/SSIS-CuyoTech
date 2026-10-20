const styles = {
  pending: { badge: "border-amber-200 bg-amber-50/80 text-amber-800", dot: "bg-amber-500" },
  processing: { badge: "border-sky-200 bg-sky-50/80 text-sky-800", dot: "bg-sky-500" },
  approved: { badge: "border-emerald-200 bg-emerald-50/80 text-emerald-800", dot: "bg-emerald-500" },
  cleared: { badge: "border-emerald-200 bg-emerald-50/80 text-emerald-800", dot: "bg-emerald-500" },
  paid: { badge: "border-emerald-200 bg-emerald-50/80 text-emerald-800", dot: "bg-emerald-500" },
  rejected: { badge: "border-rose-200 bg-rose-50/80 text-rose-800", dot: "bg-rose-500" },
  unpaid: { badge: "border-rose-200 bg-rose-50/80 text-rose-800", dot: "bg-rose-500" },
  active: { badge: "border-emerald-200 bg-emerald-50/80 text-emerald-800", dot: "bg-emerald-500" },
  inactive: { badge: "border-gray-200 bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

export default function Badge({ status = "unknown" }) {
  const normalized = String(status || "").toLowerCase();
  const current = styles[normalized] || {
    badge: "border-gray-200 bg-gray-100 text-gray-700",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize leading-tight ${current.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}
