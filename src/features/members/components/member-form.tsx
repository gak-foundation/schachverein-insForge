 
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
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
import { createMemberSchema, type CreateMemberInput } from "@/lib/validations/member";
import { createMember, updateMember } from "@/features/members/actions";
import { Loader2 } from "lucide-react";

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

  const labelClass = "text-xs uppercase tracking-widest font-semibold text-muted-foreground block mb-2";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-sm">
          <div className="mb-8 border-b border-border/40 pb-4">
            <h2 className="text-2xl font-heading tracking-tight">Persönliche Daten</h2>
            <p className="text-sm text-muted-foreground mt-1">Grundlegende Informationen zum Mitglied</p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Vorname <span className="text-red-500" aria-hidden="true">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Max" {...field} aria-required="true" />
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
                    <FormLabel className={labelClass}>Nachname <span className="text-red-500" aria-hidden="true">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Mustermann" {...field} aria-required="true" />
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
                    <FormLabel className={labelClass}>E-Mail <span className="text-red-500" aria-hidden="true">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="max@beispiel.de" {...field} aria-required="true" />
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
                    <FormLabel className={labelClass}>Telefon</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+49 123 456789" {...field} value={field.value || ""} />
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
                    <FormLabel className={labelClass}>Geburtsdatum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription className="text-xs mt-2">Wichtig für Altersklassen-Einteilung</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Geschlecht</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-background text-base font-medium">
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
          </div>
        </div>

        {/* Chess Information */}
        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-sm">
          <div className="mb-8 border-b border-border/40 pb-4">
            <h2 className="text-2xl font-heading tracking-tight">Schach-Daten</h2>
            <p className="text-sm text-muted-foreground mt-1">DWZ, Elo und Online-Accounts</p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="dwz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>DWZ</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} />
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
                    <FormLabel className={labelClass}>Elo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} />
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
                    <FormLabel className={labelClass}>Lichess-Benutzername</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} value={field.value || ""} />
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
                    <FormLabel className={labelClass}>Chess.com-Benutzername</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} value={field.value || ""} />
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
                  <FormLabel className={labelClass}>DWZ-ID (DeWIS)</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 12345678" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription className="text-xs mt-2">Ermöglicht automatische Rating-Updates</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Membership Information */}
        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-sm">
          <div className="mb-8 border-b border-border/40 pb-4">
            <h2 className="text-2xl font-heading tracking-tight">Mitgliedschaft & Einwilligungen</h2>
            <p className="text-sm text-muted-foreground mt-1">Rechte-Rolle, Vereinsstatus und DSGVO</p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control as any}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Rolle im System</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-background text-base font-medium">
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mitglied">Mitglied</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="spielleiter">Spielleiter</SelectItem>
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
                    <FormLabel className={labelClass}>Mitgliedsstatus</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-background text-base font-medium">
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

            <div className="space-y-6 pt-6 mt-6 border-t border-border/40">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Einwilligungen (DSGVO)</h4>
              <FormField
                control={form.control as any}
                name="photoConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer text-base font-medium">Foto-Einwilligung</FormLabel>
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
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer text-base font-medium">Newsletter-Einwilligung</FormLabel>
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
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer text-base font-medium">Ergebnisse veröffentlichen</FormLabel>
                      <FormDescription className="text-xs">Turnierergebnisse dürfen online gelistet werden</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Bank & Payment */}
        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-sm">
          <div className="mb-8 border-b border-border/40 pb-4">
            <h2 className="text-2xl font-heading tracking-tight">Bankdaten & Beitrag</h2>
            <p className="text-sm text-muted-foreground mt-1">SEPA-Mandat und Beitragsstufe</p>
          </div>
          <div className="space-y-6">
            <FormField
              control={form.control as any}
              name="contributionRateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Beitragsstufe</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="h-10 bg-background text-base font-medium">
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
                    <FormLabel className={labelClass}>SEPA-IBAN</FormLabel>
                    <FormControl>
                      <Input placeholder="DE00 0000 0000 0000 0000 00" {...field} value={field.value || ""} />
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
                    <FormLabel className={labelClass}>SEPA-BIC</FormLabel>
                    <FormControl>
                      <Input placeholder="ABCDEF12" {...field} value={field.value || ""} />
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
                    <FormLabel className={labelClass}>Mandatsreferenz</FormLabel>
                    <FormControl>
                      <Input placeholder="MANDATE-001" {...field} value={field.value || ""} />
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
                    <FormLabel className={labelClass}>Datum der Unterschrift</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-heading tracking-tight">Interne Notizen</h2>
          </div>
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
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-6 pt-4">
          <Button 
            variant="outline"
            type="button" 
            onClick={() => router.push(isEdit ? `/dashboard/members/${member?.id}` : "/dashboard/members")}
            disabled={isPending}
            className="h-12 px-8 uppercase tracking-widest font-semibold"
          >
            Abbrechen
          </Button>
          <Button 
            type="submit" 
            disabled={isPending} 
            className="h-12 px-8 uppercase tracking-widest font-semibold min-w-[200px]"
          >
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
