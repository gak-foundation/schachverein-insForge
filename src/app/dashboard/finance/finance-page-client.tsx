"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PaymentsOverview } from "@/features/finance/components/payments-overview";
import { ContributionRatesList } from "@/features/finance/components/contribution-rates-list";
import { SepaExport } from "@/features/finance/components/sepa-export";
import { ClubBankSettings } from "@/features/finance/components/club-bank-settings";
import { DunningOverview } from "@/features/finance/components/dunning-overview";
import { ClubExportButton } from "@/features/clubs/components/club-export-button";

interface FinancePageClientProps {
  stats: any;
  payments: any[];
  members: any[];
  contributionRates: any[];
  paymentsWithDetails: any[];
  bankSettings: any;
  dunningStats: any;
  sepaHistory: any[];
  canRead: boolean;
  canWrite: boolean;
  canSepa: boolean;
  hasClubId: boolean;
}

export function FinancePageClient({
  stats,
  payments,
  members,
  contributionRates,
  paymentsWithDetails,
  bankSettings,
  dunningStats,
  sepaHistory,
  canRead,
  canWrite,
  canSepa,
  hasClubId,
}: FinancePageClientProps) {
  if (!canRead) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Finanzverwaltung.</p>
      </div>
    );
  }

  if (!hasClubId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Kein Verein ausgewaehlt</h2>
        <p className="text-muted-foreground max-w-md">
          Als Admin muessen Sie zuerst einen Verein auswaehlen, um Finanzdaten einsehen zu koennen.
        </p>
        <Link href="/admin">
          <Button>Zur Vereinsauswahl</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finanzen</h1>
        <p className="text-sm text-gray-500">Uebersicht der Beitraege, Beitragssaetze und SEPA-Export</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList variant="line" className="h-auto flex-wrap justify-start gap-x-8 gap-y-2 border-b w-full px-0 pb-px">
          <TabsTrigger value="overview">Uebersicht</TabsTrigger>
          <TabsTrigger value="rates">Beitragssaetze</TabsTrigger>
          {(canWrite || canSepa) && <TabsTrigger value="sepa">SEPA-Export</TabsTrigger>}
          {canWrite && <TabsTrigger value="dunning">Mahnwesen</TabsTrigger>}
          {canWrite && <TabsTrigger value="settings">Bank-Einstellungen</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <PaymentsOverview
            stats={stats}
            payments={payments}
            members={members}
            canWrite={canWrite}
          />
        </TabsContent>

        <TabsContent value="rates" className="mt-6 space-y-6">
          <ContributionRatesList
            rates={contributionRates}
            canWrite={canWrite}
          />
        </TabsContent>

        {(canWrite || canSepa) && (
          <TabsContent value="sepa" className="mt-6 space-y-6">
            <SepaExport
              payments={paymentsWithDetails}
              bankSettings={bankSettings}
              canSepa={canSepa}
              history={sepaHistory}
            />
          </TabsContent>
        )}

        {canWrite && (
          <TabsContent value="dunning" className="mt-6 space-y-6">
            <DunningOverview
              stats={dunningStats}
              canWrite={canWrite}
            />
          </TabsContent>
        )}

        {canWrite && (
          <TabsContent value="settings" className="mt-6 space-y-6">
            <ClubBankSettings
              settings={bankSettings}
            />
            <ClubExportButton />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
