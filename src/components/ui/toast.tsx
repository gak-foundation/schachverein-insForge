"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// Helper function to add toast without using hook
let toastContext: ToastContextType | null = null;

export function setToastContext(ctx: ToastContextType) {
  toastContext = ctx;
}

export function toast(toastData: Omit<Toast, "id">) {
  if (typeof window !== "undefined" && toastContext) {
    toastContext.addToast(toastData);
  } else {
    // Fallback for server-side
    console.log("Toast:", toastData);
  }
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

const toastIcons = {
  default: null,
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const toastStyles = {
  default: "bg-white border-gray-200 text-gray-900",
  success: "bg-green-50 border-green-200 text-green-900",
  error: "bg-red-50 border-red-200 text-red-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const Icon = toast.variant ? toastIcons[toast.variant] : null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg min-w-[300px] max-w-[400px] animate-in slide-in-from-right-4",
        toast.variant ? toastStyles[toast.variant] : toastStyles.default
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <div className="flex-1">
        <p className="font-medium text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-sm opacity-90 mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 rounded-full p-1 hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
