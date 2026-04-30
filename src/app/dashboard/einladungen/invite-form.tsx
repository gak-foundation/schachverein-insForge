"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clubCreateInvitationAction } from "@/lib/clubs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check, Send } from "lucide-react";

interface ClubInviteFormProps {
  roles: { value: string; label: string }[];
}

export function ClubInviteForm({ roles }: ClubInviteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("mitglied");
  const [sendEmail, setSendEmail] = useState(true);
  const [result, setResult] = useState<{ invitationUrl?: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("role", role);
    formData.append("sendEmail", sendEmail ? "true" : "false");

    startTransition(async () => {
      try {
        const res = await clubCreateInvitationAction(formData);
        setResult({ invitationUrl: (res as any).invitationUrl });
        router.refresh();
      } catch (err: any) {
        setResult({ error: err.message || "Fehler beim Erstellen der Einladung" });
      }
    });
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mitglied einladen</CardTitle>
        <CardDescription>
          Einladungslink generieren und optional per E-Mail versenden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="mitglied@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select value={role} onValueChange={(v) => setRole(v ?? "mitglied")}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-1 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendEmail"
                  checked={sendEmail}
                  onCheckedChange={(checked) => setSendEmail(!!checked)}
                />
                <Label htmlFor="sendEmail" className="text-sm cursor-pointer">
                  E-Mail senden
                </Label>
              </div>
              <Button type="submit" disabled={isPending || !email}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Einladen
              </Button>
            </div>
          </div>

          {result?.error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {result.error}
            </p>
          )}

          {result?.invitationUrl && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3">
              <span className="text-sm font-medium text-green-800 dark:text-green-200 flex-1 truncate">
                {result.invitationUrl}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(result.invitationUrl!)}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
