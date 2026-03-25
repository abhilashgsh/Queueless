"use client";

import { Clock, Users, ArrowRight } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AnimatedCounter } from "./ui/animated-counter";
import Link from "next/link";
import { motion } from "framer-motion";

export interface ShopData {
  id: string;
  name: string;
  location: string;
  status: "Open" | "Busy" | "Closed";
  queueLength: number;
  waitTimeMins: number;
}

export function ShopCard({ shop, index }: { shop: ShopData; index: number }) {
  const statusColor = 
    shop.status === "Open" ? "success" 
    : shop.status === "Busy" ? "warning" 
    : "danger";

  // Simulate live updates for UI effect
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card hover className="group flex flex-col h-full relative overflow-hidden">
        {/* Subtle background glow effect based on status */}
        <div className={`absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000 ${
          shop.status === 'Open' ? 'bg-success' : shop.status === 'Busy' ? 'bg-warning' : 'bg-danger'
        }`} />

        <div className="flex justify-between items-start mb-6 z-10">
          <div>
            <h3 className="text-xl font-semibold mb-1">{shop.name}</h3>
            <p className="text-sm text-gray-400">{shop.location}</p>
          </div>
          <Badge variant={statusColor as any}>{shop.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 z-10 flex-grow">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-center">
            <Users className="text-primary mb-2" size={20} />
            <div className="text-2xl font-bold font-mono">
              <AnimatedCounter value={shop.queueLength} />
            </div>
            <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">In Queue</span>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-center">
            <Clock className="text-primary mb-2" size={20} />
            <div className="text-2xl font-bold font-mono">{shop.waitTimeMins}m</div>
            <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Est. Wait</span>
          </div>
        </div>

        <Link href={`/upload?shop=${shop.id}`} className="z-10 mt-auto">
          <Button variant="primary" className="w-full flex justify-between items-center group-hover:glow transition-all" disabled={shop.status === "Closed"}>
            <span>Select Shop</span>
            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
