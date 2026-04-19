"use client";

import { PwaRegister } from "@/components/pwa-register";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <PwaRegister />
    </ToastProvider>
  );
}
