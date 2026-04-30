"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendRundmailAction } from "@/features/kommunikation/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Send } from "lucide-react";

interface MailFormProps {
  lists: {
    roles: { id: string; label: string }[];
    teams: { id: string; name: string }[];
  };
}

export function MailForm({ lists }: MailFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [targetType, setTargetType] = useState<"all" | "role" | "team">("all");
  const [targetId, setTargetId] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("targetType", targetType);
    if (targetType !== "all") {
      formData.set("targetId", targetId);
    }

    try {
      const result = await sendRundmailAction(formData);
      if (result.success) {
        toast({
          title: "E-Mail gesendet",
          description: `Die Nachricht wurde erfolgreich an ${result.count} Empfänger verschickt.`,
        });
        (e.target as HTMLFormElement).reset();
        setTargetType("all");
        setTargetId("");
      }
    } catch (error: any) {
      toast({
        title: "Fehler beim Senden",
        description: error.message || "Es ist ein unerwarteter Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Neue Rundmail</CardTitle>
          <CardDescription>
            Die E-Mail wird via BCC gesendet, sodass Empfänger die Adressen der anderen nicht sehen können.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Empfängerkreis</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`cursor-pointer border rounded-md p-4 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${targetType === "all" ? "border-primary bg-primary/5" : ""}`}>
                <input
                  type="radio"
                  name="type"
                  className="sr-only"
                  checked={targetType === "all"}
                  onChange={() => setTargetType("all")}
                />
                <span className="font-medium">Alle Mitglieder</span>
              </label>

              <label className={`cursor-pointer border rounded-md p-4 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${targetType === "role" ? "border-primary bg-primary/5" : ""}`}>
                <input
                  type="radio"
                  name="type"
                  className="sr-only"
                  checked={targetType === "role"}
                  onChange={() => { setTargetType("role"); setTargetId(lists.roles[1]?.id || ""); }}
                />
                <span className="font-medium">Bestimmte Rolle</span>
              </label>

              <label className={`cursor-pointer border rounded-md p-4 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${targetType === "team" ? "border-primary bg-primary/5" : ""}`}>
                <input
                  type="radio"
                  name="type"
                  className="sr-only"
                  checked={targetType === "team"}
                  onChange={() => { setTargetType("team"); setTargetId(lists.teams[0]?.id || ""); }}
                />
                <span className="font-medium">Mannschaft</span>
              </label>
            </div>
          </div>

          {targetType === "role" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="roleSelect">Rolle auswählen</Label>
              <select
                id="roleSelect"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                required
              >
                <option value="" disabled>Bitte wählen...</option>
                {lists.roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          )}

          {targetType === "team" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="teamSelect">Mannschaft auswählen</Label>
              {lists.teams.length > 0 ? (
                <select
                  id="teamSelect"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                >
                  <option value="" disabled>Bitte wählen...</option>
                  {lists.teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-destructive">Keine Mannschaften vorhanden.</div>
              )}
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input id="subject" name="subject" placeholder="z.B. Einladung zur Mitgliederversammlung" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyHtml">Nachricht</Label>
            <Textarea 
              id="bodyHtml" 
              name="bodyHtml" 
              placeholder="Schreibe hier deine Nachricht (unterstützt HTML)..." 
              required 
              rows={12}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">Hinweis: Momentan wird reines HTML unterstützt. Ein Editor-Update folgt bald.</p>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t px-6 py-4">
          <Button type="submit" disabled={isLoading} className="ml-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Nachricht senden
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
