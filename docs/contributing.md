
# Contributing & Entwicklung

## Lokales Setup

1. **Repository klonen**
2. **Abhängigkeiten installieren**: `npm install`
3. **Umgebung konfigurieren**: `cp .env.example .env` (Werte anpassen)
4. **Infrastruktur starten**: `npm run docker:up` (startet Postgres, Redis, MinIO)
5. **Datenbank vorbereiten**: `npm run db:push` gefolgt von `npm run db:seed`
6. **Entwicklungsserver starten**: `npm run dev`

## Code-Style & Standards

- **TypeScript**: Strict Mode ist aktiviert.
- **Komponenten**: Nutze shadcn/ui-Komponenten aus `src/components/ui`.
- **Styling**: Tailwind CSS 4 Utility Classes.
- **Server Actions**: Mutationen in `src/lib/actions/` (thematische Dateien, siehe `index.ts`).
- **Validierung**: Zod-Schemas unter `src/lib/validations/` (Re-Exports in `index.ts` wo sinnvoll).

## Testing

- **Unit Tests**: `npm run test` (Vitest, Watch-Modus) bzw. `npm run test:ci` (einmaliger Lauf, z. B. für CI)
- **E2E Tests**: `npm run test:e2e` (Playwright; startet bei Bedarf den Dev-Server, siehe `playwright.config.ts`)

Vor jedem Pull Request bitte `npm run build` und `npm run test:ci` lokal ausführen (mit gesetzten Umgebungsvariablen wie in `.env.example`). ESLint (`npm run lint`) lokal ausführen ist sinnvoll; im GitHub-Workflow **CI** ist Lint aktuell noch nicht enthalten, weil im Projekt noch viele bestehende ESLint-Fehler behoben werden müssen.
