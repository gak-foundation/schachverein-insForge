// src/app/dashboard/members/members-page-client.tsx
"use client";

import { useState, useCallback } from "react";
import { MembersFilters } from "@/features/members/components/members-filters";
import { MembersTable } from "@/features/members/components/members-table";
import { BulkActionBar } from "@/features/members/components/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";

interface MembersPageClientProps {
  members: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  sortBy: string;
  sortOrder: string;
  filters: any;
  buildSortLink: (field: string) => string;
  buildMembersLink: (overrides: Record<string, string | undefined>) => string;
  getSortIcon: (field: string) => React.ReactNode;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  hasWritePermission: boolean;
  contributionRates: { id: string; name: string }[];
}

export function MembersPageClient({
  members,
  totalCount,
  totalPages,
  currentPage,
  sortBy,
  sortOrder,
  filters,
  buildSortLink,
  buildMembersLink,
  getSortIcon,
  statusColors,
  statusLabels,
  hasWritePermission,
  contributionRates,
}: MembersPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectionChange = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(members.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [members]);

  const allSelected = members.length > 0 && selectedIds.size === members.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mitglieder</h1>
          <p className="text-sm text-gray-500">{totalCount} Mitglieder insgesamt</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasWritePermission && (
            <>
              <Link href="/dashboard/members/import">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import/Export
                </Button>
              </Link>
              <PrintButton />
              <Link href="/dashboard/members/new">
                <Button size="sm">
                  <span className="mr-2">+</span> Neues Mitglied
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <BulkActionBar
        selectedIds={Array.from(selectedIds)}
        onClear={() => setSelectedIds(new Set())}
        contributionRates={contributionRates}
        disabled={false}
      />

      <MembersFilters filters={filters} buildMembersLink={buildMembersLink} />

      <MembersTable
        members={members}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        getSortIcon={getSortIcon}
        buildSortLink={buildSortLink}
        buildMembersLink={buildMembersLink}
        statusColors={statusColors}
        statusLabels={statusLabels}
        hasWritePermission={hasWritePermission}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
      />
    </div>
  );
}
