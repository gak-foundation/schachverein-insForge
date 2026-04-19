"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createMemberSchema, type CreateMemberInput } from "@/lib/validations/member";
import { createMember, updateMember } from "@/lib/actions/members";
import { Loader2, CreditCard, User, Award, ShieldCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberFormProps {
  member?: any;
  mode?: "create" | "edit";
  contributionRates?: any[];
}

export function MemberForm({ member, mode = "create", contributionRates = [] }: MemberFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";

  const form = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema) as any,
    defaultValues: {
      firstName: member?.firstName || "",
      lastName: member?.lastName || "",
      email: member?.email || "",
      phone: member?.phone || "",
      dateOfBirth: member?.dateOfBirth || "",
      gender: member?.gender || "",
      dwz: member?.dwz || null,
      elo: member?.elo || null,
      dwzId: member?.dwzId || "",
      lichessUsername: member?.lichessUsername || "",
      chesscomUsername: member?.chesscomUsername || "",
      role: member?.role || "mitglied",
      status: member?.status || "active",
      photoConsent: member?.photoConsent || false,
      newsletterConsent: member?.newsletterConsent || false,
      resultPublicationConsent: member?.resultPublicationConsent !== undefined ? member.resultPublicationConsent : true,
      notes: member?.notes || "",
      sepaIban: member?.sepaIban || "",
      sepaBic: member?.sepaBic || "",
      sepaMandateReference: member?.sepaMandateReference || "",
      mandateSignedAt: member?.mandateSignedAt || "",
      contributionRateId: member?.contributionRateId || undefined,
    },
  });

  async function onSubmit(values: CreateMemberInput) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (isEdit && member?.id) {
          formData.append("id", member.id);
        }
        
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        if (isEdit) {
          await updateMember(formData);
          toast({ title: "Erfolg", description: "Mitglied erfolgreich aktualisiert" });
        } else {
          await createMember(formData);
          toast({ title: "Erfolg", description: "Mitglied erfolgreich angelegt" });
        }
        
        router.push(isEdit ? `/dashboard/members/${member.id}` : "/dashboard/members");
        router.refresh();
      } catch (error) {
        toast({ 
          title: "Fehler", 
          description: isEdit ? "Fehler beim Aktualisieren" : "Fehler beim Anlegen",
          variant: "destructive"
        });
        console.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Persönliche Daten
            </CardTitle>
            <CardDescription>Grundlegende Informationen zum Mitglied</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname <span className="text-red-500" aria-hidden="true">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Max" {...field} className="h-11" aria-required="true" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nachname <span className="text-red-500" aria-hidden="true">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Mustermann" {...field} className="h-11" aria-required="true" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail <span className="text-red-500" aria-hidden="true">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="max@beispiel.de" {...field} className="h-11" aria-required="true" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+49 123 456789" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geburtsdatum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormDescription className="text-xs">Wichtig für Altersklassen-Einteilung</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geschlecht</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="maennlich">Männlich</SelectItem>
                        <SelectItem value="weiblich">Weiblich</SelectItem>
                        <SelectItem value="divers">Divers</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chess Information */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Schach-Daten
            </CardTitle>
            <CardDescription>DWZ, Elo und Online-Accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="dwz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DWZ</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="elo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="lichessUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lichess-Benutzername</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="chesscomUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chess.com-Benutzername</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control as any}
              name="dwzId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DWZ-ID (DeWIS)</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 12345678" {...field} value={field.value || ""} className="h-11" />
                  </FormControl>
                  <FormDescription className="text-xs">Ermöglicht automatische Rating-Updates</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Membership Information */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Mitgliedschaft & Einwilligungen
            </CardTitle>
            <CardDescription>Rechte-Rolle, Vereinsstatus und DSGVO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle im System</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mitglied">Mitglied</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="sportwart">Sportwart</SelectItem>
                        <SelectItem value="jugendwart">Jugendwart</SelectItem>
                        <SelectItem value="kassenwart">Kassenwart</SelectItem>
                        <SelectItem value="vorstand">Vorstand</SelectItem>
                        <SelectItem value="admin">System-Admin</SelectItem>
                        <SelectItem value="eltern">Eltern</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mitgliedsstatus</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="inactive">Inaktiv</SelectItem>
                        <SelectItem value="honorary">Ehrenmitglied</SelectItem>
                        <SelectItem value="resigned">Ausgetreten</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-lg bg-slate-50 dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Einwilligungen (DSGVO)</h4>
              <FormField
                control={form.control as any}
                name="photoConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">Foto-Einwilligung</FormLabel>
                      <FormDescription className="text-xs">Bilder dürfen auf der Website veröffentlicht werden</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="newsletterConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">Newsletter-Einwilligung</FormLabel>
                      <FormDescription className="text-xs">Zusendung von Vereinsnachrichten per E-Mail</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="resultPublicationConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">Ergebnisse veröffentlichen</FormLabel>
                      <FormDescription className="text-xs">Turnierergebnisse dürfen online gelistet werden</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank & Payment */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Bankdaten & Beitrag
            </CardTitle>
            <CardDescription>SEPA-Mandat und Beitragsstufe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control as any}
              name="contributionRateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beitragsstufe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Keine Beitragsstufe gewählt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Keine Beitragsstufe</SelectItem>
                      {contributionRates.map((rate) => (
                        <SelectItem key={rate.id} value={rate.id}>
                          {rate.name} ({Number(rate.amount).toFixed(2)} €)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="sepaIban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEPA-IBAN</FormLabel>
                    <FormControl>
                      <Input placeholder="DE00 0000 0000 0000 0000 00" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="sepaBic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEPA-BIC</FormLabel>
                    <FormControl>
                      <Input placeholder="ABCDEF12" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="sepaMandateReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mandatsreferenz</FormLabel>
                    <FormControl>
                      <Input placeholder="MANDATE-001" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="mandateSignedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum der Unterschrift</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Interne Notizen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <FormField
              control={form.control as any}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Zusätzliche Informationen (z.B. Mitgliedschaft in Zweitvereinen, Besonderheiten)..." 
                      className="min-h-[100px] resize-none"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pb-10">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => router.push(isEdit ? `/dashboard/members/${member?.id}` : "/dashboard/members")}
            disabled={isPending}
            className="h-11 px-8"
          >
            Abbrechen
          </Button>
          <Button type="submit" disabled={isPending} className="h-11 px-8 min-w-[160px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              isEdit ? "Änderungen speichern" : "Mitglied anlegen"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
