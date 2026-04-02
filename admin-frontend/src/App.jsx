import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Dashboard }       from "./components/pages/Dashboard";
import { WelfareAlerts }   from "./components/pages/WelfareAlerts";
import { StockManagement } from "./components/pages/StockManagement";
import { Bookings }        from "./components/pages/Bookings";
import { Profile }         from "./components/pages/Profile";
import { Login }           from "./components/pages/Login";

import { Sidebar } from "./components/shared/Sidebar";
import { Navbar }  from "./components/shared/Navbar";

// Simple auth guard — checks localStorage for admin token
function RequireAuth({ children }) {
  const token = localStorage.getItem("smartration_admin_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public: Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected: Main layout */}
        <Route
          path="*"
          element={
            <RequireAuth>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <Navbar />
                  <main className="flex-1 p-6 overflow-y-auto">
                    <Routes>
                      <Route path="/"        element={<Dashboard />} />
                      <Route path="/welfare" element={<WelfareAlerts />} />
                      <Route path="/stock"   element={<StockManagement />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/profile" element={<Profile />} />
                      {/* Fallback */}
                      <Route path="*"        element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </RequireAuth>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}