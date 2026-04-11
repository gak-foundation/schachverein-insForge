"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      const { requestPasswordReset } = await import("@/lib/actions");
      await requestPasswordReset(formData);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">♔</div>
          <CardTitle className="text-2xl">Passwort vergessen?</CardTitle>
          <CardDescription>
            {sent
              ? "Wenn die E-Mail existiert, wurde ein Reset-Link gesendet."
              : "Geben Sie Ihre E-Mail-Adresse ein, um einen Reset-Link zu erhalten."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@verein.de"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Senden..." : "Reset-Link senden"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-green-600">
                Prüfen Sie Ihr E-Mail-Postfach und folgen Sie dem Link zum Zurücksetzen Ihres Passworts.
              </p>
            </div>
          )}
          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:underline">
              Zurück zum Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}