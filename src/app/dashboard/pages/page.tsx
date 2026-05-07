import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getPages, type PageSortField, type SortOrder } from "@/features/cms/actions";
import { PagesListPageClient } from "./pages-list-page-client";

export const metadata = {
  title: "Website-Seiten",
};

export default async function PagesListPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    search?: string; 
    status?: string;
    sortBy?: PageSortField;
    sortOrder?: SortOrder;
    page?: string;
  }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_READ)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Website-Verwaltung.</p>
      </div>
    );
  }

  const filters = await searchParams;
  const currentPage = Number(filters.page) || 1;
  const sortBy = filters.sortBy || "updatedAt";
  const sortOrder = filters.sortOrder || "desc";
  
  const { pages: allPages } = await getPages(
    filters.search,
    filters.status,
    sortBy,
    sortOrder,
    currentPage
  );

  const canEdit = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_WRITE);

  return <PagesListPageClient pages={allPages} canEdit={canEdit} />;
}
