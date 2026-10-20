import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import api from "../services/api";

const portalLinks = ["Academic records", "Student services", "Payments & clearance"];

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const useMock = import.meta.env.VITE_USE_MOCK === "true";
      const { data } = useMock
        ? await (await import("../services/mockApi")).mockLogin(form.username, form.password)
        : await api.post("/login", form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const routes = {
        student: "/student/dashboard",
        registrar: "/registrar/enrollment",
        cashier: "/cashier/payments",
        department: "/department/clearance",
        admin: "/admin/users",
      };
      navigate(routes[data.user.role] || "/");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else if (!err.response) {
        setErrors({ general: ["Cannot reach the server. Make sure the backend is running."] });
      } else {
        setErrors({ general: ["Invalid username or password."] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#153a33] text-white lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12 xl:px-20">
        <div className="login-panel-pattern" aria-hidden="true" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#e4c778]">
            <GraduationCap className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-[0.16em] text-white">CUYOTECH</p>
            <p className="mt-0.5 text-xs tracking-wide text-white/60">UNIVERSITY</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl pb-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[#dfc16e]" />
            STUDENT SERVICES INFORMATION SYSTEM
          </div>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl">
            Your campus life, in one place.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
            A secure and unified portal for student records, enrollment processes, fee payments, and clearance requests.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
            {portalLinks.map((label, index) => (
              <div key={label} className="border-l border-white/20 pl-3.5">
                <span className="text-[10px] font-semibold tracking-[0.16em] text-[#dfc16e]">0{index + 1}</span>
                <p className="mt-1.5 text-xs font-medium leading-snug text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-white/50">
          <ShieldCheck className="h-4 w-4 text-[#dfc16e]" />
          Institutional authentication for students and university staff
        </div>
      </aside>

      <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#153a33] text-[#e4c778]">
              <GraduationCap className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-[#153a33]">CUYOTECH</p>
              <p className="text-xs text-gray-500">University</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-7">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5f3] text-[#205247]">
                <BookOpenCheck className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Sign in
              </h2>
              <p className="mt-1.5 text-xs text-gray-500 leading-normal">
                Enter your credentials to access the academic services portal.
              </p>
            </div>

            {errors.general && (
              <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{errors.general[0]}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Username</span>
                <span className="relative mt-1.5 block">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
                    placeholder="Enter your username"
                  />
                </span>
                {errors.username && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.username[0]}</span>}
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Password</span>
                <span className="relative mt-1.5 block">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    aria-pressed={showPw}
                  >
                    {showPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </span>
                {errors.password && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.password[0]}</span>}
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#153a33] px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#102d28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#153a33] disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-2.5 border-t border-gray-100 pt-4 text-[11px] leading-relaxed text-gray-500">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#205247]" />
              <p>For security, please keep your credentials confidential and sign out when finished.</p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Student Services Information System · Portal
          </p>
        </div>
      </section>
    </main>
  );
}
