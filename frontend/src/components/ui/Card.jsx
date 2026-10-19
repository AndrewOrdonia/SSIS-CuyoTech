export function Card({ children, className = "" }) {
  return (
    <section className={`portal-card p-5 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function StatCard({ icon: Icon, title, value, color = "bg-blue-500" }) {
  return (
    <div className="portal-card group h-full p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(31,53,43,0.09)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{title}</p>
          <p className="mt-2 break-words text-[1.65rem] font-bold leading-none tracking-[-0.05em] text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`${color} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105`}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  );
}
