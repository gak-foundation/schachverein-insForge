"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl"
    >
      {/* Glassmorphism shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
      
      {/* Subtle border gradient */}
      <div className="absolute inset-0 rounded-2xl border border-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none" />

      {children}
    </motion.div>
  );
}
