"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendRundmailAction } from "@/features/kommunikation/actions";
import { TemplateSelector } from "@/features/kommunikation/components/template-selector";
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
  templates: {
    id: string;
    label: string;
    getSubject: () => string;
    getBody: () => string;
  }[];
}

export function MailForm({ lists, templates }: MailFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [targetType, setTargetType] = useState<"all" | "role" | "team">("all");
  const [targetId, setTargetId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [subjectValue, setSubjectValue] = useState("");
  const [bodyValue, setBodyValue] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("targetType", targetType);
    if (targetType !== "all") {
      formData.set("targetId", targetId);
    }

    // Ensure controlled values are in formData
    formData.set("subject", subjectValue);
    formData.set("bodyHtml", bodyValue);

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
        setSubjectValue("");
        setBodyValue("");
        setSelectedTemplate(null);
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

  function hasPlaceholders(): boolean {
    return /\{\{(Vorname|Nachname|DWZ|Team|Rolle)\}\}/.test(subjectValue + bodyValue);
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
                <span className="font-medium">Bestimmte Mannschaft</span>
              </label>
            </div>

            {targetType === "role" && (
              <div className="mt-4">
                <Label htmlFor="targetRole">Rolle auswählen</Label>
                <select
                  id="targetRole"
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                >
                  {lists.roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.label}</option>
                  ))}
                </select>
              </div>
            )}

            {targetType === "team" && (
              <div className="mt-4">
                <Label htmlFor="targetTeam">Mannschaft auswählen</Label>
                <select
                  id="targetTeam"
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                >
                  {lists.teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <TemplateSelector
            value={selectedTemplate}
            onChange={(subject, body) => {
              setSubjectValue(subject);
              setBodyValue(body);
              setSelectedTemplate(selectedTemplate);
            }}
            templates={templates}
          />

          <div className="space-y-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Betreff der E-Mail"
              required
              value={subjectValue}
              onChange={(e) => setSubjectValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyHtml">Inhalt (HTML unterstützt)</Label>
            <Textarea
              id="bodyHtml"
              name="bodyHtml"
              rows={12}
              placeholder="E-Mail Inhalt..."
              required
              value={bodyValue}
              onChange={(e) => setBodyValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Anhaenge (optional, max 10 MB)</Label>
            <Input
              id="attachments"
              name="attachments"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
            />
            <p className="text-xs text-muted-foreground">
              Maximale Dateigroesse: 10 MB pro Datei. Erlaubte Formate: PDF, Bilder, Word.
            </p>
          </div>

          {hasPlaceholders() && (
            <div className="rounded-md bg-muted p-3 text-sm text-amber-600">
              Platzhalter wie {"{{Vorname}}"} werden beim Senden durch die tatsächlichen Werte ersetzt.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Send className="h-4 w-4 mr-2" />
            Senden
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
