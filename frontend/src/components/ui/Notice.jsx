import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Notice({ type = "error", children }) {
  if (!children) return null;
  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
          : "border-rose-200 bg-rose-50/90 text-rose-900"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
      )}
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  );
}
