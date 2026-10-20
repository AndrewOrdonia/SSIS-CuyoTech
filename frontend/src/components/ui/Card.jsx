export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function StatCard({ icon: Icon, title, value, color = "bg-[#153a33]" }) {
  return (
    <div className="group h-full rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs transition-all duration-150 hover:border-gray-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`${color} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs`}>
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  );
}
