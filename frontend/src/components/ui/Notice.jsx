import { AlertCircle, CheckCircle2 } from "lucide-react";

/** Inline success / error banner (same look as the login error box). */
export default function Notice({ type = "error", children }) {
  if (!children) return null;
  const ok = type === "success";
  return (
    <div
      className={`${
        ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
      } border text-sm p-3.5 rounded-lg mb-5 flex items-start gap-2.5`}
    >
      {ok ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      )}
      <span>{children}</span>
    </div>
  );
}
