import { Calendar, Filter, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";

const bookings = [
  {
    id: 1,
    bookingDate: "2024-01-29",
    userName: "Priya Sharma",
    rationCardId: "MH1234567890",
    items: ["Rice (5kg)", "Wheat (4kg)", "Sugar (2kg)"],
    status: "confirmed",
    slotTime: "10:00 AM - 11:00 AM",
    phone: "+91 98765 43210",
  },
  {
    id: 2,
    bookingDate: "2024-01-29",
    userName: "Amit Patel",
    rationCardId: "MH1234567891",
    items: ["Rice (5kg)", "Dal (2kg)", "Oil (1L)"],
    status: "confirmed",
    slotTime: "11:00 AM - 12:00 PM",
    phone: "+91 98765 43211",
  },
  {
    id: 3,
    bookingDate: "2024-01-29",
    userName: "Lakshmi Iyer",
    rationCardId: "MH1234567892",
    items: ["Wheat (4kg)", "Sugar (2kg)", "Salt (1kg)"],
    status: "pending",
    slotTime: "02:00 PM - 03:00 PM",
    phone: "+91 98765 43212",
  },
  {
    id: 4,
    bookingDate: "2024-01-28",
    userName: "Rahul Verma",
    rationCardId: "MH1234567893",
    items: ["Rice (5kg)", "Wheat (4kg)", "Dal (2kg)", "Oil (1L)"],
    status: "completed",
    slotTime: "09:00 AM - 10:00 AM",
    phone: "+91 98765 43213",
  },
  {
    id: 5,
    bookingDate: "2024-01-29",
    userName: "Sunita Desai",
    rationCardId: "MH1234567894",
    items: ["Rice (5kg)", "Sugar (2kg)"],
    status: "confirmed",
    slotTime: "03:00 PM - 04:00 PM",
    phone: "+91 98765 43214",
  },
  {
    id: 6,
    bookingDate: "2024-01-28",
    userName: "Anjali Singh",
    rationCardId: "MH1234567896",
    items: ["Wheat (4kg)", "Dal (2kg)"],
    status: "cancelled",
    slotTime: "01:00 PM - 02:00 PM",
    phone: "+91 98765 43216",
  },
  {
    id: 7,
    bookingDate: "2024-01-30",
    userName: "Ramesh Nair",
    rationCardId: "MH1234567897",
    items: ["Rice (5kg)", "Wheat (4kg)", "Oil (1L)"],
    status: "confirmed",
    slotTime: "10:00 AM - 11:00 AM",
    phone: "+91 98765 43217",
  },
];

export function Bookings() {
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filterStatus);

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "cancelled":
        return "bg-red-50 text-red-700";
      case "completed":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

return (
  <div className="space-y-6">
    
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Bookings</h1>
    </div>

    {/* Filters */}
    <div className="flex gap-2">
      {["all", "confirmed", "pending", "completed", "cancelled"].map((status) => (
        <button
          key={status}
          onClick={() => setFilterStatus(status)}
          className={`px-3 py-1 rounded ${
            filterStatus === status ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
        >
          {status}
        </button>
      ))}
    </div>

    {/* Table */}
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Items</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredBookings.map((booking) => (
            <tr key={booking.id} className="border-t">
              <td className="p-3">{booking.userName}</td>
              <td className="p-3">{booking.bookingDate}</td>
              <td className="p-3">
                {booking.items.join(", ")}
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded ${getStatusStyle(booking.status)}`}>
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
);
}