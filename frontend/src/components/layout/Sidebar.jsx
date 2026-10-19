import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  Users,
  X,
} from "lucide-react";

const menus = {
  student: [
    { to: "/student/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/student/grades", label: "Grades", icon: BookOpen },
    { to: "/student/subjects", label: "My subjects", icon: Library },
    { to: "/student/documents", label: "Document requests", icon: FileText },
    { to: "/student/balance", label: "Balance & payments", icon: CreditCard },
  ],
  registrar: [
    { to: "/registrar/enrollment", label: "Enrollment", icon: ClipboardCheck },
    { to: "/registrar/grades", label: "Grades encoding", icon: BookOpen },
    { to: "/registrar/documents", label: "Document requests", icon: FileText },
  ],
  cashier: [
    { to: "/cashier/payments", label: "Payments", icon: CreditCard },
    { to: "/cashier/receipts", label: "Receipt archive", icon: FileText },
  ],
  department: [
    { to: "/department/clearance", label: "Clearance review", icon: ClipboardCheck },
  ],
  admin: [
    { to: "/admin/users", label: "User accounts", icon: Users },
  ],
};

const roleNames = {
  student: "Student workspace",
  registrar: "Registrar workspace",
  cashier: "Cashier workspace",
  department: "Department workspace",
  admin: "Administration",
};

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleMenu = menus[user.role] || [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[276px] shrink-0 flex-col bg-[#153a33] text-white shadow-[12px_0_40px_rgba(16,45,40,0.12)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link to={roleMenu[0]?.to || "/"} onClick={onClose} className="flex min-w-0 items-center gap-3 rounded-lg">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#e4c778]/25 bg-white/[0.08] text-[#e4c778]">
            <GraduationCap className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold tracking-[0.13em] text-white">CUYOTECH</p>
            <p className="mt-0.5 truncate text-[11px] tracking-wide text-white/55">Student Services</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/65 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5 pb-3 pt-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-white/40">Workspace</p>
        <p className="mt-2 text-sm font-semibold text-white/90">{roleNames[user.role] || "Campus services"}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {roleMenu.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-white/65 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {isActive && <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#dfc16e]" />}
              <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-[#e4c778]" : "text-white/50 group-hover:text-white/80"}`} strokeWidth={1.8} />
              <span className="min-w-0 flex-1">{label}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#dfc16e]" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4c778]/15 text-xs font-bold text-[#f0d990]">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/90">{user.name || "Campus user"}</p>
              <p className="mt-0.5 truncate text-[10px] capitalize text-white/45">{user.role || "Portal account"}</p>
            </div>
          </div>
        </div>
        <p className="px-1 pt-3 text-[10px] text-white/35">CuyoTech University · SSIS</p>
      </div>
    </aside>
  );
}
