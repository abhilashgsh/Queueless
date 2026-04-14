"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut, BarChart3, Store, FileText, Home,
  Printer, Settings, ClipboardList,
} from "lucide-react";

export default function DashboardLayout({
  children,
  role,
}: {
  children: ReactNode;
  role: "admin" | "shopkeeper";
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const adminLinks = [
    { label: "Overview", href: "/admin/dashboard", icon: BarChart3 },
    { label: "Orders", href: "/admin/orders", icon: FileText },
  ];

  const shopkeeperLinks = [
    { label: "Live Queue", href: "/shop/dashboard", icon: ClipboardList },
    { label: "Settings", href: "/shop/settings", icon: Settings },
  ];

  const links = role === "admin" ? adminLinks : shopkeeperLinks;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shadow-sm shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Printer className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">Queueless</span>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </div>
              </Link>
            );
          })}

          {/* Back to main site */}
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all mt-4">
              <Home className="w-4 h-4 shrink-0" />
              Main Site
            </div>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
