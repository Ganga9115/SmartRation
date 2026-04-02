import { useEffect, useState } from "react";
import { Bell, Shield, Clock, Package, RefreshCw, CheckCheck, AlertCircle } from "lucide-react";
import { adminWelfareAPI } from "../../utils/api";

const ALERT_CONFIG = {
  missed_collection:     { icon: Bell,          bg: "bg-blue-50",   color: "text-blue-700",   label: "Missed Collection" },
  booking_reminder_1day: { icon: Bell,          bg: "bg-blue-50",   color: "text-blue-700",   label: "Reminder (1 Day)" },
  booking_reminder_1hr:  { icon: Bell,          bg: "bg-blue-50",   color: "text-blue-700",   label: "Reminder (1 Hour)" },
  booking_confirmed:     { icon: AlertCircle,   bg: "bg-purple-50", color: "text-purple-700", label: "Booking Confirmed" },
  collection_missed:     { icon: Clock,         bg: "bg-amber-50",  color: "text-amber-700",  label: "Collection Missed" },
  inactivity_warning:    { icon: Clock,         bg: "bg-amber-50",  color: "text-amber-700",  label: "Inactivity Warning" },
  fraud_flag:            { icon: Shield,        bg: "bg-red-50",    color: "text-red-700",    label: "Fraud Flag" },
  stock_low:             { icon: Package,       bg: "bg-green-50",  color: "text-green-700",  label: "Stock Alert" },
};

const TABS = ["All", "fraud_flag", "missed_collection", "inactivity_warning", "stock_low"];

export function WelfareAlerts() {
  const [alerts, setAlerts]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [resolving, setResolving] = useState(null);
  const [bulkResolving, setBulkResolving] = useState(false);
  const [selected, setSelected]   = useState(new Set());

  const fetchAlerts = async (p = 1, tab = activeTab) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 20, resolved: false };
      if (tab !== "All") params.type = tab;
      const res = await adminWelfareAPI.getAlerts(params);
      setAlerts(res.data.alerts || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
      setPage(p);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(1, activeTab); }, [activeTab]);

  const handleResolve = async (id) => {
    setResolving(id);
    try {
      await adminWelfareAPI.resolveAlert(id);
      setAlerts(a => a.filter(x => x.id !== id));
      setTotal(t => t - 1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resolve");
    } finally {
      setResolving(null);
    }
  };

  const handleResolveBulk = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    setBulkResolving(true);
    try {
      await adminWelfareAPI.resolveBulk(ids);
      setAlerts(a => a.filter(x => !selected.has(x.id)));
      setTotal(t => t - ids.length);
      setSelected(new Set());
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setBulkResolving(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welfare Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">{total} unresolved alerts</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleResolveBulk}
              disabled={bulkResolving}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300"
            >
              <CheckCheck className="w-4 h-4" />
              {bulkResolving ? "Resolving..." : `Resolve ${selected.size} selected`}
            </button>
          )}
          <button onClick={() => fetchAlerts(1, activeTab)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => {
          const cfg = tab !== "All" ? ALERT_CONFIG[tab] : null;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#5E4075] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#5E4075]"
              }`}
            >
              {tab === "All" ? "All Alerts" : (cfg?.label || tab)}
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border h-20 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <CheckCheck className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500">No unresolved alerts in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const cfg  = ALERT_CONFIG[alert.alert_type] || { icon: Bell, bg: "bg-gray-50", color: "text-gray-600", label: "Alert" };
            const Icon = cfg.icon;
            const isSelected = selected.has(alert.id);

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-all ${
                  isSelected ? "border-[#5E4075] bg-[#faf8ff]" : "hover:border-gray-300"
                }`}
              >
                {/* Checkbox */}
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(alert.id)}
                  className="mt-1 accent-[#5E4075]" />

                {/* Icon */}
                <div className={`${cfg.bg} ${cfg.color} p-2.5 rounded-xl flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{alert.message}</p>
                      <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                        {alert.User && <span>👤 {alert.User.name} · {alert.User.phone}</span>}
                        {alert.RationCard && <span>🪪 {alert.RationCard.card_number}</span>}
                        <span>🕐 {timeAgo(alert.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolving === alert.id}
                      className="flex-shrink-0 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-50 font-medium"
                    >
                      {resolving === alert.id ? "..." : "Resolve"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Page {page} of {totalPages} · {total} total</p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchAlerts(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >Prev</button>
            <button
              onClick={() => fetchAlerts(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}