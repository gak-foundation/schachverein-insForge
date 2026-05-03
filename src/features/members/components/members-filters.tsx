import Link from "next/link";
import { Search, X } from "lucide-react";

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
    <div className="py-6 border-b border-border">
      <form className="flex flex-col lg:flex-row gap-8 lg:items-end" method="GET" action="/dashboard/members">
        <div className="flex-1">
          <label htmlFor="member-search" className="sr-only">
            Mitglieder suchen
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="member-search"
              type="text"
              name="search"
              placeholder="Suchen nach Name oder E-Mail..."
              defaultValue={filters.search ?? ""}
              className="editorial-underline-input w-full pl-8 pb-2 text-xl font-heading tracking-tight"
              suppressHydrationWarning
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="space-y-1">
            <label htmlFor="role-filter" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground block mb-2">
              Rolle
            </label>
            <select 
              id="role-filter" 
              name="role" 
              defaultValue={filters.role ?? ""} 
              className="editorial-underline-input text-sm focus:ring-0 cursor-pointer min-w-32 bg-background"
            >
              <option value="">Alle Rollen</option>
              <option value="admin">Admin</option>
              <option value="vorstand">Vorstand</option>
              <option value="spielleiter">Spielleiter</option>
              <option value="jugendwart">Jugendwart</option>
              <option value="kassenwart">Kassenwart</option>
              <option value="trainer">Trainer</option>
              <option value="mitglied">Mitglied</option>
              <option value="eltern">Eltern</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="status-filter" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground block mb-2">
              Status
            </label>
            <select 
              id="status-filter" 
              name="status" 
              defaultValue={filters.status ?? ""} 
              className="editorial-underline-input text-sm focus:ring-0 cursor-pointer min-w-32 bg-background"
            >
              <option value="">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="resigned">Ausgetreten</option>
              <option value="honorary">Ehrenmitglied</option>
            </select>
          </div>
          <div className="flex items-end gap-4">
            <button type="submit" className="text-xs uppercase tracking-widest font-semibold text-background bg-foreground px-4 py-2 hover:bg-foreground/80 transition-colors">
              Filtern
            </button>
            <Link href="/dashboard/members" className="text-xs uppercase tracking-widest font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-transparent hover:border-foreground">
              Reset
            </Link>
          </div>
        </div>
      </form>

      {activeFilters.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3" aria-label="Aktive Filter">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Aktive Filter:</span>
          {activeFilters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.href}
              className="inline-flex items-center gap-2 border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest text-foreground hover:border-foreground transition-colors"
            >
              {filter.label}
              <X className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Filter entfernen</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
