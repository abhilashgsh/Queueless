"use client";

import { motion } from "framer-motion";
import { Printer, Bell, Shield, Store, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const renderRoleBadge = () => {
    if (!role) return null;
    if (role === "admin") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-semibold uppercase tracking-wider border border-red-500/20">
          <Shield size={12} /> Admin
        </div>
      );
    }
    if (role === "shopkeeper") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-purple-500/20">
          <Store size={12} /> Shopkeeper
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
        <GraduationCap size={12} /> Student
      </div>
    );
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#050505]/60 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_20px_0_rgba(92,107,192,0.5)]">
              <Printer size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Queueless
            </span>
          </Link>
          <div className="hidden sm:block">{renderRoleBadge()}</div>
        </div>
        
        <div className="flex items-center gap-4">
          {role === "student" && (
            <Link href="/shop/register">
              <Button variant="ghost" className="text-xs text-primary hover:text-white border border-primary/30 h-8 font-semibold uppercase tracking-wide">
                Register a Shop
              </Button>
            </Link>
          )}

          {role === "admin" && (
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="text-gray-400 hover:text-white">Admin</Button>
            </Link>
          )}
          {role === "shopkeeper" && (
            <Link href="/shop/dashboard">
              <Button variant="ghost" className="text-gray-400 hover:text-white">Shop</Button>
            </Link>
          )}

          <Link href="/history">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              History
            </Button>
          </Link>
          
          {session ? (
            <Button variant="ghost" className="text-gray-400 hover:text-red-400" onClick={() => signOut({ callbackUrl: "/login" })}>
              Sign Out
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Sign In
              </Button>
            </Link>
          )}

          {session && (
             <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Button>
          )}

          {session && (
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-xs">
                {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
             </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
