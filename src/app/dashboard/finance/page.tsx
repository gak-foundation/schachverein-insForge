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
} from "@/lib/actions/finance";
import { getMembers } from "@/lib/actions/members";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentsOverview } from "@/components/finance/payments-overview";
import { ContributionRatesList } from "@/components/finance/contribution-rates-list";
import { SepaExport } from "@/components/finance/sepa-export";
import { ClubBankSettings } from "@/components/finance/club-bank-settings";

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  paid: "Bezahlt",
  overdue: "Ueberfaellig",
  cancelled: "Storniert",
  refunded: "Erstattet",
  collected: "Eingezogen",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-blue-100 text-blue-800",
  collected: "bg-purple-100 text-purple-800",
};

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

  const [stats, allPayments, allMembers, contributionRates, paymentsWithDetails, bankSettings] = await Promise.all([
    getPaymentStats(),
    getPayments(),
    getMembers(),
    getContributionRates(),
    getPaymentWithMemberDetails(),
    getClubBankSettings(),
  ]);

  const memberMap = new Map(allMembers.map((m) => [m.id, `${m.firstName} ${m.lastName}`]));

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
          {canWrite && <TabsTrigger value="settings">Bank-Einstellungen</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PaymentsOverview
            stats={stats}
            payments={allPayments}
            members={allMembers}
            canWrite={canWrite}
          />
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <ContributionRatesList
            rates={contributionRates}
            canWrite={canWrite}
          />
        </TabsContent>

        {canWrite && (
          <TabsContent value="sepa" className="space-y-6">
            <SepaExport
              payments={paymentsWithDetails}
              bankSettings={bankSettings}
              canSepa={canSepa}
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
