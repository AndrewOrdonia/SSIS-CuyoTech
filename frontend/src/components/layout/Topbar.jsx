import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import api from "../../services/api";

const pageTitles = {
  "/student/dashboard": "Overview",
  "/student/profile": "My Profile",
  "/student/grades": "Grades",
  "/student/subjects": "My Subjects",
  "/student/documents": "Document Requests",
  "/student/balance": "Balance & Payments",
  "/registrar/enrollment": "Enrollment",
  "/registrar/grades": "Grades Encoding",
  "/registrar/documents": "Document Requests",
  "/cashier/payments": "Payments",
  "/cashier/receipts": "Receipt Archive",
  "/department/clearance": "Clearance Review",
  "/admin/users": "User Accounts",
};

const roleLabels = {
  student: "Student",
  registrar: "Registrar",
  cashier: "Cashier",
  department: "Department",
  admin: "Administrator",
};

export default function Topbar({ onMenuClick = () => {} }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [isOpen, setIsOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const historyRef = useRef([location.pathname]);
  const previousPathRef = useRef(location.pathname);
  const goingBackRef = useRef(false);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;
    if (currentPath === previousPath) return;

    if (goingBackRef.current) {
      historyRef.current.pop();
      goingBackRef.current = false;
    } else {
      historyRef.current.push(currentPath);
    }

    previousPathRef.current = currentPath;
    setCanGoBack(historyRef.current.length > 1);
  }, [location.pathname]);

  const handleBack = () => {
    if (historyRef.current.length <= 1) return;
    goingBackRef.current = true;
    navigate(historyRef.current[historyRef.current.length - 2]);
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // Continue logging out if the request fails.
    }
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        {canGoBack && (
          <button
            type="button"
            onClick={handleBack}
            title="Go back"
            aria-label="Go back to previous page"
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
            {roleLabels[user.role] || "Campus"} Portal
          </p>
          <p className="truncate text-sm font-semibold tracking-tight text-gray-800">
            {pageTitles[location.pathname] || "Student Services"}
          </p>
        </div>
      </div>

      <div className="relative ml-3 shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition hover:border-gray-200 hover:bg-gray-50 sm:gap-3 sm:px-2.5"
          aria-expanded={isOpen}
          aria-label="Open user menu"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dcebe7] bg-[#eef5f3] text-xs font-bold text-[#205247]">
            {user.name?.[0]?.toUpperCase() || "U"}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[170px] truncate text-xs font-semibold text-gray-800">
              {user.name || "Campus user"}
            </span>
            <span className="block text-[10px] capitalize text-gray-400">
              {roleLabels[user.role] || "Account"}
            </span>
          </span>
          <ChevronDown
            className={`hidden h-3.5 w-3.5 text-gray-400 transition-transform sm:block ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <button
              type="button"
              aria-label="Close user menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1.5 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="truncate text-xs font-semibold text-gray-900">{user.name || "Campus user"}</p>
                <p className="truncate text-[11px] capitalize text-gray-500">
                  {roleLabels[user.role] || "Portal account"}
                </p>
              </div>
              {user.role === "student" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/student/profile");
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <UserRound className="h-4 w-4 text-gray-400" /> View profile
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-medium text-rose-700 transition hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
