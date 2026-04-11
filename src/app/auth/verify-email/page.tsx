"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("Kein Verifizierungs-Token gefunden.");
      return;
    }

    async function verify() {
      try {
        const formData = new FormData();
        formData.set("token", token!);
        const { verifyEmail } = await import("@/lib/actions");
        const result = await verifyEmail(formData);
        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Verifizierung fehlgeschlagen.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Ein Fehler ist aufgetreten.");
      }
    }

    verify();
  }, [searchParams]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 text-5xl">♔</div>
        <CardTitle className="text-2xl">E-Mail-Verifizierung</CardTitle>
        <CardDescription>
          {status === "loading" && "Überprüfe Ihren Verifizierungs-Link..."}
          {status === "success" && "Ihre E-Mail wurde erfolgreich verifiziert!"}
          {status === "error" && "Verifizierung fehlgeschlagen"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "loading" && (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        )}
        {status === "success" && (
          <div className="space-y-4">
            <p className="text-center text-green-600">
              Ihre E-Mail-Adresse wurde erfolgreich bestätigt. Sie können sich jetzt anmelden.
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Zum Login
            </Button>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <p className="text-center text-red-600">{errorMessage}</p>
            <Button className="w-full" variant="outline" onClick={() => router.push("/login")}>
              Zum Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-5xl">♔</div>
            <CardTitle className="text-2xl">E-Mail-Verifizierung</CardTitle>
            <CardDescription>Überprüfe Ihren Verifizierungs-Link...</CardDescription>
          </CardHeader>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}