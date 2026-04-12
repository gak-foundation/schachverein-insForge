"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialButtonsProps {
  onGithubClick?: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function SocialButtons({
  onGithubClick,
  disabled = false,
  className,
}: SocialButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubClick = async () => {
    if (!onGithubClick || isLoading || disabled) return;
    setIsLoading(true);
    try {
      await onGithubClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0A0F1C] px-2 text-slate-500">
            Oder weiter mit
          </span>
        </div>
      </div>

      {/* GitHub Button */}
      <motion.button
        type="button"
        onClick={handleGithubClick}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative flex h-11 w-full items-center justify-center gap-3",
          "rounded-xl border border-white/10 bg-white/5",
          "text-sm font-medium text-white",
          "hover:border-white/20 hover:bg-white/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-200",
          "overflow-hidden"
        )}
      >
        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.5 }}
        />

        {/* Icon */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
              >
                <Loader2 className="h-5 w-5 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="github"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group-hover:scale-110 transition-transform duration-200"
              >
                <Github className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Button text */}
        <span className="relative">
          {isLoading ? "Wird verbunden..." : "GitHub"}
        </span>
      </motion.button>
    </div>
  );
}
