export default function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          {user.role || "User"} Portal
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-xs ring-2 ring-blue-100">
          {user.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}