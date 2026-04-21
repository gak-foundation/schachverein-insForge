"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { ErrorMessage } from "@/components/auth/error-message";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Passwort vergessen?"
          subtitle={
            sent
              ? "Überprüfen Sie Ihr E-Mail-Postfach"
              : "Wir senden Ihnen einen Link zum Zurücksetzen"
          }
        />

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                    E-Mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@verein.de"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </motion.div>

                {error && (
                  <ErrorMessage message={error} onDismiss={() => setError(null)} />
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    type="submit"
                    className="h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/40 disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    {loading ? "Wird gesendet..." : "Reset-Link senden"}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
              >
                <CheckCircle className="h-8 w-8 text-green-400" />
              </motion.div>

              <p className="text-slate-300">
                Wenn ein Konto mit{" "}
                <span className="font-medium text-white">{email}</span>{" "}
                existiert, haben wir einen Link zum Zurücksetzen Ihres Passworts gesendet.
              </p>

              <p className="text-sm text-slate-400">
                Überprüfen Sie auch Ihren Spam-Ordner, falls Sie keine E-Mail erhalten.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white"
                  >
                    Zurück zum Login
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!sent && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-slate-400"
          >
            <Link
              href="/auth/login"
              className="font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Zurück zum Login
            </Link>
          </motion.p>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
