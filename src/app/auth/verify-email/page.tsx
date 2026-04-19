"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(() =>
    token ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState(() =>
    token ? "" : "Kein Verifizierungs-Token gefunden.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }
    const verificationToken = token;

    async function verify() {
      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`,
        );
        if (response.ok) {
          setStatus("success");
        } else {
          const data = await response.json().catch(() => ({ error: "Verifizierung fehlgeschlagen" }));
          setStatus("error");
          setErrorMessage(data.error || "Verifizierung fehlgeschlagen.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Ein Fehler ist aufgetreten.");
      }
    }

    void verify();
  }, [token]);

  return (
    <>
      <AuthHeader
        title={status === "success" ? "E-Mail bestätigt" : status === "error" ? "Fehler" : "Wird verifiziert"}
        subtitle={
          status === "loading"
            ? "Ihre E-Mail-Adresse wird verifiziert..."
            : status === "success"
            ? "Ihr Konto ist jetzt aktiviert"
            : "Die Verifizierung konnte nicht abgeschlossen werden"
        }
      />

      <div className="flex flex-col items-center space-y-6">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center"
            >
              <div className="relative h-16 w-16">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-blue-500/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ borderTopColor: "transparent" }}
                />
                <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-blue-400 animate-spin" />
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
              >
                <CheckCircle className="h-10 w-10 text-green-400" />
              </motion.div>

              <p className="text-slate-300">
                Ihre E-Mail-Adresse wurde erfolgreich verifiziert. Sie können sich jetzt anmelden.
              </p>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-violet-500"
                onClick={() => router.push("/auth/login")}
              >
                Zum Login
              </Button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20"
              >
                <XCircle className="h-10 w-10 text-red-400" />
              </motion.div>

              <p className="text-slate-300">{errorMessage}</p>

              <Button
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5"
                onClick={() => router.push("/auth/login")}
              >
                Zum Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <Suspense fallback={
          <div className="space-y-6 text-center">
            <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-slate-700" />
            <div className="mt-4 h-6 w-48 animate-pulse rounded bg-slate-700 mx-auto" />
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
