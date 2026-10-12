const styles = {
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  processing: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-600",
  },
};

export default function Badge({ status }) {
  const current = styles[status] || {
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${current.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {status}
    </span>
  );
}