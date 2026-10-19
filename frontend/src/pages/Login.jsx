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
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
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
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-[#dfc16e]" />
            STUDENT SERVICES INFORMATION SYSTEM
          </div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-white xl:text-6xl">
            Your campus life, in one place.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            A clear, secure way to stay on top of your studies and essential university services.
          </p>
          <div className="mt-11 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
            {portalLinks.map((label, index) => (
              <div key={label} className="border-l border-white/20 pl-3.5">
                <span className="text-[10px] font-semibold tracking-[0.16em] text-[#dfc16e]">0{index + 1}</span>
                <p className="mt-1.5 text-xs font-medium leading-5 text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-white/50">
          <ShieldCheck className="h-4 w-4" />
          Protected access for CuyoTech students and staff
        </div>
      </aside>

      <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-[430px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#153a33] text-[#e4c778]">
              <GraduationCap className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-[#153a33]">CUYOTECH</p>
              <p className="text-xs text-gray-500">University</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef5f3] text-[#205247]">
              <BookOpenCheck className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#397c6d]">Student & staff portal</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#1c2d26] sm:text-[2.1rem]">
              Sign in to continue
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Use your CuyoTech account to access university services.
            </p>
          </div>

          {errors.general && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <span>{errors.general[0]}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Username</span>
              <span className="relative mt-2 block">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#397c6d] focus:ring-4 focus:ring-[#397c6d]/10"
                  placeholder="Enter your username"
                />
              </span>
              {errors.username && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.username[0]}</span>}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Password</span>
              <span className="relative mt-2 block">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#397c6d] focus:ring-4 focus:ring-[#397c6d]/10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  aria-pressed={showPw}
                >
                  {showPw ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </span>
              {errors.password && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.password[0]}</span>}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="portal-button flex w-full items-center justify-center gap-2 bg-[#153a33] px-5 py-3 text-sm text-white shadow-sm hover:bg-[#102d28] focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  Signing in
                </>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-3 border-t border-gray-100 pt-5 text-xs leading-5 text-gray-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#397c6d]" />
            <p>For your security, keep your password private and sign out after using a shared device.</p>
          </div>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[430px] text-center text-xs text-gray-400">
          CuyoTech University · Student Services Information System
        </p>
      </section>
    </main>
  );
}
