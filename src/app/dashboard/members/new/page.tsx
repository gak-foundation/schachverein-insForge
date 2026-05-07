import Link from "next/link";
import { MemberWizard } from "@/features/members/components/member-wizard";
import { ChevronLeft } from "lucide-react";
import { createServiceClient } from "@/lib/insforge";
import { requireClubId } from "@/lib/auth/session";

export const metadata = {
  title: "Neues Mitglied anlegen | schach.studio",
  description: "Erfassen Sie ein neues Vereinsmitglied Schritt fuer Schritt.",
};

export default async function NewMemberPage() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: contributionRates } = await client
    .from("contribution_rates")
    .select("id, name, amount")
    .eq("club_id", clubId);

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/members"
          className="group flex w-fit items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Zurueck zur Uebersicht
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Neues Mitglied</h1>
          <p className="text-muted-foreground">
            Legen Sie ein neues Mitglied in drei einfachen Schritten an.
          </p>
        </div>
      </div>

      <MemberWizard contributionRates={contributionRates || []} />
    </div>
  );
}
