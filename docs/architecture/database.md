
# Datenbank-Schema

Die Datenbank nutzt **PostgreSQL 17** und wird über das **InsForge SDK** verwaltet.

## Tabellen-Struktur

Das Schema ist modular in `src/lib/db/schema/` definiert und umfasst folgende Kernbereiche:

### 1. Authentifizierung & Organisation
- `users`: Profiltabelle (wird via InsForge Auth synchronisiert).
- `clubs`: Mandanten (Vereine).
- `clubMemberships`: Verknüpfung von Benutzern zu Vereinen mit Rollen.

### 2. Mitgliederverwaltung
- \members\: Stammdaten der Vereinsmitglieder.
- \dwzHistory\: Historie der DWZ-Zahlen.

### 3. Sportbetrieb & Turniere
- \seasons\: Spielzeiten.
- \	eams\: Mannschaften eines Vereins.
- \	ournaments\: Turniere (Schweizer System, Berger, etc.).
- \games\: Einzelpartien mit Verlinkung zu Lichess.

### 4. Verwaltung & Finanzen
- \payments\: Beitragszahlungen und Status.
- \uditLog\: Protokollierung aller sicherheitsrelevanten Aktionen.

## Schema-Management

Das Datenbank-Schema wird über InsForge MCP Tools verwaltet:
- `run-raw-sql` für Schema-Änderungen
- `get-table-schema` zum Abrufen der Tabellenstruktur
- Seed-Daten: `npm run db:seed`

