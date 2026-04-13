"use client";

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
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}