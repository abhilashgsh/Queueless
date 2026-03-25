"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyRes, shopsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/orders/user/user123"),
          fetch("http://127.0.0.1:8000/shops/")
        ]);
        
        if (historyRes.ok && shopsRes.ok) {
          const historyData = await historyRes.json();
          const shopsData = await shopsRes.json();
          
          const shopMap = shopsData.reduce((acc: any, shop: any) => {
            acc[shop.shop_id] = shop.name;
            return acc;
          }, {});

          setHistory(historyData.map((o: any) => ({
            id: o.order_id,
            date: new Date(o.created_at).toLocaleString(),
            shop: shopMap[o.shop_id] || `Shop #${o.shop_id}`,
            items: `${o.copies} Copies, ${o.print_type.toUpperCase()}`,
            status: o.status,
            amount: `$${(o.copies * (o.print_type === 'bw' ? 0.10 : 0.50)).toFixed(2)}`
          })));
        }
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(o => 
    o.id.toString().includes(search) || o.status.includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
            <p className="text-gray-400">View and manage your past print jobs.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Search orders..." 
                className="pl-9 bg-white/5 border-white/10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="border-white/10 text-gray-400 hover:text-white">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden p-0 border-white/10" glass={false}>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading Order History...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0a0a0a] border-b border-white/10 text-gray-400 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Print Shop</th>
                    <th className="px-6 py-4 font-medium hidden sm:table-cell">Details</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#050505]">
                  {filteredHistory.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-mono font-medium text-white">#{order.id}</td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{order.date}</td>
                      <td className="px-6 py-4 text-gray-300">{order.shop}</td>
                      <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">{order.items}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={
                            order.status === 'completed' ? 'neutral' : 
                            order.status === 'ready' ? 'success' : 'danger'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-white">{order.amount}</td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <Link href={`/track?order_id=${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary transition-colors">
                            <Download className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
