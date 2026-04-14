"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/services/api";
import { Users, Store, FileText, CheckCircle, PlusCircle, XCircle, CheckSquare, ShieldCheck, X } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [stats, setStats] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newShopName, setNewShopName] = useState("");
  const [addingShop, setAddingShop] = useState(false);

  // Authorization Check
  if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
    router.replace("/");
    return null;
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchAll();
    }
  }, [status]);

  const fetchAll = async () => {
    try {
      const [statsData, shopsData, ordersData] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/shops"),
        api.get("/admin/orders"),
      ]);
      setStats(statsData);
      setShops(shopsData);
      setOrders(ordersData);
    } catch (e: any) {
      toast.error(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const toggleShopStatus = async (shopId: number, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";
    try {
      await api.put(`/admin/shops/${shopId}/status?status=${newStatus}`);
      setShops((prev) =>
        prev.map((s) => (s.shop_id === shopId ? { ...s, status: newStatus } : s))
      );
      toast.success(`Shop ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch (e: any) {
      toast.error("Failed to change status");
      console.error(e);
    }
  };

  const handleApproval = async (shopId: number, approvalStatus: "approved" | "rejected") => {
    try {
      await api.put(`/admin/shops/${shopId}/approval`, {
        approval_status: approvalStatus,
      });
      setShops((prev) =>
        prev.map((s) => (s.shop_id === shopId ? { ...s, approval_status: approvalStatus, status: approvalStatus === "approved" ? "active" : s.status } : s))
      );
      toast.success(approvalStatus === "approved" ? "Shop approved successfully!" : "Shop rejected.");
      fetchAll(); // refresh stats
    } catch (e: any) {
      toast.error("Failed to process approval");
      console.error(e);
    }
  };

  const handleAddShop = async () => {
    if (!newShopName.trim()) return;
    setAddingShop(true);
    try {
      const created = await api.post("/admin/shops", { name: newShopName.trim(), status: "active", approval_status: "approved" });
      setShops((prev) => [...prev, created]);
      setNewShopName("");
      toast.success("Shop manually added!");
      fetchAll(); // refresh stats too
    } catch (e: any) {
      toast.error("Failed to add shop");
      console.error(e);
    } finally {
      setAddingShop(false);
    }
  };

  const statCards = [
    { label: "Total Orders", value: stats?.total_orders ?? "—", icon: <FileText className="text-blue-600" />, bg: "bg-blue-50" },
    { label: "Total Shops", value: stats?.total_shops ?? "—", icon: <Store className="text-purple-600" />, bg: "bg-purple-50" },
    { label: "Active Shops", value: stats?.active_shops ?? "—", icon: <CheckSquare className="text-orange-600" />, bg: "bg-orange-50" },
    { label: "Orders Ready", value: stats?.orders_ready ?? "—", icon: <CheckCircle className="text-green-600" />, bg: "bg-green-50" },
  ];

  const pendingShops = shops.filter(s => s.approval_status === "pending");
  const approvedShops = shops.filter(s => s.approval_status === "approved");

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading Admin Portal...</div>;
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Super Admin panel — full system visibility</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            key={stat.label}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{loading ? "…" : stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Shop Manually */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PlusCircle className="text-blue-600 w-5 h-5" /> Quick Add Internal Shop
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newShopName}
            onChange={(e) => setNewShopName(e.target.value)}
            placeholder="Shop name e.g. Library Print Center"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleAddShop()}
          />
          <button
            onClick={handleAddShop}
            disabled={addingShop || !newShopName.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl px-5 py-2.5 transition-colors"
          >
            {addingShop ? "Adding…" : "Add Shop"}
          </button>
        </div>
      </div>

      {/* Pending Applications */}
      {pendingShops.length > 0 && (
        <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-amber-200 flex items-center justify-between">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" /> Pending Shop Approvals
            </h3>
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full font-bold">{pendingShops.length} Requires Action</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-100/50 text-left text-xs font-semibold text-amber-800 tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-4">Shop Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-sm">
                {pendingShops.map((shop) => (
                  <tr key={shop.shop_id} className="hover:bg-amber-100/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-amber-900">{shop.name}</td>
                    <td className="px-6 py-4 font-medium text-amber-700">{shop.location}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleApproval(shop.shop_id, "approved")}
                        className="text-white font-medium text-xs rounded-lg px-4 py-2 transition-colors bg-green-500 hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(shop.shop_id, "rejected")}
                        className="text-white font-medium text-xs rounded-lg px-4 py-2 transition-colors bg-red-500 hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Shops Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Approved Platform Shops</h3>
          <span className="text-xs text-gray-400">{approvedShops.length} shops</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4">Shop ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Queue</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : approvedShops.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No approved shops found.</td></tr>
              ) : (
                approvedShops.map((shop) => (
                  <tr key={shop.shop_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{shop.shop_id}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{shop.name}</td>
                    <td className="px-6 py-4 text-blue-600 font-semibold">{shop.current_queue_length} in queue</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        shop.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {shop.status === "active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {shop.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleShopStatus(shop.shop_id, shop.status)}
                        className={`text-white font-medium text-xs rounded-lg px-3 py-1.5 transition-colors ${
                          shop.status === "active"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {shop.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All Orders</h3>
          <span className="text-xs text-gray-400">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Shop</th>
                <th className="px-6 py-4">Copies</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No orders yet.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{order.order_id}</td>
                    <td className="px-6 py-4 text-gray-700">#{order.shop_id}</td>
                    <td className="px-6 py-4 text-gray-700">{order.copies}</td>
                    <td className="px-6 py-4 uppercase text-xs font-semibold text-gray-500">{order.print_type}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">₹{(order.total_cost || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === "ready" ? "bg-green-50 text-green-700"
                          : order.status === "printing" ? "bg-orange-50 text-orange-700"
                          : order.status === "queued" ? "bg-blue-50 text-blue-700"
                          : "bg-gray-50 text-gray-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
