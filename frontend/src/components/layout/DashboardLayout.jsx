import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f5f2] text-gray-800 antialiased lg:flex">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#101d18]/55 backdrop-blur-[2px] lg:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} />
        <main className="dashboard-content min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
        <footer className="mx-4 flex items-center justify-between gap-3 border-t border-gray-200/80 py-4 text-[11px] text-gray-400 sm:mx-6 lg:mx-8">
          <span>CuyoTech University · Student Services</span>
          <span className="hidden sm:inline">Official campus portal</span>
        </footer>
      </div>
    </div>
  );
}
