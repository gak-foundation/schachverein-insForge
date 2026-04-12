"use client";

import { motion } from "framer-motion";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      {/* Animated Chess Piece Logo */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/30 to-violet-500/30 blur-xl"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Chess piece container */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
          {/* Chess Knight SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-10 w-10 text-white"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8.5 16.5c-1-3.5 1.5-6 2-10" />
            <path d="M12.5 6.5c1 4-1 7-1.5 10" />
            <path d="M6 21h12" />
            <path d="M6 21l2-4.5h8l2 4.5" />
            <path d="M7.5 4c1.5-1 4.5-1 5.5 0" />
            <path d="M10 6.5c-1-1 0-2 1-2" />
            <circle cx="10" cy="4" r="0.5" fill="currentColor" />
          </svg>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-400">{subtitle}</p>
        )}
      </motion.div>
    </div>
  );
}
