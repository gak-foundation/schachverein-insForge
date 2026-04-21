"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { acceptClubInvitationAction } from "@/lib/clubs/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ErrorMessage } from "@/components/auth/error-message";

interface InvitationContentProps {
  token: string;
  clubName: string;
  isLoggedIn: boolean;
  userEmail?: string;
  invitationEmail: string;
}

export function InvitationContent({
  token,
  clubName,
  isLoggedIn,
  userEmail,
  invitationEmail,
}: InvitationContentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const emailMismatch = isLoggedIn && userEmail !== invitationEmail;

  async function handleAccept() {
    setLoading(true);
    setError(null);
    try {
      const result = await acceptClubInvitationAction(token);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Einladung konnte nicht angenommen werden");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erfolgreich beigetreten!</h2>
        <p className="text-slate-600">Sie werden zum Dashboard weitergeleitet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
        <p className="text-slate-700 dark:text-slate-300 mb-2">Sie wurden eingeladen, beizutreten:</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{clubName}</h3>
      </div>

      {!isLoggedIn ? (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Bitte erstellen Sie ein Konto oder melden Sie sich an, um die Einladung anzunehmen.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href={`/auth/login?invitation=${token}`}
              className={cn(buttonVariants({ variant: "outline" }), "h-11")}
            >
              Anmelden
            </Link>
            <Link
              href={`/auth/signup?invitation=${token}`}
              className={cn(buttonVariants(), "h-11")}
            >
              Registrieren
            </Link>
          </div>
        </div>
      ) : emailMismatch ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>
              Diese Einladung wurde für <strong>{invitationEmail}</strong> ausgestellt. 
              Sie sind aktuell als <strong>{userEmail}</strong> angemeldet.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Bitte melden Sie sich mit der richtigen E-Mail-Adresse an, um beizutreten.
          </p>
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Mit anderem Konto anmelden
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Klicken Sie auf den Button unten, um die Einladung anzunehmen und Mitglied zu werden.
          </p>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          <Button 
            onClick={handleAccept} 
            className="w-full h-12 text-lg font-bold" 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Jetzt beitreten
          </Button>
        </div>
      )}
    </div>
  );
}
