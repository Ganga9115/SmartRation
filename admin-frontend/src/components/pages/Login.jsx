import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mock login
    if (formData.email && formData.password) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5E4075] to-[#8B6FA8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="bg-white rounded-t-2xl p-8 text-center border-b-4 border-[#5E4075]">
          <div className="w-16 h-16 bg-[#E1D2FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#5E4075]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Ration System</h1>
          <p className="text-gray-600 mt-2">Admin Dashboard Login</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#5E4075]"
                  placeholder="admin@rationshop.gov.in"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#5E4075]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-[#5E4075] text-white py-3 rounded-lg hover:bg-[#4a2f5c]"
            >
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}