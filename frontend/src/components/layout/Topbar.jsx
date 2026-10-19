
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  UserRound,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import api from "../../services/api";

export default function Topbar() {
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

    const history = historyRef.current;
    const previousPath = history[history.length - 2];

    navigate(previousPath);
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button
            type="button"
            onClick={handleBack}
            title="Go back"
            aria-label="Go back to previous page"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          {user.role || "User"} Portal
        </span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 sm:gap-3 rounded-xl p-2 hover:bg-gray-50 transition-colors cursor-pointer"
          aria-expanded={isOpen}
          aria-label="Open user menu"
        >
          <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm ring-2 ring-blue-100">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {user.name || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role}
            </p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
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

            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-20">
              {user.role === "student" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/student/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                  >
                    <UserRound className="w-4 h-4" />
                    View My Profile
                  </button>

                  <div className="my-1 border-t border-gray-100" />
                </>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
