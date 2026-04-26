"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";

export default function VerifyRequestPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20"
        >
          <Mail className="h-10 w-10 text-blue-400" />
        </motion.div>

        <AuthHeader
          title="E-Mail bestätigen"
          subtitle="Wir haben Ihnen einen Verifizierungs-Link gesendet"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 text-center"
        >
          <p className="text-slate-300">
            Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Link, um Ihre E-Mail-Adresse zu bestätigen.
          </p>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-200">
              📧 Der Link ist 24 Stunden gültig
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Keine E-Mail erhalten? Überprüfen Sie Ihren Spam-Ordner oder{" "}
            <Link
              href="/auth/signup"
              className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              versuchen Sie es erneut
              <RefreshCw className="h-3 w-3" />
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Link href="/auth/login">
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5 group"
            >
              Zum Login
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </AuthCard>
    </AuthLayout>
  );
}
