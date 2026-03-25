"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Settings, History, Printer, LogOut } from "lucide-react";

export function AdminSidebar() {
  const links = [
    { name: "Live Queue", href: "/admin", icon: LayoutDashboard },
    { name: "Order History", href: "/admin/history", icon: History },
    { name: "Printers", href: "/admin/printers", icon: Printer },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-[#050505] p-4 flex flex-col z-50">
      <div className="flex items-center gap-2 px-2 py-4 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <Printer size={18} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Queueless Admin</span>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link, idx) => (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              idx === 0 
                ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(92,107,192,0.1)] border border-primary/20" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <link.icon size={20} />
            <span className="font-medium text-sm">{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-white/5">
          <LogOut size={20} />
          <span className="font-medium text-sm">Sign out</span>
        </div>
      </div>
    </div>
  );
}
