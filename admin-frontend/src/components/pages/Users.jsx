import { Search, Filter, Download, Eye } from "lucide-react";
import { useState } from "react";

const users = [
  {
    id: 1,
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    rationCardId: "MH1234567890",
    familyMembers: 4,
    status: "active",
    lastVisit: "2024-01-28",
  },
  {
    id: 2,
    name: "Amit Patel",
    phone: "+91 98765 43211",
    rationCardId: "MH1234567891",
    familyMembers: 5,
    status: "active",
    lastVisit: "2024-01-27",
  },
  {
    id: 3,
    name: "Lakshmi Iyer",
    phone: "+91 98765 43212",
    rationCardId: "MH1234567892",
    familyMembers: 3,
    status: "active",
    lastVisit: "2024-01-26",
  },
  {
    id: 4,
    name: "Rahul Verma",
    phone: "+91 98765 43213",
    rationCardId: "MH1234567893",
    familyMembers: 6,
    status: "active",
    lastVisit: "2024-01-25",
  },
  {
    id: 5,
    name: "Sunita Desai",
    phone: "+91 98765 43214",
    rationCardId: "MH1234567894",
    familyMembers: 4,
    status: "active",
    lastVisit: "2024-01-28",
  },
  {
    id: 6,
    name: "Vijay Kumar",
    phone: "+91 98765 43215",
    rationCardId: "MH1234567895",
    familyMembers: 2,
    status: "inactive",
    lastVisit: "2024-01-15",
  },
  {
    id: 7,
    name: "Anjali Singh",
    phone: "+91 98765 43216",
    rationCardId: "MH1234567896",
    familyMembers: 5,
    status: "active",
    lastVisit: "2024-01-27",
  },
  {
    id: 8,
    name: "Ramesh Nair",
    phone: "+91 98765 43217",
    rationCardId: "MH1234567897",
    familyMembers: 3,
    status: "active",
    lastVisit: "2024-01-28",
  },
];

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rationCardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
          <p className="text-gray-600 mt-1">
            Manage ration card holders and their details
          </p>
        </div>

        <button className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg">
          <Download className="w-5 h-5" />
          Export Users
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <Filter className="w-5 h-5" />
            Filters
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs">Name</th>
              <th className="px-6 py-3 text-left text-xs">Phone</th>
              <th className="px-6 py-3 text-left text-xs">Card ID</th>
              <th className="px-6 py-3 text-left text-xs">Family</th>
              <th className="px-6 py-3 text-left text-xs">Last Visit</th>
              <th className="px-6 py-3 text-left text-xs">Status</th>
              <th className="px-6 py-3 text-left text-xs">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">

                <td className="px-6 py-4 font-medium">
                  {user.name}
                </td>

                <td className="px-6 py-4">
                  {user.phone}
                </td>

                <td className="px-6 py-4">
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {user.rationCardId}
                  </code>
                </td>

                <td className="px-6 py-4">
                  {user.familyMembers}
                </td>

                <td className="px-6 py-4">
                  {user.lastVisit}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      user.status === "active"
                        ? "bg-[#E1D2FF] text-[#5E4075]"
                        : "bg-gray-100"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between bg-white p-4 rounded-xl border">
        <p className="text-sm">
          Showing {filteredUsers.length} of {users.length}
        </p>

        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded">Prev</button>
          <button className="px-4 py-2 bg-[#5E4075] text-white rounded">1</button>
          <button className="px-4 py-2 border rounded">Next</button>
        </div>
      </div>

    </div>
  );
}