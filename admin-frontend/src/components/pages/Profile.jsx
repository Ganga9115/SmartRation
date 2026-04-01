import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Edit2,
  Save,
  X,
} from "lucide-react";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "Rajesh Kumar",
    email: "rajesh.kumar@rationshop.gov.in",
    phone: "+91 98765 43210",
    shopId: "MH-MUM-001",
    shopName: "Andheri West Ration Shop",
    address:
      "Shop No. 12, Veera Desai Road, Andheri West, Mumbai - 400053",
    district: "Mumbai Suburban",
    state: "Maharashtra",
    joinDate: "January 15, 2022",
    role: "Shop Admin",
  });

  const [editData, setEditData] = useState({ ...profileData });

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const stats = [
    { label: "Total Users Served", value: "1,247", color: "text-blue-700" },
    { label: "Total Bookings", value: "3,456", color: "text-[#5E4075]" },
    { label: "Items Distributed", value: "18,234", color: "text-green-700" },
    { label: "Active Days", value: "856", color: "text-orange-700" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account information
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg"
          >
            <Edit2 className="w-5 h-5" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg"
            >
              <Save className="w-5 h-5" />
              Save
            </button>

            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow border">
        <div className="h-32 bg-gradient-to-r from-[#5E4075] to-[#8B6FA8]"></div>

        <div className="p-6 -mt-16 flex items-center gap-6">
          <div className="w-24 h-24 bg-[#E1D2FF] rounded-full flex items-center justify-center border-4 border-white">
            <User className="w-10 h-10 text-[#5E4075]" />
          </div>

          <div>
            <h2 className="text-xl font-bold">{profileData.name}</h2>
            <p className="text-gray-500">{profileData.role}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded shadow border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Personal Info */}
      <div className="bg-white p-6 rounded shadow border space-y-4">
        <h3 className="font-semibold text-lg">Personal Info</h3>

        <input
          type="text"
          disabled={!isEditing}
          value={editData.name}
          onChange={(e) =>
            setEditData({ ...editData, name: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="email"
          disabled={!isEditing}
          value={editData.email}
          onChange={(e) =>
            setEditData({ ...editData, email: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          disabled={!isEditing}
          value={editData.phone}
          onChange={(e) =>
            setEditData({ ...editData, phone: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
      </div>

    </div>
  );
}