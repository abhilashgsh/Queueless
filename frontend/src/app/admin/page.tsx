"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Users, Printer, LayoutDashboard, MoreVertical, Play, CheckCircle2, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("queue");
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [queue, setQueue] = useState<any[]>([]);

  // Fetch shops
  useEffect(() => {
    fetch("http://127.0.0.1:8000/shops/")
      .then(res => res.json())
      .then(data => {
        setShops(data);
        if (data.length > 0 && !selectedShopId) {
          setSelectedShopId(data[0].shop_id);
        }
      })
      .catch(e => console.error("Failed to load shops", e));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch queue
  const fetchQueue = () => {
    if (selectedShopId) {
      fetch(`http://127.0.0.1:8000/shops/${selectedShopId}/queue`)
        .then(res => res.json())
        .then(data => setQueue(data))
        .catch(e => console.error(e));
    }
  };

  useEffect(() => {
    fetchQueue();
    const inv = setInterval(fetchQueue, 5000);
    return () => clearInterval(inv);
  }, [selectedShopId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchQueue();
    } catch (e) {
      console.error(e);
      alert("Error updating order status.");
    }
  };

  const navItems = [
    { id: "queue", label: "Queue Management", icon: Printer },
    { id: "metrics", label: "Performance", icon: LayoutDashboard },
    { id: "users", label: "Staff", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 hidden md:flex flex-col">
          <div className="p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Print Shops</h2>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white mb-6 outline-none hover:bg-white/10 transition-colors"
              value={selectedShopId || ""}
              onChange={(e) => setSelectedShopId(parseInt(e.target.value))}
            >
              <option disabled value="">Select a shop...</option>
              {shops.map(shop => (
                <option key={shop.shop_id} value={shop.shop_id} className="bg-[#050505] text-white">
                  {shop.name}
                </option>
              ))}
            </select>

            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Menu</h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? "bg-primary/20 text-primary border border-primary/20" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {navItems.find(i => i.id === activeTab)?.label}
                </h1>
                <p className="text-gray-400">View and manage orders for your print shop.</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="border-white/10">Export Log</Button>
                <Button variant="primary">Pause Queue</Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                <p className="text-sm text-gray-400 mb-2">Active Orders</p>
                <p className="text-3xl font-bold text-white">{queue.length}</p>
              </Card>
              <Card className="bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                <p className="text-sm text-gray-400 mb-2">Avg. Processing Time</p>
                <p className="text-3xl font-bold text-white">4m 12s</p>
              </Card>
              <Card className="bg-white/5 border-white/10 p-6 flex flex-col justify-between">
                <p className="text-sm text-gray-400 mb-2">Pending Pages</p>
                <p className="text-3xl font-bold text-white">{queue.reduce((acc, o) => acc + o.copies, 0)}</p>
              </Card>
            </div>

            {/* Queue List */}
            <Card className="border-white/10 p-0 overflow-hidden" glass={false}>
              <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex justify-between items-center">
                <h3 className="font-semibold">Active Print Queue ({shops.find(s => s.shop_id === selectedShopId)?.name})</h3>
                <div className="flex gap-2">
                  <Badge variant="success">{queue.filter(q => q.status === 'printing').length} Printing</Badge>
                  <Badge variant="neutral">{queue.filter(q => q.status === 'queued').length} Waiting</Badge>
                </div>
              </div>
              
              <div className="divide-y divide-white/5">
                {queue.map((item) => (
                  <div key={item.order_id} className="p-4 flex flex-col sm:flex-row gap-4 items-center hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-lg text-primary">
                        #{item.queue_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white">{item.file_path}</p>
                          <Badge variant={item.status === 'printing' ? 'primary' : 'neutral'} className="text-[10px] py-0 h-5">
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          {item.copies} Copies • {item.print_type === 'bw' ? 'B&W' : 'Color'} • ID: {item.order_id} • ${(item.total_cost || 0).toFixed(2)}
                        </p>
                        {item.addons && item.addons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.addons.map((addon: string) => (
                              <Badge key={addon} variant="neutral" className="text-[10px] bg-white/5 border-white/10 text-gray-300 py-0 h-5">
                                {addon}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      {item.status === "queued" && (
                        <Button 
                          variant="outline" 
                          className="flex-1 sm:flex-none border-primary/30 text-primary hover:bg-primary/10 gap-2"
                          size="sm"
                          onClick={() => updateOrderStatus(item.order_id, "printing")}
                        >
                          <Play size={14} /> Start
                        </Button>
                      )}
                      
                      {item.status === "printing" && (
                        <Button 
                          variant="primary" 
                          className="flex-1 sm:flex-none gap-2"
                          size="sm"
                          onClick={() => updateOrderStatus(item.order_id, "ready")}
                        >
                          <CheckCircle2 size={14} /> Mark Ready
                        </Button>
                      )}

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-500 hover:text-red-400"
                        onClick={() => updateOrderStatus(item.order_id, "cancelled")}
                      >
                        <XCircle size={18} />
                      </Button>
                    </div>
                  </div>
                ))}

                {queue.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    No active orders in the queue.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
