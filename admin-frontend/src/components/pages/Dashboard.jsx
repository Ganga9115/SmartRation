import { useEffect, useState } from "react";
import { Users, Calendar, Package, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { StatCard } from "../shared/StatCard";
import { adminWelfareAPI, adminShopsAPI, adminStockAPI, adminQueueAPI } from "../../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

export function Dashboard() {
  const [summary, setSummary]         = useState(null);
  const [shops, setShops]             = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [queueData, setQueueData]     = useState(null);
  const [lowStock, setLowStock]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const init = async () => {
      try {
        const [summaryRes, shopsRes, lowRes] = await Promise.all([
          adminWelfareAPI.getSummary(),
          adminShopsAPI.getAll(),
          adminStockAPI.getLowAlert(),
        ]);
        setSummary(summaryRes.data);
        const shopList = shopsRes.data.shops || [];
        setShops(shopList);
        setLowStock(lowRes.data.items || []);
        if (shopList.length > 0) setSelectedShop(shopList[0]);
      } catch (err) {
        console.error("Dashboard init error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch queue when selected shop changes
  useEffect(() => {
    if (!selectedShop) return;
    adminQueueAPI.getStatus(selectedShop.id, today)
      .then(r => setQueueData(r.data))
      .catch(() => {});
  }, [selectedShop]);

  const handleRunChecks = async () => {
    setRunningChecks(true);
    setCheckResult(null);
    try {
      const res = await adminWelfareAPI.runChecks();
      setCheckResult(res.data.results);
      // Refresh summary
      const summaryRes = await adminWelfareAPI.getSummary();
      setSummary(summaryRes.data);
    } catch (err) {
      setCheckResult({ error: err.response?.data?.message || "Failed to run checks" });
    } finally {
      setRunningChecks(false);
    }
  };

  // Build chart data from slot distribution
  const chartData = queueData?.slot_distribution
    ? Object.entries(queueData.slot_distribution).map(([slot, count]) => ({
        slot: slot.slice(0, 5),
        bookings: count,
      })).sort((a, b) => a.slot.localeCompare(b.slot))
    : [];

  const byType = summary?.by_type || {};

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={handleRunChecks}
          disabled={runningChecks}
          className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg hover:bg-[#4a2f5c] disabled:bg-gray-300 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${runningChecks ? "animate-spin" : ""}`} />
          {runningChecks ? "Running..." : "Run Welfare Checks"}
        </button>
      </div>

      {/* Check result banner */}
      {checkResult && !checkResult.error && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <p className="font-semibold mb-1">✅ Welfare checks complete</p>
          <div className="flex flex-wrap gap-4">
            <span>Missed collections: <b>{checkResult.missed_collections?.alertsCreated ?? 0}</b> alerts</span>
            <span>Inactive bookings: <b>{checkResult.inactive_bookings?.alertsCreated ?? 0}</b> alerts</span>
            <span>Low stock: <b>{checkResult.low_stock?.alertsCreated ?? 0}</b> alerts</span>
            <span>Fraud flagged: <b>{checkResult.fraud_users_flagged ?? 0}</b> users</span>
          </div>
        </div>
      )}
      {checkResult?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {checkResult.error}
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Alerts"
            value={summary?.total ?? "—"}
            icon={AlertTriangle}
            trend={`${summary?.unresolved ?? 0} unresolved`}
            trendUp={false}
            iconBgColor="bg-red-100"
            iconColor="text-red-700"
          />
          <StatCard
            title="Fraud Flags"
            value={byType.fraud_flag ?? 0}
            icon={Users}
            trend="Open fraud alerts"
            trendUp={false}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-700"
          />
          <StatCard
            title="Low Stock Shops"
            value={lowStock.length}
            icon={Package}
            trend="Items critically low"
            trendUp={lowStock.length === 0}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-700"
          />
          <StatCard
            title="Today's Queue"
            value={queueData?.total_bookings ?? "—"}
            icon={Calendar}
            trend={selectedShop?.name || "Select a shop"}
            trendUp={true}
            iconBgColor="bg-[#E1D2FF]"
            iconColor="text-[#5E4075]"
          />
        </div>
      )}

      {/* Shop selector + Queue chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Slot Distribution</h3>
            <select
              value={selectedShop?.id || ""}
              onChange={e => setSelectedShop(shops.find(s => s.id === parseInt(e.target.value)))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#5E4075]"
            >
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              No bookings today for this shop
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="slot" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#5E4075" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {queueData && (
            <div className="flex gap-4 mt-3 pt-3 border-t">
              {[
                { label: "Confirmed", value: queueData.queue?.filter(b => b.status === "confirmed").length ?? 0, color: "text-blue-600" },
                { label: "Completed", value: queueData.queue?.filter(b => b.status === "completed").length ?? 0, color: "text-green-600" },
                { label: "Congestion", value: queueData.congestion_level ?? "—", color: "text-[#5E4075]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex-1 text-center">
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Welfare alert breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Alert Breakdown</h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { key: "fraud_flag",         label: "Fraud Flags",          color: "bg-red-500" },
                { key: "missed_collection",  label: "Missed Collections",   color: "bg-blue-500" },
                { key: "inactivity_warning", label: "Inactivity Warnings",  color: "bg-amber-500" },
                { key: "stock_low",          label: "Stock Alerts",         color: "bg-purple-500" },
              ].map(({ key, label, color }) => {
                const count = byType[key] ?? 0;
                const total = summary?.unresolved || 1;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${total > 0 ? Math.min(100, (count / total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Low stock items */}
          {lowStock.length > 0 && (
            <div className="mt-5 pt-4 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Package className="w-4 h-4 text-amber-500" /> Low Stock Items
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {lowStock.map(item => (
                  <div key={item.id} className="flex justify-between text-xs bg-amber-50 px-3 py-1.5 rounded-lg">
                    <span className="text-amber-900 font-medium">{item.item_name}</span>
                    <span className="text-amber-700">{item.available_qty} {item.unit} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}