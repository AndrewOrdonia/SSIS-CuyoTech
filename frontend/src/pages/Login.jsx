import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, GraduationCap, AlertCircle } from "lucide-react";
import api from "../services/api";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center mx-auto mb-4 shadow-sm ring-4 ring-blue-50">
          <GraduationCap className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center tracking-tight">CuyoTech University</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Student Services Information System</p>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-lg mb-5 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{errors.general[0]}</span>
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">Username</span>
          <div className="relative mt-1.5">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter username"
            />
          </div>
          {errors.username && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.username[0]}</p>}
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type={showPw ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-2.5 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.password[0]}</p>}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 px-4 rounded-lg font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}