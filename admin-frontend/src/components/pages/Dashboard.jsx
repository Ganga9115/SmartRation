import { Users, Calendar, Package, TrendingUp } from "lucide-react";
import { StatCard } from "../shared/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const distributionData = [
  { day: "Mon", families: 45 },
  { day: "Tue", families: 52 },
  { day: "Wed", families: 48 },
  { day: "Thu", families: 61 },
  { day: "Fri", families: 55 },
  { day: "Sat", families: 67 },
  { day: "Sun", families: 43 },
];

const recentActivities = [
  { id: 1, user: "Priya Sharma", action: "Booked slot for tomorrow", time: "5 mins ago" },
  { id: 2, user: "Amit Patel", action: "Collected monthly ration", time: "12 mins ago" },
  { id: 3, user: "Lakshmi Iyer", action: "Cancelled booking", time: "25 mins ago" },
  { id: 4, user: "Rahul Verma", action: "Booked slot for 15th Jan", time: "1 hour ago" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Monitor your ration shop performance and activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="1,247"
          icon={Users}
          trend="+12% from last month"
          trendUp
          iconBgColor="bg-blue-100"
          iconColor="text-blue-700"
        />

        <StatCard
          title="Today's Bookings"
          value="34"
          icon={Calendar}
          trend="+8% from yesterday"
          trendUp
          iconBgColor="bg-[#E1D2FF]"
          iconColor="text-[#5E4075]"
        />

        <StatCard
          title="Stock Items"
          value="12"
          icon={Package}
          trend="2 items low stock"
          trendUp={false}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-700"
        />

        <StatCard
          title="Weekly Distribution"
          value="371"
          icon={TrendingUp}
          trend="+15% from last week"
          trendUp
          iconBgColor="bg-purple-100"
          iconColor="text-purple-700"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Daily Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="families" fill="#5E4075" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="families"
                stroke="#5E4075"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>

        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex gap-4 py-3 border-b last:border-0"
          >
            <div className="w-2 h-2 bg-[#5E4075] rounded-full mt-2"></div>

            <div>
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span>{" "}
                {activity.action}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}