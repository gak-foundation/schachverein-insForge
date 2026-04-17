
# Datenbank-Schema

Die Datenbank nutzt **PostgreSQL 17** und wird über **Drizzle ORM** verwaltet.

## Tabellen-Struktur

Das Schema ist modular in \src/lib/db/schema.ts\ definiert und umfasst folgende Kernbereiche:

### 1. Authentifizierung & Organisation
- \uthUsers\, \uthSessions\, \uthAccounts\: Better Auth Tabellen.
- \clubs\: Mandanten (Vereine).
- \clubMemberships\: Verknüpfung von Benutzern zu Vereinen mit Rollen.

### 2. Mitgliederverwaltung
- \members\: Stammdaten der Vereinsmitglieder.
- \dwzHistory\: Historie der DWZ-Zahlen.

### 3. Sportbetrieb & Turniere
- \seasons\: Spielzeiten.
- \	eams\: Mannschaften eines Vereins.
- \	ournaments\: Turniere (Schweizer System, Berger, etc.).
- \games\: Einzelpartien mit PGN-Daten.

### 4. Verwaltung & Finanzen
- \payments\: Beitragszahlungen und Status.
- \uditLog\: Protokollierung aller sicherheitsrelevanten Aktionen.

## Migrationen

Migrationen werden mit \drizzle-kit\ verwaltet:
- Generieren: \
pm run db:generate\
- Anwenden: \
pm run db:push\

