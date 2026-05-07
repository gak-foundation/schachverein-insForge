import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getMembers,
  type MemberSortField,
  type SortOrder as MembersListSortOrder,
} from "@/features/members/actions";
import { MembersPageClient } from "./members-page-client";

type SortField = "name" | "email" | "dwz" | "elo" | "role" | "status";
type SortOrder = "asc" | "desc";

export const metadata = {
  title: "Mitglieder",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    search?: string; 
    role?: string; 
    status?: string;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    page?: string;
  }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.MEMBERS_READ, session.user.isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fÃ¼r die Mitgliederverwaltung.</p>
      </div>
    );
  }

  const filters = await searchParams ?? {};
  const currentPage = Number(filters?.page) || 1;
  const sortBy = (filters?.sortBy || "name") as SortField;
  const sortOrder = (filters?.sortOrder || "asc") as SortOrder;

  const { members, totalCount, totalPages } = await getMembers(
    filters?.search,
    filters?.role,
    filters?.status,
    sortBy as MemberSortField,
    sortOrder as MembersListSortOrder,
    currentPage
  );
  


  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
    inactive: "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    resigned: "bg-red-100 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
    honorary: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50",
  };

  const statusLabels: Record<string, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    resigned: "Ausgetreten",
    honorary: "Ehrenmitglied",
  };

  const hasWritePermission = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.MEMBERS_WRITE, session.user.isSuperAdmin);

  const { getContributionRatesForMemberSelect } = await import("@/features/members/actions");
  const contributionRates = await getContributionRatesForMemberSelect() as { id: string; name: string }[];

  return (
    <MembersPageClient
      members={members}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      sortBy={sortBy}
      sortOrder={sortOrder}
      filters={filters}
      statusColors={statusColors}
      statusLabels={statusLabels}
      hasWritePermission={hasWritePermission}
      contributionRates={contributionRates}
    />
  );
}
