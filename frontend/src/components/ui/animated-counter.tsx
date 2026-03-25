"use client";

import { motion, AnimatePresence } from "framer-motion";

export function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden h-[1em] ${className || ""}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
