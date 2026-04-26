import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MembersFiltersProps {
  filters: {
    search?: string;
    role?: string;
    status?: string;
  };
  buildMembersLink: (overrides: Record<string, string | undefined>) => string;
}

export function MembersFilters({ filters, buildMembersLink }: MembersFiltersProps) {
  const statusLabels: Record<string, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    resigned: "Ausgetreten",
    honorary: "Ehrenmitglied",
  };

  const activeFilters = [
    filters.search ? { label: `Suche: ${filters.search}`, href: buildMembersLink({ search: undefined, page: undefined }) } : null,
    filters.role ? { label: `Rolle: ${filters.role}`, href: buildMembersLink({ role: undefined, page: undefined }) } : null,
    filters.status ? { label: `Status: ${statusLabels[filters.status] ?? filters.status}`, href: buildMembersLink({ status: undefined, page: undefined }) } : null,
  ].filter((value): value is { label: string; href: string } => value !== null);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <form className="flex flex-col gap-4 lg:flex-row lg:items-end" method="GET" action="/dashboard/members">
          <div className="flex-1 space-y-2">
            <label htmlFor="member-search" className="text-sm font-medium text-gray-700">
              Mitglieder suchen
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id="member-search"
                type="text"
                name="search"
                placeholder="Suche nach Name oder E-Mail"
                defaultValue={filters.search ?? ""}
                className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                suppressHydrationWarning
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="role-filter" className="text-sm font-medium text-gray-700">
                Rolle
              </label>
              <select 
                id="role-filter" 
                name="role" 
                defaultValue={filters.role ?? ""} 
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Alle Rollen</option>
                <option value="admin">Admin</option>
                <option value="vorstand">Vorstand</option>
                <option value="sportwart">Sportwart</option>
                <option value="jugendwart">Jugendwart</option>
                <option value="kassenwart">Kassenwart</option>
                <option value="trainer">Trainer</option>
                <option value="mitglied">Mitglied</option>
                <option value="eltern">Eltern</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select 
                id="status-filter" 
                name="status" 
                defaultValue={filters.status ?? ""} 
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="resigned">Ausgetreten</option>
                <option value="honorary">Ehrenmitglied</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:pb-0.5">
            <Button type="submit" className="min-w-28">Filtern</Button>
            <Link href="/dashboard/members">
              <Button type="button" variant="outline">
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
                Zurücksetzen
              </Button>
            </Link>
          </div>
        </form>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3" aria-label="Aktive Filter">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Aktive Filter</span>
            {activeFilters.map((filter) => (
              <Link
                key={filter.label}
                href={filter.href}
                className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {filter.label}
                <X className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Filter entfernen</span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
