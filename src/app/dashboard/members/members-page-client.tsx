// src/app/dashboard/members/members-page-client.tsx
"use client";

import { useState, useCallback } from "react";
import { MembersFilters } from "@/features/members/components/members-filters";
import { MembersTable } from "@/features/members/components/members-table";
import { BulkActionBar } from "@/features/members/components/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { Upload, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";

type SortField = "name" | "email" | "dwz" | "elo" | "role" | "status";

interface MembersPageClientProps {
  members: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  sortBy: string;
  sortOrder: string;
  filters: Record<string, string | undefined>;
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
  statusColors,
  statusLabels,
  hasWritePermission,
  contributionRates,
}: MembersPageClientProps) {
  const buildMembersLink = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.role) params.set("role", filters.role);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.sortBy) params.set("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);
      if (filters?.page && filters.page !== "1") params.set("page", filters.page);

      for (const [key, value] of Object.entries(overrides)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const query = params.toString();
      return query ? `/dashboard/members?${query}` : "/dashboard/members";
    },
    [filters]
  );

  const buildSortLink = useCallback(
    (field: SortField) => {
      return buildMembersLink({
        sortBy: field,
        sortOrder: sortBy === field && sortOrder !== "desc" ? "desc" : "asc",
        page: undefined,
      });
    },
    [buildMembersLink, sortBy, sortOrder]
  );

  const getSortIcon = useCallback(
    (field: SortField) => {
      if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
      return sortOrder === "desc"
        ? <span className="text-primary font-bold" aria-hidden="true">↓</span>
        : <span className="text-primary font-bold" aria-hidden="true">↑</span>;
    },
    [sortBy, sortOrder]
  );
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
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-4xl font-heading tracking-tight">Mitglieder</h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mt-2">{totalCount} Mitglieder insgesamt</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          {hasWritePermission && (
            <>
              <Link href="/dashboard/members/import" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground hover:text-foreground transition-colors pb-1 border-b border-transparent hover:border-foreground flex items-center">
                <Upload className="h-3 w-3 mr-2" />
                Import/Export
              </Link>
              <PrintButton />
              <Link href="/dashboard/members/new" className="text-xs uppercase tracking-widest font-semibold bg-foreground text-background px-4 py-2 hover:bg-foreground/80 transition-colors">
                <span className="mr-2 font-serif">+</span> Neues Mitglied
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
