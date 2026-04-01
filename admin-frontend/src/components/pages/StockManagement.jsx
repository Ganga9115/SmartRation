import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";

const initialStock = [
  { id: 1, name: "Rice", totalQuantity: 500, availableQuantity: 420, unit: "kg", perFamilyLimit: 5 },
  { id: 2, name: "Wheat", totalQuantity: 400, availableQuantity: 380, unit: "kg", perFamilyLimit: 4 },
  { id: 3, name: "Sugar", totalQuantity: 200, availableQuantity: 145, unit: "kg", perFamilyLimit: 2 },
  { id: 4, name: "Cooking Oil", totalQuantity: 150, availableQuantity: 95, unit: "L", perFamilyLimit: 1 },
  { id: 5, name: "Dal (Toor)", totalQuantity: 180, availableQuantity: 35, unit: "kg", perFamilyLimit: 2 },
  { id: 6, name: "Dal (Moong)", totalQuantity: 160, availableQuantity: 125, unit: "kg", perFamilyLimit: 2 },
  { id: 7, name: "Salt", totalQuantity: 100, availableQuantity: 75, unit: "kg", perFamilyLimit: 1 },
  { id: 8, name: "Kerosene", totalQuantity: 120, availableQuantity: 15, unit: "L", perFamilyLimit: 3 },
];

export function StockManagement() {
  const [stock, setStock] = useState(initialStock);

  const getStockStatus = (available, total) => {
    const percentage = (available / total) * 100;

    if (percentage < 20)
      return { status: "critical", color: "text-red-600", bg: "bg-red-50" };

    if (percentage < 40)
      return { status: "low", color: "text-orange-600", bg: "bg-orange-50" };

    return { status: "good", color: "text-green-600", bg: "bg-green-50" };
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Manage inventory and stock levels</p>
        </div>

        <button className="flex items-center gap-2 bg-[#5E4075] text-white px-4 py-2 rounded-lg hover:bg-[#4a2f5c]">
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Alert */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <div>
          <p className="font-medium text-orange-900">Low Stock Alert</p>
          <p className="text-sm text-orange-700">
            Some items are running low. Please restock soon.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs">Item</th>
                <th className="px-6 py-3 text-left text-xs">Total</th>
                <th className="px-6 py-3 text-left text-xs">Available</th>
                <th className="px-6 py-3 text-left text-xs">Limit</th>
                <th className="px-6 py-3 text-left text-xs">Status</th>
                <th className="px-6 py-3 text-left text-xs">Actions</th>
              </tr>
            </thead>

            <tbody>
              {stock.map((item) => {
                const status = getStockStatus(
                  item.availableQuantity,
                  item.totalQuantity
                );

                return (
                  <tr key={item.id} className="hover:bg-gray-50">

                    <td className="px-6 py-4 font-medium">
                      {item.name}
                    </td>

                    <td className="px-6 py-4">
                      {item.totalQuantity} {item.unit}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">

                        <span>
                          {item.availableQuantity} {item.unit}
                        </span>

                        <div className="w-24 h-2 bg-gray-200 rounded">
                          <div
                            className={`h-full ${
                              status.status === "critical"
                                ? "bg-red-500"
                                : status.status === "low"
                                ? "bg-orange-500"
                                : "bg-[#5E4075]"
                            }`}
                            style={{
                              width: `${
                                (item.availableQuantity / item.totalQuantity) * 100
                              }%`,
                            }}
                          />
                        </div>

                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {item.perFamilyLimit} {item.unit}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${status.bg} ${status.color}`}>
                        {status.status === "critical"
                          ? "Critical"
                          : status.status === "low"
                          ? "Low Stock"
                          : "Good"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded">
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
      </div>
    </div>
  );
}