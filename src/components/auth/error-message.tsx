"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message?: string | null;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  onDismiss,
  className,
}: ErrorMessageProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          role="alert"
          aria-live="polite"
          className={cn(
            "relative overflow-hidden rounded-xl",
            "border border-red-500/30 bg-red-500/10",
            "px-4 py-3",
            className
          )}
        >
          {/* Animated background pulse */}
          <motion.div
            className="absolute inset-0 bg-red-500/5"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Content */}
          <div className="relative flex items-start gap-3">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20"
            >
              <AlertCircle className="h-4 w-4 text-red-400" />
            </motion.div>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex-1 text-sm leading-relaxed text-red-200"
            >
              {message}
            </motion.p>

            {/* Dismiss button */}
            {onDismiss && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDismiss}
                type="button"
                aria-label="Fehlermeldung schließen"
                className={cn(
                  "shrink-0 p-1 rounded-lg",
                  "text-red-400 hover:text-red-200",
                  "hover:bg-red-500/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50",
                  "transition-colors duration-150"
                )}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0"
            initial={{ width: "0%", x: "0%" }}
            animate={{ width: "100%", x: "0%" }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: "easeOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
