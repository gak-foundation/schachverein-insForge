"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Ein Konfigurationsfehler ist aufgetreten.",
  AccessDenied: "Zugriff verweigert.",
  Verification: "Die Verifizierung ist fehlgeschlagen.",
  Default: "Ein Fehler ist aufgetreten.",
  AUTH_INVALID_CREDENTIALS: "Ungültige Anmeldedaten.",
  AUTH_EMAIL_NOT_VERIFIED: "E-Mail nicht verifiziert.",
  AUTH_ACCOUNT_LOCKED: "Account gesperrt. Bitte versuchen Sie es später erneut.",
  RATE_LIMITED: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20"
      >
        <XCircle className="h-10 w-10 text-red-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold text-white">Fehler</h1>
        <p className="text-slate-300">{message}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-3 pt-4"
      >
        <Link href="/auth/login">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-violet-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zum Login
          </Button>
        </Link>
        
        <Link href="/">
          <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
            <Home className="mr-2 h-4 w-4" />
            Zur Startseite
          </Button>
        </Link>
      </motion.div>
    </>
  );
}

export default function AuthErrorPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center space-y-6">
          <Suspense fallback={
            <div className="space-y-4 text-center">
              <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-slate-700" />
              <div className="mt-4 h-6 w-32 animate-pulse rounded bg-slate-700 mx-auto" />
            </div>
          }>
            <AuthErrorContent />
          </Suspense>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
