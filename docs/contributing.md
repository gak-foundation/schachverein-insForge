
# Contributing & Entwicklung

## Lokales Setup

1. **Repository klonen**
2. **Abhängigkeiten installieren**: \
pm install\
3. **Umgebung konfigurieren**: \cp .env.example .env\ (Werte anpassen)
4. **Infrastruktur starten**: \
pm run docker:up\ (startet Postgres, Redis, MinIO)
5. **Datenbank vorbereiten**: \
pm run db:push\ gefolgt von \
pm run db:seed\
6. **Entwicklungsserver starten**: \
pm run dev\

## Code-Style & Standards

- **TypeScript**: Strict Mode ist aktiviert.
- **Komponenten**: Nutze \shadcn/ui\ Komponenten aus \src/components/ui\.
- **Styling**: Tailwind CSS 4 Utility Classes.
- **Server Actions**: Alle Mutationen in \src/lib/actions.ts\.
- **Validierung**: Zod Schemas in \src/lib/validations/index.ts\.

## Testing

- **Unit Tests**: \
pm run test\ (Vitest)
- **E2E Tests**: \
pm run test:e2e\ (Playwright)

Vor jedem Pull Request bitte \
pm run lint\ und \
pm run build\ lokal ausführen.

