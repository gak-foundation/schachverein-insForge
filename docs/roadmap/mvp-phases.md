# MVP-Phasen für die Schachvereins-Software

## 🎯 Grundprinzip: Was ersetzt sofort den größten Schmerz?

Die meisten Schachvereine arbeiten heute mit einer Mischung aus:
- Excel-Listen für Mitglieder
- E-Mail / WhatsApp für Kommunikation
- SwissChess auf einem einzelnen Laptop für Turniere
- Eine veraltete WordPress-Seite als Vereinswebsite
- Papierzettel für Mannschaftsaufstellungen

Das MVP muss **mindestens eines** dieser Probleme deutlich besser lösen, sonst gibt es keinen Grund zum Wechsel.

---

## 🏁 Release 1 — „Vereinskern" (MVP)

> **Ziel:** Die Software ist nutzbar als zentrale Vereinsplattform. Mitglieder können sich einloggen, der Vorstand kann verwalten.
> **Geschätzter Aufwand:** 6–10 Wochen (Solo-Entwickler, Teilzeit)

### Mitgliederverwaltung

| Feature | Details | Priorität |
|---|---|---|
| Mitglieder-CRUD | Name, Geburtsdatum, Kontakt, Eintrittsdatum | 🔴 Must |
| Rollen & Rechte | Admin, Vorstand, Mitglied (einfaches Modell) | 🔴 Must |
| Mitgliederliste | Filterbar, sortierbar, durchsuchbar | 🔴 Must |
| CSV-Import | Migration aus bestehenden Excel-Listen | 🔴 Must |
| CSV-Export | Für Verbandsmeldungen etc. | 🔴 Must |
| DWZ/Elo-Feld | Manuell gepflegt, pro Mitglied sichtbar | 🟡 Should |
| Familien-Verknüpfung | Eltern-Kind-Zuordnung | 🟢 Nice |

### Authentifizierung

| Feature | Details | Priorität |
|---|---|---|
| E-Mail/Passwort-Login | Über Supabase Auth | 🔴 Must |
| Passwort-Reset | Standard-Flow | 🔴 Must |
| Einladungs-System | Vorstand lädt Mitglieder per E-Mail ein | 🔴 Must |
| OAuth | Login with Lichess / Google | 🟡 Should |

### Öffentliche Vereinswebsite

| Feature | Details | Priorität |
|---|---|---|
| Startseite | Vereinsname, Logo, Beschreibung, Kontakt | 🔴 Must |
| Terminkalender | Öffentliche Termine (Training, Turniere) | 🔴 Must |
| Mannschaftsübersicht | Welche Teams spielen in welcher Liga? | 🟡 Should |
| News/Aktuelles | Einfacher Blog oder Nachrichtenliste | 🟡 Should |
| Impressum & Datenschutz | DSGVO-Pflicht | 🔴 Must |

### Technik-Checkliste für Release 1

```
✅ Next.js + TypeScript Projekt aufgesetzt
✅ PostgreSQL + Drizzle Schema (Members, Users, Roles)
✅ Supabase Auth (E-Mail/Passwort, JWT)
✅ Basis-Layout: Öffentlich vs. interner Bereich
✅ Responsives Design (Tailwind + shadcn/ui)
✅ Docker-Setup + Deployment auf Supabase/Vercel
✅ Automatische Backups (Supabase PITR)
✅ DSGVO: Datenschutzerklärung, Cookie-Hinweis
✅ @media print Stylesheet für Mitgliederliste
```


### Datenmodell Release 1

```prisma
model Club {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  members   ClubMembership[]
}

model User {
  id        String   @id @default(uuid()) // Supabase Auth UUID
  email     String   @unique
  name      String?
  memberships ClubMembership[]
}

model Member {
  id            String   @id @default(uuid())
  clubId        String
  firstName     String
  lastName      String
  dateOfBirth   DateTime?
  email         String?
  phone         String?
  dwz           Int?
  elo           Int?
  joinedAt      DateTime @default(now())
  memberships   ClubMembership[]
}

model ClubMembership {
  id            String   @id @default(uuid())
  clubId        String
  userId        String?
  memberId      String
  role          Role     @default(mitglied)
}

model Event {
  id          String   @id @default(uuid())
  clubId      String
  title       String
  description String?
  date        DateTime
  isPublic    Boolean  @default(true)
  type        EventType
}

enum Role {
  admin
  vorstand
  sportwart
  jugendwart
  kassenwart
  trainer
  mitglied
  eltern
}

enum EventType {
  TRAINING
  TOURNAMENT
  MEETING
  LEAGUE_MATCH
  OTHER
}
```

> **Nach Release 1 hat der Verein:** Eine moderne Website mit Terminkalender, einen internen Bereich mit Mitgliederverwaltung und ein Login-System. Das allein ist für viele kleine Vereine schon ein enormer Fortschritt.

---

## 🏆 Release 2 — „Turnier & Ergebnisse"

> **Ziel:** Der Verein kann Turniere und Ligaergebnisse digital erfassen und öffentlich anzeigen.
> **Geschätzter Aufwand:** 6–8 Wochen

### Turnierverwaltung

| Feature | Details | Priorität |
|---|---|---|
| Turnier anlegen | Name, Datum, Modus (Runde/Schweizer), Teilnehmer | 🔴 Must |
| Rundenturnier-Paarung | Einfache Round-Robin-Generierung (Berger-Tabelle) | 🔴 Must |
| Ergebniseingabe | Pro Partie: Weiß, Schwarz, Ergebnis (1-0, ½-½, 0-1) | 🔴 Must |
| Tabelle/Rangliste | Automatisch berechnet, öffentlich sichtbar | 🔴 Must |
| TRF-Import | Ergebnisse aus SwissChess/ChessResults importieren | 🔴 Must |
| Schweizer System | Über bbpPairings/JaVaFo als externen Service | 🟡 Should |
| Kreuztabelle | Klassische Darstellung für Rundenturniere | 🟡 Should |

### Mannschaftskampf / Ligabetrieb

| Feature | Details | Priorität |
|---|---|---|
| Mannschaften verwalten | Spieler zuordnen, Brettreihenfolge festlegen | 🔴 Must |
| Spieltag erfassen | Heim/Gast, Ergebnis je Brett | 🔴 Must |
| Saisonübersicht | Alle Spieltage einer Saison mit Ergebnissen | 🔴 Must |
| Spielerverfügbarkeit | Mitglieder melden sich verfügbar/nicht verfügbar | 🟡 Should |
| Aufstellungsvorschlag | Basierend auf DWZ und Verfügbarkeit | 🟢 Nice |

### Drucken

| Feature | Details | Priorität |
|---|---|---|
| Paarungslisten drucken | Pro Runde, druckoptimiert | 🔴 Must |
| Ergebnislisten drucken | Rangtabelle, Kreuztabelle | 🔴 Must |
| Mannschaftsaufstellung | Druckbare Aufstellung für den Spieltag | 🟡 Should |

**Umsetzung:** `@media print` CSS-Regeln reichen für den Start. PDF-Erzeugung (Puppeteer/react-pdf) kommt in einem späteren Release.

### Erweitertes Datenmodell Release 2

```prisma
model Tournament {
  id           String       @id @default(uuid())
  clubId       String
  name         String
  startDate    DateTime
  endDate      DateTime?
  type         TournamentType
  rounds       Int
  status       TournamentStatus @default(PLANNED)
  season       Season?      @relation(fields: [seasonId], references: [id])
  seasonId     String?
  participants TournamentParticipant[]
  games        Game[]
}

model TournamentParticipant {
  id           String     @id @default(uuid())
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  tournamentId String
  member       Member     @relation(fields: [memberId], references: [id])
  memberId     String
  score        Float      @default(0)
  rank         Int?

  @@unique([tournamentId, memberId])
}

model Game {
  id           String     @id @default(uuid())
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  tournamentId String
  round        Int
  board        Int?
  white        Member     @relation("WhiteGames", fields: [whiteId], references: [id])
  whiteId      String
  black        Member     @relation("BlackGames", fields: [blackId], references: [id])
  blackId      String
  result       GameResult?
  lichessUrl   String?    // Lichess-Link kommt in Release 3
  playedAt     DateTime?
}

model Team {
  id        String       @id @default(uuid())
  clubId    String
  name      String       // z.B. "SC Beispiel 1" 
  league    String?      // z.B. "Bezirksliga Nord"
  season    Season       @relation(fields: [seasonId], references: [id])
  seasonId  String
  members   TeamMember[]
  matches   LeagueMatch[]
}

model TeamMember {
  id       String @id @default(uuid())
  team     Team   @relation(fields: [teamId], references: [id])
  teamId   String
  member   Member @relation(fields: [memberId], references: [id])
  memberId String
  boardOrder Int  // Brettreihenfolge

  @@unique([teamId, memberId])
}

model Season {
  id          String       @id @default(uuid())
  clubId      String
  name        String       // z.B. "2025/2026"
  startDate   DateTime
  endDate     DateTime
  teams       Team[]
  tournaments Tournament[]
}

enum TournamentType {
  ROUND_ROBIN
  SWISS
  QUICK
  BLITZ
}

enum TournamentStatus {
  PLANNED
  RUNNING
  FINISHED
}

enum GameResult {
  WHITE_WINS  // 1-0
  BLACK_WINS  // 0-1
  DRAW        // ½-½
  FORFEIT_WHITE
  FORFEIT_BLACK
  NOT_PLAYED
}
```

> **Nach Release 2 hat der Verein:** Eine vollständige Plattform für den Alltag — Mitglieder, Termine, Turniere, Liga-Ergebnisse. Der Sportwart kann Ergebnisse eingeben und sofort auf der Website veröffentlichen. SwissChess-Daten können importiert werden. **Das ist für viele Vereine bereits ausreichend.**

---

## ♟️ Release 3 — „Schachbrett & Partien"

> **Ziel:** Die Software wird zur Partiedatenbank mit interaktiver Darstellung.
> **Geschätzter Aufwand:** 4–6 Wochen

| Feature | Details | Priorität |
|---|---|---|
| Lichess-Verlinkung | Partien auf Lichess verlinken statt lokal speichern | 🔴 Must |
| Metadaten-Import | Metadaten (Spieler, Ergebnis, ECO) aus PGN extrahieren | 🔴 Must |
| Partie-Datenbank | Archiv aller Vereinspartien (via Lichess-Links) durchsuchbar | 🔴 Must |
| Partie ↔ Turnier | Verknüpfung mit Turnier, Runde, Brett | 🔴 Must |
| Eröffnungserkennung | Automatisch aus PGN extrahieren (ECO-Code) | 🟡 Should |
| Lichess/Chess.com Connect | Automatischer Import von Partielinks via API | 🟡 Should |
| Stockfish-Analyse | Optionaler clientseitiger Engine-Check | 🟢 Nice |
| Partie der Woche | Kuratierte Partie (Link) auf der Startseite | 🟢 Nice |

```
┌─────────────────────────────────────────────┐
│  Analyse auf Lichess                        │
│ ┌─────────┐  Weiß: Müller (2100)            │
│ │ ♜♞♝♛♚♝ │  Schwarz: Schmidt (2050)         │
│ │ ♟♟♟♟♟♟ │  Ergebnis: 1-0                  │
│ │         │                                  │
│ │ ♙♙♙♙♙♙ │  Eröffnung: Spanisch (C84)      │
│ │ ♖♘♗♕♔♗ │                                  │
│ └─────────┘                                  │
│  [Auf Lichess.org ansehen ↗]                 │
└─────────────────────────────────────────────┘
```

> **Nach Release 3:** Der Verein hat eine lebendige Partiedatenbank. Vereinsmeisterschaften werden mit Partien dokumentiert, Mitglieder können ihre Partien nachspielen. **Das ist das Alleinstellungsmerkmal gegenüber generischer Vereinssoftware.**

---

## 💰 Release 4 — „Beiträge & Kommunikation"

> **Ziel:** Beitragswesen und strukturierte Kommunikation ersetzen Excel + E-Mail.
> **Geschätzter Aufwand:** 4–6 Wochen

### Beitragswesen

| Feature | Details | Priorität |
|---|---|---|
| Beitragsmodelle | Erwachsene, Jugend, Familie, Ermäßigt, Passiv | 🔴 Must |
| Beitragszuordnung | Automatisch basierend auf Alter/Status | 🔴 Must |
| Zahlungsstatus | Bezahlt / Offen / Gemahnt — pro Mitglied, pro Jahr | 🔴 Must |
| SEPA-XML-Export | Lastschriftdatei für die Bank generieren | 🔴 Must |
| Rechnungs-PDF | Automatisch erzeugt, per E-Mail versendbar | 🟡 Should |
| Stripe/Mollie-Integration | Online-Zahlung mit SEPA-Lastschrift | 🟢 Nice |

### Kommunikation

| Feature | Details | Priorität |
|---|---|---|
| Rundmail an Gruppen | An alle, an Mannschaft X, an Jugend etc. | 🔴 Must |
| Benachrichtigungen | Neue Termine, Ergebnisse, Erinnerungen | 🟡 Should |
| Newsletter (öffentlich) | Über Brevo/Mailjet mit Einwilligung | 🟡 Should |

### Erweitertes Rollenmodell

```typescript
enum Role {
  admin           // Technischer Administrator
  vorstand        // Vorstand (z.B. 1. Vorsitzender, allgemein)
  sportwart       // Sportwart
  jugendwart      // Jugendwart
  kassenwart      // Kassenwart
  trainer         // Trainer
  mitglied        // Reguläres Mitglied
  eltern          // Eltern-Zugang (nur Lesen, eigene Kinder)
}
```

---

## 🔄 Release 5 — „Integrationen & Automatisierung"

> **Ziel:** Anbindung an die Schach-Infrastruktur, weniger manuelle Arbeit.
> **Geschätzter Aufwand:** 4–6 Wochen

| Feature | Details |
|---|---|
| **DeWIS-Sync** | Automatischer DWZ-Abgleich (Asynchrone Hintergrund-Tasks) |
| **Lichess-Integration** | Online-Turnier-Ergebnisse importieren, Lichess-Profile verknüpfen |
| **Schweizer System** | bbpPairings/JaVaFo als Microservice integriert |
| **Ergebnismeldung** | Export im Format des Landesverbands |
| **Statistik-Dashboard** | Mitgliederentwicklung, DWZ-Verlauf, Aktivitätsstatistiken |
| **Audit-Log** | Vollständige Protokollierung aller Datenänderungen |
| **Offline-Modus** | Service Worker + IndexedDB für Ergebniseingabe ohne Internet |

---

## 📊 Zusammenfassung: Release-Roadmap

```
Release 1 ─ Vereinskern          ██████████░░░░░░░░░░  6-10 Wo.
  Mitglieder · Login · Website · Kalender

Release 2 ─ Turnier & Ergebnisse ████████████████░░░░  6-8 Wo.
  Turniere · Liga · Mannschaften · Drucken

Release 3 ─ Schachbrett & Partien ██████████████████░░  4-6 Wo.
  Lichess · Analyse · Partiedatenbank

Release 4 ─ Beiträge & Komm.     ████████████████████  4-6 Wo.
  Beiträge · SEPA · Rundmails

Release 5 ─ Integrationen        ████████████████████  4-6 Wo.
  DeWIS · Lichess · Swiss System · Offline
```

| Release | Wert für den Verein | Veröffentlichbar? |
|---|---|---|
| **Release 1** | Ersetzt WordPress + Excel-Mitgliederliste | ✅ Ja — Soft Launch |
| **Release 2** | Ersetzt Papierzettel + manuelle Ergebnispflege | ✅ Ja — **Empfohlener öffentlicher Launch** |
| **Release 3** | Alleinstellungsmerkmal: Partiedatenbank | ✅ Ja |
| **Release 4** | Ersetzt Kassenwart-Excel + E-Mail-Verteiler | ✅ Ja |
| Release 5 | Vollautomatisierung, Profi-Features | ✅ Ja |

---

## 🚀 Launch-Vorbereitung

Bevor das System live geht, müssen die [technischen Voraussetzungen für den Launch](../deployment/launch-checklist.md) erfüllt sein. Diese Checkliste umfasst Infrastruktur, DSGVO, Sicherheit und Monitoring.

---

## 💡 Meine Empfehlung

> **Veröffentliche nach Release 2.** Das ist der Punkt, an dem die Software einen echten, täglichen Nutzen für den Verein hat: Mitglieder verwalten, Termine planen, Turnier- und Ligaergebnisse erfassen und auf der Website anzeigen. Alles, was der Sportwart und der Vorstand am häufigsten brauchen, ist abgedeckt.
>
> Release 1 allein ist für einen internen Soft Launch geeignet (Vorstand testet), aber noch kein überzeugender Grund für alle Mitglieder, die Software zu nutzen. Erst mit den Turnierergebnissen und der Mannschaftsverwaltung in Release 2 wird es **unverzichtbar**.
>
> Release 3 (Partiedatenbank) ist dann der „Wow-Moment", der die Software von generischen Vereinstools abhebt.