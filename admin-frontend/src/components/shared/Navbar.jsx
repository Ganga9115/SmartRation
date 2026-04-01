import { Bell, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // later you can clear token here
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">

        {/* Left */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome back, Admin
          </h2>
          <p className="text-sm text-gray-500">
            Manage your ration shop operations
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Notification */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Rajesh Kumar
              </p>
              <p className="text-xs text-gray-500">
                Shop Admin
              </p>
            </div>

            {/* Profile Button */}
            <button
              onClick={handleProfileClick}
              className="w-10 h-10 bg-[#E1D2FF] rounded-full flex items-center justify-center hover:bg-[#d1c0f5]"
            >
              <User className="w-5 h-5 text-[#5E4075]" />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
          </button>

        </div>
      </div>
    </header>
  );
}