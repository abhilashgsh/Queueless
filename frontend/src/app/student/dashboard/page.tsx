"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { ShopCard, ShopData } from "@/components/ShopCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Search, RefreshCw, WifiOff } from "lucide-react";
import { useSession } from "next-auth/react";

const API_URL = "http://127.0.0.1:8000";

export default function StudentDashboard() {
  const router = useRouter();
  const [trackId, setTrackId] = useState("");
  const [shops, setShops] = useState<ShopData[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendDown, setBackendDown] = useState(false);

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    }
  });

  const fetchShops = async () => {
    try {
      const response = await fetch(`${API_URL}/shops/`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        const mappedShops = data.map((s: any) => ({
          id: s.shop_id.toString(),
          name: s.name,
          location: "Campus",
          status: s.status === "active"
            ? (s.current_queue_length > 10 ? "Busy" : "Open")
            : "Closed",
          queueLength: s.current_queue_length,
          waitTimeMins: s.current_queue_length * 2,
        }));
        setShops(mappedShops);
        setBackendDown(false);
      }
    } catch (e) {
      console.warn("[Queueless] Backend unreachable:", e);
      setBackendDown(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveOrders = async () => {
    if (!session?.user?.email) return;
    
    try {
      const res = await fetch(`${API_URL}/orders/user/${session.user.email}`, {
        cache: "no-store",
        headers: {
          "Authorization": `Bearer ${(session as any).accessToken}`
        },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveOrders(
          data.filter((o: any) =>
            ["queued", "printing", "ready"].includes(o.status)
          )
        );
      }
    } catch (e) {
      console.warn("[Queueless] Could not fetch active orders:", e);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchShops();
      fetchActiveOrders();
      const interval = setInterval(() => {
        fetchShops();
        fetchActiveOrders();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [status, session]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading Dashboard...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 hidden md:block">
              Smart Queue <span className="text-gradient">Management</span>
            </h1>
            <p className="text-gray-400 md:text-lg max-w-2xl">
              Upload your documents from anywhere and get automatically routed
              to the fastest available print shop on campus.
            </p>
          </div>

          <div className="glass p-4 rounded-xl flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
            {backendDown ? (
              <>
                <WifiOff className="text-danger" size={14} />
                <span className="text-sm font-medium text-danger">Backend Offline</span>
                <button onClick={fetchShops} className="ml-2 text-xs text-gray-400 hover:text-white underline flex items-center gap-1">
                  <RefreshCw size={12}/> Retry
                </button>
              </>
            ) : (
              <>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </div>
                <span className="text-sm font-medium">Live Activity Tracked</span>
              </>
            )}
          </div>
        </motion.div>

        <div className="mb-12 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-primary" size={20} /> Your Active Orders
            </h2>
            {activeOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOrders.map((order) => (
                  <Link
                    href={`/track?order_id=${order.order_id}`}
                    key={order.order_id}
                  >
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 hover:bg-primary/20 transition-colors flex justify-between items-center group cursor-pointer h-full">
                      <div>
                        <p className="font-medium text-white">
                          Order #{order.order_id}
                        </p>
                        <p className="text-sm text-gray-400 capitalize">
                          {order.status} •{" "}
                          {shops.find(
                            (s) => s.id === order.shop_id.toString()
                          )?.name || `Shop ${order.shop_id}`}{" "}
                          • Pos #{order.queue_number}
                        </p>
                      </div>
                      <ArrowRight
                        className="text-primary transform group-hover:translate-x-1 transition-transform"
                        size={20}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-400">
                No active orders found. Upload a document to get started.
              </div>
            )}
          </div>

          <div className="lg:w-1/3">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search className="text-primary" size={20} /> Track Any Order
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-[calc(100%-2.5rem)] flex flex-col justify-center">
              <p className="text-sm text-gray-400 mb-4">
                Enter your order ID to check real-time queue status.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. A1B2C3"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 uppercase"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && trackId) {
                      let id = trackId.trim();
                      if (!id.startsWith("ORD-")) id = "ORD-" + id;
                      router.push(`/track?order_id=${id}`);
                    }
                  }}
                />
                <button
                  className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => {
                    if (trackId) {
                      let id = trackId.trim();
                      if (!id.startsWith("ORD-")) id = "ORD-" + id;
                      router.push(`/track?order_id=${id}`);
                    }
                  }}
                >
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shops grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">
            Connecting to Live Servers...
          </div>
        ) : backendDown ? (
          <div className="text-center py-20 text-gray-500">
            <WifiOff className="mx-auto mb-4 text-danger" size={40} />
            <p className="text-lg text-white font-semibold mb-2">Backend is offline</p>
            <p className="text-sm text-gray-400 mb-4">
              Make sure <code className="text-primary">uvicorn main:app --reload</code> is running in the backend folder.
            </p>
            <button
              onClick={fetchShops}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg text-white font-semibold mb-2">No shops found</p>
            <p className="text-sm text-gray-400">
              Run{" "}
              <a
                href="http://127.0.0.1:8000/force-refresh-db"
                target="_blank"
                className="text-primary underline"
              >
                /force-refresh-db
              </a>{" "}
              to seed initial data.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {shops.map((shop, i) => (
              <ShopCard key={shop.id} shop={shop} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
