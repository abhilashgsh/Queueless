"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/services/api";
import { RefreshCcw } from "lucide-react";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") { router.replace("/login"); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.get("/admin/orders");
      setOrders(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
          <p className="text-sm text-gray-500 mt-1">System-wide order history</p>
        </div>
        <button onClick={fetchOrders} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm text-gray-500 flex items-center gap-2 text-sm transition-colors">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Shop</th>
                <th className="px-6 py-4">File</th>
                <th className="px-6 py-4">Copies</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-400">No orders yet.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.order_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-700">{o.order_id}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{o.user_id}</td>
                  <td className="px-6 py-4 text-gray-700">#{o.shop_id}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs max-w-xs truncate">{o.file_path?.split("/").pop()}</td>
                  <td className="px-6 py-4 text-gray-700">{o.copies}</td>
                  <td className="px-6 py-4 font-semibold uppercase text-xs text-gray-500">{o.print_type}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">₹{(o.total_cost || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      o.status === "ready" ? "bg-green-50 text-green-700"
                      : o.status === "printing" ? "bg-orange-50 text-orange-700"
                      : o.status === "queued" ? "bg-blue-50 text-blue-700"
                      : "bg-gray-50 text-gray-600"
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(o.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
