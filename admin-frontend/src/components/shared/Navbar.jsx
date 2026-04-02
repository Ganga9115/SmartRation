import { Bell, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("smartration_admin_user");
      if (saved) setUser(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartration_admin_token");
    localStorage.removeItem("smartration_admin_user");
    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3.5">
      <div className="flex items-center justify-between">

        {/* Left */}
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{today}</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 pl-3 pr-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 bg-[#E1D2FF] rounded-lg flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-[#5E4075]" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-400 capitalize leading-tight">{user?.role || "admin"}</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}