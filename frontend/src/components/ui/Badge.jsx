const styles = {
  pending: { badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  approved: { badge: "border-emerald-200 bg-emerald-50 text-emerald-800", dot: "bg-emerald-600" },
  rejected: { badge: "border-red-200 bg-red-50 text-red-800", dot: "bg-red-500" },
  processing: { badge: "border-blue-200 bg-blue-50 text-blue-800", dot: "bg-blue-600" },
};

export default function Badge({ status = "unknown" }) {
  const current = styles[status] || {
    badge: "border-gray-200 bg-gray-100 text-gray-700",
    dot: "bg-gray-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize leading-none ${current.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}
