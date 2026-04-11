"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 text-5xl">♔</div>
        <CardTitle className="text-2xl">Fehler</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Link href="/login">
          <Button className="w-full">Zum Login</Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full">Zur Startseite</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-5xl">♔</div>
            <CardTitle className="text-2xl">Fehler</CardTitle>
          </CardHeader>
        </Card>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}