import { useState, useEffect } from "react";
import { User, Edit2, Save, X, LogOut, ShieldCheck } from "lucide-react";
import { adminAuthAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const navigate     = useNavigate();
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    adminAuthAPI.getMe()
      .then(r => {
        setUser(r.data.user);
        setName(r.data.user.name || "");
        setEmail(r.data.user.email || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("smartration_admin_token")}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setEditing(false);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("smartration_admin_token");
    localStorage.removeItem("smartration_admin_user");
    navigate("/login");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#E1D2FF] border-t-[#5E4075] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <div className="flex gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4a2f5c]">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4a2f5c] disabled:bg-gray-300">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => { setEditing(false); setError(""); }}
                className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>
<div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
  
  {/* Top gradient */}
  <div className="h-28 bg-gradient-to-r from-[#5E4075] to-[#8B6FA8]" />

  {/* Content */}
  <div className="px-6 pb-6 pt-12 relative">
    
    {/* Avatar */}
    <div className="absolute -top-10 left-6 w-20 h-20 bg-[#E1D2FF] rounded-2xl border-4 border-white flex items-center justify-center shadow-md">
      <User className="w-9 h-9 text-[#5E4075]" />
    </div>

    {/* Info */}
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-gray-900">
          {user?.name || "Admin"}
        </h2>

        <span className="flex items-center gap-1 bg-[#E1D2FF] text-[#5E4075] px-2.5 py-0.5 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3 h-3" />
          {user?.role || "admin"}
        </span>
      </div>

      <p className="text-gray-500 text-sm mt-1">
        +91 {user?.phone}
      </p>
    </div>
  </div>
</div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Personal Information</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Name</label>
          {editing ? (
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] transition-colors" />
          ) : (
            <p className="text-gray-900 font-medium">{user?.name || "—"}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label>
          <p className="text-gray-900 font-medium">+91 {user?.phone}</p>
          <p className="text-xs text-gray-400 mt-0.5">Phone cannot be changed</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
          {editing ? (
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              placeholder="admin@example.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5E4075] transition-colors" />
          ) : (
            <p className="text-gray-900 font-medium">{user?.email || <span className="text-gray-400">Not set</span>}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Role</label>
          <p className="text-gray-900 font-medium capitalize">{user?.role || "—"}</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-600 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}