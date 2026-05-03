"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/insforge";

type Status = "processing" | "success" | "error";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("processing");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const next = searchParams.get("next") || "/onboarding";
    const action = searchParams.get("action");
    const slug = searchParams.get("slug");
    const client = createClient();

    const maxAttempts = 20;

    async function pollUser(): Promise<void> {
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const { data, error } = await client.auth.getCurrentUser();
          if (!error && data?.user) {
            const user = data.user;
            const tokenMgr = (client as any).tokenManager;
            const accessToken = tokenMgr?.accessToken;
            const refreshToken = tokenMgr?.refreshToken;
            const res = await fetch("/api/auth/complete-oauth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken,
                refreshToken,
                userId: user.id,
                email: user.email,
                name: user.profile?.name || user.email?.split("@")[0],
                avatarUrl: user.profile?.avatar_url,
                emailVerified: user.emailVerified ?? false,
                action,
                slug,
              }),
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              setStatus("error");
              setErrorMsg(errData.error || "Sync failed");
              return;
            }

            setStatus("success");
            setTimeout(() => {
              window.location.href = next;
            }, 500);
            return;
          }
        } catch {
          // continue polling
        }
      }

      setStatus("error");
      setErrorMsg("OAuth authentication timed out");
    }

    pollUser();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {status === "processing" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Anmeldung wird abgeschlossen...
            </h1>
            <p className="text-sm text-muted-foreground">
              Bitte warten Sie einen Moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Erfolgreich angemeldet
            </h1>
            <p className="text-sm text-muted-foreground">
              Sie werden weitergeleitet...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Anmeldung fehlgeschlagen
            </h1>
            <p className="text-sm text-muted-foreground">
              {errorMsg || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."}
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Zurück zur Anmeldung
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CallbackSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto" />
        <div className="h-6 w-64 rounded bg-slate-200 dark:bg-slate-700 mx-auto" />
        <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700 mx-auto" />
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackSkeleton />}>
      <CallbackContent />
    </Suspense>
  );
}
