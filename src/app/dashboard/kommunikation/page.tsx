import { Metadata } from "next";
import { getMailingLists } from "@/features/kommunikation/actions";
import { MailForm } from "./mail-form";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Kommunikation",
  description: "Rundmails und Newsletter an Vereinsmitglieder senden",
};

export default async function KommunikationPage() {
  const lists = await getMailingLists();

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
        <MailForm lists={lists} />
      </div>
    </div>
  );
}
