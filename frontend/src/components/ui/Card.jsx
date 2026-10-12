export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200/80 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, title, value, color = "bg-blue-500" }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}