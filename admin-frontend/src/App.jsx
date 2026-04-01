import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Dashboard } from "./components/pages/Dashboard";
import { Users } from "./components/pages/Users";
import { StockManagement } from "./components/pages/StockManagement";
import { Bookings } from "./components/pages/Bookings";
import { Profile } from "./components/pages/Profile";
import { Login } from "./components/pages/Login";

import { Sidebar } from "./components/shared/Sidebar";
import { Navbar } from "./components/shared/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Login Page (No Sidebar/Navbar) */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Main App Layout */}
        <Route
          path="*"
          element={
            <div className="flex h-screen bg-gray-100">

              {/* Sidebar */}
              <Sidebar />

              {/* Main Area */}
              <div className="flex-1 flex flex-col">

                {/* Navbar */}
                <Navbar userName="Ganga" />

                {/* Pages */}
                <main className="flex-1 p-6 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/stock" element={<StockManagement />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>

              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}