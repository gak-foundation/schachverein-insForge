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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      setError("Kein Reset-Token gefunden. Bitte fordern Sie einen neuen Link an.");
    } else {
      setToken(t);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Passwort muss mindestens einen Großbuchstaben enthalten");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Passwort muss mindestens einen Kleinbuchstaben enthalten");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Passwort muss mindestens eine Ziffer enthalten");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Passwort muss mindestens ein Sonderzeichen enthalten");
      return;
    }

    if (!token) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("token", token);
      formData.set("password", password);
      formData.set("confirmPassword", confirmPassword);
      const { resetPassword } = await import("@/lib/actions");
      const result = await resetPassword(formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Passwort-Zurücksetzen fehlgeschlagen");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 text-5xl">♔</div>
        <CardTitle className="text-2xl">Passwort zurücksetzen</CardTitle>
        <CardDescription>
          {success ? "Ihr Passwort wurde erfolgreich geändert." : "Geben Sie Ihr neues Passwort ein."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <Button className="w-full" onClick={() => router.push("/login")}>
            Zum Login
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Neues Passwort</Label>
              <Input id="password" name="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <p className="text-xs text-gray-500">
              Mindestens 8 Zeichen, Groß- und Kleinbuchstaben, eine Ziffer und ein Sonderzeichen.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? "Speichern..." : "Passwort ändern"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-5xl">♔</div>
            <CardTitle className="text-2xl">Passwort zurücksetzen</CardTitle>
          </CardHeader>
        </Card>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}