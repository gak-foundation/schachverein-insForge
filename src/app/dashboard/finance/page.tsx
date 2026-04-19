import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getPayments,
  getPaymentStats,
  getContributionRates,
  getPaymentWithMemberDetails,
  getClubBankSettings,
  getDunningStats,
} from "@/lib/actions/finance";
import { getMembersForForms } from "@/lib/actions/members";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentsOverview } from "@/components/finance/payments-overview";
import { ContributionRatesList } from "@/components/finance/contribution-rates-list";
import { SepaExport } from "@/components/finance/sepa-export";
import { ClubBankSettings } from "@/components/finance/club-bank-settings";
import { DunningOverview } from "@/components/finance/dunning-overview";

export const metadata = {
  title: "Finanzen",
};

export default async function FinancePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.FINANCE_READ)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Finanzverwaltung.</p>
      </div>
    );
  }

  const [stats, allPayments, memberList, contributionRates, paymentsWithDetails, bankSettings, dunningStats] = await Promise.all([
    getPaymentStats(),
    getPayments(),
    getMembersForForms(),
    getContributionRates(),
    getPaymentWithMemberDetails(),
    getClubBankSettings(),
    getDunningStats(),
  ]);

  const canWrite = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.FINANCE_WRITE);
  const canSepa = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.FINANCE_SEPA);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finanzen</h1>
        <p className="text-sm text-gray-500">Uebersicht der Beitraege, Beitragssaetze und SEPA-Export</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList variant="line">
          <TabsTrigger value="overview">Uebersicht</TabsTrigger>
          <TabsTrigger value="rates">Beitragssaetze</TabsTrigger>
          {(canWrite || canSepa) && <TabsTrigger value="sepa">SEPA-Export</TabsTrigger>}
          {canWrite && <TabsTrigger value="dunning">Mahnwesen</TabsTrigger>}
          {canWrite && <TabsTrigger value="settings">Bank-Einstellungen</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PaymentsOverview
            stats={stats}
            payments={allPayments}
            members={memberList}
            canWrite={canWrite}
          />
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <ContributionRatesList
            rates={contributionRates}
            canWrite={canWrite}
          />
        </TabsContent>

        {(canWrite || canSepa) && (
          <TabsContent value="sepa" className="space-y-6">
            <SepaExport
              payments={paymentsWithDetails}
              bankSettings={bankSettings}
              canSepa={canSepa}
            />
          </TabsContent>
        )}

        {canWrite && (
          <TabsContent value="dunning" className="space-y-6">
            <DunningOverview
              stats={dunningStats}
              canWrite={canWrite}
            />
          </TabsContent>
        )}

        {canWrite && (
          <TabsContent value="settings" className="space-y-6">
            <ClubBankSettings
              settings={bankSettings}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

