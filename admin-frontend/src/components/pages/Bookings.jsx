import { useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { adminQueueAPI, adminShopsAPI } from "../../utils/api";

const STATUS_CONFIG = {
  confirmed:  { color: "text-blue-700",  bg: "bg-blue-50",   icon: Clock,         label: "Confirmed" },
  completed:  { color: "text-green-700", bg: "bg-green-50",  icon: CheckCircle,   label: "Completed" },
  cancelled:  { color: "text-red-700",   bg: "bg-red-50",    icon: XCircle,       label: "Cancelled" },
  pending:    { color: "text-amber-700", bg: "bg-amber-50",  icon: AlertCircle,   label: "Pending" },
  no_show:    { color: "text-gray-500",  bg: "bg-gray-100",  icon: XCircle,       label: "No Show" },
};

export function Bookings() {
  const [shops, setShops]           = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [date, setDate]             = useState(new Date().toISOString().split("T")[0]);
  const [queueData, setQueueData]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    adminShopsAPI.getAll().then(r => {
      const shopList = r.data.shops || [];
      setShops(shopList);
      if (shopList.length > 0) setSelectedShop(shopList[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedShop) fetchQueue();
  }, [selectedShop, date]);

  const fetchQueue = async () => {
    if (!selectedShop) return;
    setLoading(true);
    try {
      const res = await adminQueueAPI.getStatus(selectedShop.id, date);
      setQueueData(res.data);
    } catch (err) {
      console.error(err.message);
      setQueueData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const res = await adminQueueAPI.callNext(selectedShop.id, date);
      alert(`Token #${res.data.token_number} called!`);
      await fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || "No more tokens in queue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkServed = async (tokenNumber) => {
    setActionLoading(true);
    try {
      await adminQueueAPI.markServed(selectedShop.id, tokenNumber, date);
      await fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark served");
    } finally {
      setActionLoading(false);
    }
  };

  const bookings = queueData?.queue || [];
  const summary  = queueData?.summary || {};

  const filtered = filterStatus === "all"
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Bookings & Queue</h1>
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedShop?.id || ""}
            onChange={e => setSelectedShop(shops.find(s => s.id === parseInt(e.target.value)))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5E4075]"
          >
            {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5E4075]"
          />
          <button onClick={fetchQueue}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: summary.total     || 0, color: "text-gray-900" },
          { label: "Confirmed", value: summary.confirmed || 0, color: "text-blue-600" },
          { label: "Completed", value: summary.completed || 0, color: "text-green-600" },
          { label: "No Show",   value: summary.no_show   || 0, color: "text-gray-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border shadow-sm text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Queue controls */}
      <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700">Queue Controls</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Congestion: <span className="font-medium capitalize">{queueData?.congestion_level || "—"}</span>
            {queueData?.peak_slot && <> · Peak slot: <span className="font-medium">{queueData.peak_slot?.slice(0,5)}</span></>}
          </p>
        </div>
        <button
          onClick={handleCallNext}
          disabled={actionLoading || !selectedShop}
          className="flex items-center gap-2 bg-[#5E4075] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#4a2f5c] disabled:bg-gray-300 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
          Call Next Token
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "confirmed", "completed", "cancelled", "no_show"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filterStatus === status
                ? "bg-[#5E4075] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#5E4075] hover:text-[#5E4075]"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-[#5E4075] mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading queue...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No bookings found for the selected filter
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Token", "Slot Time", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(booking => {
                const cfg  = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#5E4075] text-lg">#{booking.token_number}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      {booking.slot_time?.slice(0, 5)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleMarkServed(booking.token_number)}
                          disabled={actionLoading}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors font-medium"
                        >
                          Mark Served
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}