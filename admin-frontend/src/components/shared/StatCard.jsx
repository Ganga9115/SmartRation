export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  iconBgColor = "bg-green-100",
  iconColor = "text-green-700",
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      
      <div className="flex items-start justify-between">

        {/* Left */}
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>

          <p className="text-3xl font-bold text-gray-900 mt-1">
            {value}
          </p>

          {trend && (
            <p
              className={`text-sm mt-2 ${
                trendUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend}
            </p>
          )}
        </div>

        {/* Icon */}
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>

      </div>

    </div>
  );
}