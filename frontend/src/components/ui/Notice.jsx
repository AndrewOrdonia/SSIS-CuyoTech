import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Notice({ type = "error", children }) {
  if (!children) return null;
  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-red-600" />
      )}
      <span className="leading-5">{children}</span>
    </div>
  );
}
