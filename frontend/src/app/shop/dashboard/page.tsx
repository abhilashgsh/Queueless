"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/services/api";
import { FileText, Printer, CheckCircle, RefreshCcw, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ShopDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [queue, setQueue] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Authorization Check
  if (status === "authenticated" && (session?.user as any)?.role !== "shopkeeper") {
    router.replace("/");
    return null;
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
      const interval = setInterval(fetchData, 8000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [queueData, statsData] = await Promise.all([
        api.get("/shops/dashboard/queue"),
        api.get("/shops/dashboard/stats"),
      ]);
      setQueue(queueData);
      setStats(statsData);
    } catch (e: any) {
      toast.error(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await api.put(`/shops/dashboard/orders/${orderId}/status?status=${status}`);
      toast.success(`Order marked as ${status}`);
      await fetchData();
    } catch (e: any) {
      toast.error("Failed to update status");
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.total_orders ?? "—",
      icon: <FileText className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Completed",
      value: stats?.completed_orders ?? "—",
      icon: <CheckCircle className="text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Active Queue",
      value: queue.length,
      icon: <Printer className="text-orange-600" />,
      bg: "bg-orange-50",
    },
  ];

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading Shop Portal...</div>;
  }

  return (
    <DashboardLayout role="shopkeeper">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage incoming print jobs for your shop
          </p>
        </div>
        <button
          onClick={() => { toast("Refreshing queue...", { icon: '🔄' }); fetchData(); }}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-500 flex items-center gap-2 text-sm"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
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
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {loading ? "…" : stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" /> Active Queue
          </h3>
          <span className="text-xs text-gray-400 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
            {queue.length} item{queue.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4">Queue #</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">File</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading queue…
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-gray-900 font-semibold">All caught up!</h3>
                      <p className="text-gray-400 text-sm">No active orders in your queue.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                queue.map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-2xl font-black text-gray-900">
                        {order.queue_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">
                      {order.file_path?.split("/").pop() || order.file_path}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      <div>{order.copies} copies</div>
                      <div className="uppercase mt-0.5">{order.print_type}</div>
                      <div className="font-medium text-gray-700 mt-0.5">
                        ₹{(order.total_cost || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === "printing"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === "queued" && (
                        <button
                          disabled={updating === order.order_id}
                          onClick={() => updateStatus(order.order_id, "printing")}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg px-4 py-2 transition-colors"
                        >
                          {updating === order.order_id ? "…" : "Start Printing"}
                        </button>
                      )}
                      {order.status === "printing" && (
                        <button
                          disabled={updating === order.order_id}
                          onClick={() => updateStatus(order.order_id, "ready")}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg px-4 py-2 transition-colors"
                        >
                          {updating === order.order_id ? "…" : "Mark Ready ✓"}
                        </button>
                      )}
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
