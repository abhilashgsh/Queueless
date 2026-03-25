"use client";

import { motion } from "framer-motion";
import { Printer, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#050505]/60 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_20px_0_rgba(92,107,192,0.5)]">
            <Printer size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Queueless
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/history">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Order History
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 border border-white/10" />
        </div>
      </div>
    </motion.header>
  );
}
