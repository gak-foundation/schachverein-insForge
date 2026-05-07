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
  getSepaExports,
  getMembersForFinance,
} from "@/features/finance/actions";
import { FinancePageClient } from "./finance-page-client";

export const metadata = {
  title: "Finanzen",
};

export default async function FinancePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const canRead = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.FINANCE_READ, session.user.isSuperAdmin);
  const canWrite = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.FINANCE_WRITE, session.user.isSuperAdmin);
  const canSepa = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.FINANCE_SEPA, session.user.isSuperAdmin);
  const hasClubId = !!session.user.clubId;

  const [
    stats,
    allPayments,
    memberList,
    contributionRates,
    paymentsWithDetails,
    bankSettings,
    dunningStats,
    sepaHistory,
  ] = await Promise.all([
    getPaymentStats(),
    getPayments(),
    getMembersForFinance(),
    getContributionRates(),
    getPaymentWithMemberDetails(),
    getClubBankSettings(),
    getDunningStats(),
    getSepaExports(),
  ]);

  return (
    <FinancePageClient
      stats={stats}
      payments={allPayments}
      members={memberList}
      contributionRates={contributionRates}
      paymentsWithDetails={paymentsWithDetails}
      bankSettings={bankSettings}
      dunningStats={dunningStats}
      sepaHistory={sepaHistory}
      canRead={canRead}
      canWrite={canWrite}
      canSepa={canSepa}
      hasClubId={hasClubId}
    />
  );
}
