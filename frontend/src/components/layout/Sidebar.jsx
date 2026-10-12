import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  LayoutDashboard, User, BookOpen, Library, FileText, CreditCard,
  ClipboardCheck, Users, LogOut, GraduationCap,
} from "lucide-react";

const menus = {
  student: [
    { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/profile", label: "My Profile", icon: User },
    { to: "/student/grades", label: "Grades", icon: BookOpen },
    { to: "/student/subjects", label: "Subjects", icon: Library },
    { to: "/student/documents", label: "Document Request", icon: FileText },
  ],
  registrar: [
    { to: "/registrar/enrollment", label: "Enrollment", icon: ClipboardCheck },
    { to: "/registrar/grades", label: "Grades Encoding", icon: BookOpen },
    { to: "/registrar/documents", label: "Document Requests", icon: FileText },
  ],
  cashier: [
    { to: "/cashier/payments", label: "Payments", icon: CreditCard },
    { to: "/cashier/receipts", label: "Receipts", icon: FileText },
  ],
  department: [
    { to: "/department/clearance", label: "Clearance", icon: ClipboardCheck },
  ],
  admin: [
    { to: "/admin/users", label: "User Accounts", icon: Users },
  ],
};

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try { await api.post("/logout"); } catch { /* token may already be invalid */ }
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col shadow-lg shrink-0">
      <div className="flex items-center gap-3 p-5 border-b border-blue-800/80">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">CuyoTech</h1>
          <p className="text-xs text-blue-200/80 font-medium">Student Services IS</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1.5">
        {menus[user.role]?.map((m) => {
          const isActive = pathname === m.to;
          return (
            <Link
              key={m.to}
              to={m.to}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-blue-800 text-white shadow-xs border-l-4 border-amber-500"
                  : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
              }`}
            >
              <m.icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-blue-300"}`} />
              {m.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-blue-200 border-t border-blue-800 hover:bg-red-500/15 hover:text-red-200 transition-colors duration-150 cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </aside>
  );
}