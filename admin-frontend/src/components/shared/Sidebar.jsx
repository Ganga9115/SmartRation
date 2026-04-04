import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Bell, Calendar, UserCircle, ShieldCheck } from "lucide-react";
import { Gift } from "lucide-react";
const navItems = [
  { path: "/",         icon: LayoutDashboard, label: "Dashboard" },
  { path: "/stock",    icon: Package,         label: "Stock" },
  { path: "/welfare",  icon: Bell,            label: "Welfare Alerts" },
  { path: "/bookings", icon: Calendar,        label: "Bookings" },
  { path: "/profile",  icon: UserCircle,      label: "Profile" },
  { path: "/events", icon: Gift, label: "Special Events" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shadow-sm">
      {/* Branding */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#5E4075] rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">SmartRation</h1>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    isActive
                      ? "bg-[#E1D2FF] text-[#5E4075]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-[#5E4075]" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Government of India · PDS System</p>
      </div>
    </aside>
  );
}