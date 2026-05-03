import { Metadata } from "next";
import { getMailingLists } from "@/features/kommunikation/actions";
import { MailForm } from "./mail-form";
import { Mail } from "lucide-react";
import {
  welcomeTemplate,
  paymentReminderTemplate,
  tournamentInviteTemplate,
} from "@/lib/email/templates";

export const metadata: Metadata = {
  title: "Kommunikation",
  description: "Rundmails und Newsletter an Vereinsmitglieder senden",
};

export default async function KommunikationPage() {
  const lists = await getMailingLists();

  const templateDefinitions = [
    {
      id: "welcome",
      label: "Willkommensmail",
      subject: welcomeTemplate("dein Verein").subject,
      body: welcomeTemplate("dein Verein").html,
    },
    {
      id: "payment_reminder",
      label: "Beitragserinnerung",
      subject: paymentReminderTemplate().subject,
      body: paymentReminderTemplate().html,
    },
    {
      id: "tournament_invite",
      label: "Turniereinladung",
      subject: tournamentInviteTemplate("").subject,
      body: tournamentInviteTemplate("").html,
    },
    {
      id: "generic",
      label: "Allgemeine Mitteilung",
      subject: "",
      body: "<p>Hallo {{Vorname}},</p><p></p>",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Kommunikation
          </h1>
          <p className="text-muted-foreground mt-1">
            Sende E-Mails an verschiedene Gruppen oder Mannschaften deines Vereins.
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <MailForm lists={lists} templates={templateDefinitions} />
      </div>
    </div>
  );
}
