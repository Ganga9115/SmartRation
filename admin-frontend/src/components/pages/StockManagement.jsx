import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, AlertTriangle, RefreshCw, X, Save, Package } from "lucide-react";
import { adminStockAPI, adminShopsAPI } from "../../utils/api";

const EMPTY_FORM = {
  item_name: "", unit: "kg", total_qty: "", available_qty: "",
  per_family_qty: "", is_optional: false, category: "other",
};

export function StockManagement() {
  const [shops, setShops]           = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [stock, setStock]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null); // null = add, object = edit
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [restockId, setRestockId]   = useState(null);
  const [restockQty, setRestockQty] = useState("");

  useEffect(() => {
    adminShopsAPI.getAll()
      .then(r => {
        const shopList = r.data.shops || [];
        setShops(shopList);
        if (shopList.length > 0) setSelectedShop(shopList[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedShop) return;
    fetchStock();
  }, [selectedShop]);

  const fetchStock = async () => {
    if (!selectedShop) return;
    setLoading(true);
    try {
      const res = await adminStockAPI.getByShop(selectedShop.id);
      setStock(res.data.stock || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      item_name:      item.item_name,
      unit:           item.unit,
      total_qty:      item.total_qty,
      available_qty:  item.available_qty,
      per_family_qty: item.per_family_qty,
      is_optional:    item.is_optional,
      category:       item.category,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.item_name || !form.unit) return setError("Item name and unit are required");
    setSaving(true);
    try {
      if (editItem) {
        await adminStockAPI.update(editItem.id, form);
      } else {
        await adminStockAPI.add({ ...form, shop_id: selectedShop.id });
      }
      setShowModal(false);
      await fetchStock();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this stock item?")) return;
    try {
      await adminStockAPI.delete(id);
      setStock(s => s.filter(i => i.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleRestock = async (id) => {
    if (!restockQty || parseFloat(restockQty) <= 0) return alert("Enter a valid quantity");
    try {
      await adminStockAPI.restock(id, restockQty);
      setRestockId(null);
      setRestockQty("");
      await fetchStock();
    } catch (err) {
      alert(err.response?.data?.message || "Restock failed");
    }
  };

  const getStockStatus = (available, total) => {
    const pct = total > 0 ? (available / total) * 100 : 0;
    if (pct <= 0)  return { label: "Out of Stock", color: "text-red-600",    bg: "bg-red-50",    bar: "bg-red-500" };
    if (pct < 20)  return { label: "Critical",     color: "text-red-600",    bg: "bg-red-50",    bar: "bg-red-500" };
    if (pct < 40)  return { label: "Low Stock",    color: "text-orange-600", bg: "bg-orange-50", bar: "bg-orange-500" };
    return           { label: "Good",            color: "text-green-600",  bg: "bg-green-50",  bar: "bg-[#5E4075]" };
  };

  const lowItems = stock.filter(i => {
    const pct = parseFloat(i.total_qty) > 0
      ? (parseFloat(i.available_qty) / parseFloat(i.total_qty)) * 100 : 0;
    return pct < 20;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage inventory and stock levels</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedShop?.id || ""}
            onChange={e => setSelectedShop(shops.find(s => s.id === parseInt(e.target.value)))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5E4075]"
          >
            {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button
            onClick={openAdd}
            disabled={!selectedShop}
            className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg hover:bg-[#4a2f5c] disabled:bg-gray-300 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900 text-sm">Low Stock Alert</p>
            <p className="text-orange-700 text-sm mt-0.5">
              {lowItems.map(i => i.item_name).join(", ")} — restock needed immediately
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-[#5E4075] mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading stock...</p>
          </div>
        ) : stock.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No stock items for this shop</p>
            <button onClick={openAdd} className="mt-3 text-[#5E4075] font-medium text-sm hover:underline">
              Add the first item →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Item", "Total", "Available", "Per Family", "Status", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stock.map(item => {
                  const avail = parseFloat(item.available_qty);
                  const total = parseFloat(item.total_qty);
                  const status = getStockStatus(avail, total);
                  const pct = total > 0 ? (avail / total) * 100 : 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{item.item_name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.category}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{total} {item.unit}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-700 w-16">{avail} {item.unit}</span>
                          <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${status.bar} rounded-full transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>

                        {/* Inline restock */}
                        {restockId === item.id ? (
                          <div className="flex items-center gap-1.5 mt-2">
                            <input
                              type="number"
                              value={restockQty}
                              onChange={e => setRestockQty(e.target.value)}
                              placeholder="qty"
                              className="w-20 text-xs border rounded px-2 py-1 focus:outline-none focus:border-[#5E4075]"
                            />
                            <button onClick={() => handleRestock(item.id)}
                              className="text-xs bg-[#5E4075] text-white px-2 py-1 rounded hover:bg-[#4a2f5c]">
                              Add
                            </button>
                            <button onClick={() => { setRestockId(null); setRestockQty(""); }}
                              className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setRestockId(item.id)}
                            className="text-xs text-[#5E4075] hover:underline mt-1 block">
                            + Restock
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{item.per_family_qty} {item.unit}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-gray-900 text-lg">{editItem ? "Edit Stock Item" : "Add Stock Item"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Item Name</label>
                  <input value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))}
                    disabled={!!editItem}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5E4075] disabled:bg-gray-50"
                    placeholder="e.g. Rice" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5E4075]">
                    {["kg", "liter", "g", "ml", "piece"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5E4075]">
                    {["grain", "essential", "fuel", "other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {[
                  { key: "total_qty", label: "Total Qty" },
                  { key: "available_qty", label: "Available Qty" },
                  { key: "per_family_qty", label: "Per Family Qty" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <input type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5E4075]"
                      placeholder="0" />
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-4">
                  <input type="checkbox" id="optional" checked={form.is_optional}
                    onChange={e => setForm(f => ({ ...f, is_optional: e.target.checked }))}
                    className="accent-[#5E4075]" />
                  <label htmlFor="optional" className="text-sm text-gray-700">Optional item</label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-[#5E4075] text-white rounded-lg text-sm font-medium hover:bg-[#4a2f5c] disabled:bg-gray-300">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}