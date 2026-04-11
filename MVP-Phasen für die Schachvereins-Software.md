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
| E-Mail/Passwort-Login | Über Auth.js | 🔴 Must |
| Passwort-Reset | Standard-Flow | 🔴 Must |
| Einladungs-System | Vorstand lädt Mitglieder per E-Mail ein | 🔴 Must |
| Lichess-OAuth | „Login with Lichess" | 🟢 Nice |

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
✅ PostgreSQL + Prisma Schema (Members, Users, Roles)
✅ Auth.js mit E-Mail/Passwort
✅ Basis-Layout: Öffentlich vs. interner Bereich
✅ Responsives Design (Tailwind + shadcn/ui)
✅ Docker-Setup + Deployment auf Hetzner
✅ Automatische Backups (pg_dump → S3, Cron)
✅ DSGVO: Datenschutzerklärung, Cookie-Hinweis
✅ @media print Stylesheet für Mitgliederliste
```

### Datenmodell Release 1

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(MEMBER)
  member    Member?
}

model Member {
  id            String   @id @default(cuid())
  firstName     String
  lastName      String
  dateOfBirth   DateTime?
  email         String?
  phone         String?
  dwz           Int?
  elo           Int?
  joinedAt      DateTime @default(now())
  isActive      Boolean  @default(true)
  userId        String?  @unique
  user          User?    @relation(fields: [userId], references: [id])
}

model Event {
  id          String   @id @default(cuid())
  title       String
  description String?
  date        DateTime
  isPublic    Boolean  @default(true)
  type        EventType
}

enum Role {
  ADMIN
  BOARD       // Vorstand
  MEMBER
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
  id           String       @id @default(cuid())
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
  id           String     @id @default(cuid())
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  tournamentId String
  member       Member     @relation(fields: [memberId], references: [id])
  memberId     String
  score        Float      @default(0)
  rank         Int?

  @@unique([tournamentId, memberId])
}

model Game {
  id           String     @id @default(cuid())
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  tournamentId String
  round        Int
  board        Int?
  white        Member     @relation("WhiteGames", fields: [whiteId], references: [id])
  whiteId      String
  black        Member     @relation("BlackGames", fields: [blackId], references: [id])
  blackId      String
  result       GameResult?
  pgn          String?    // PGN kommt in Release 3
  playedAt     DateTime?
}

model Team {
  id        String       @id @default(cuid())
  name      String       // z.B. "SC Beispiel 1" 
  league    String?      // z.B. "Bezirksliga Nord"
  season    Season       @relation(fields: [seasonId], references: [id])
  seasonId  String
  members   TeamMember[]
  matches   LeagueMatch[]
}

model TeamMember {
  id       String @id @default(cuid())
  team     Team   @relation(fields: [teamId], references: [id])
  teamId   String
  member   Member @relation(fields: [memberId], references: [id])
  memberId String
  boardOrder Int  // Brettreihenfolge

  @@unique([teamId, memberId])
}

model Season {
  id          String       @id @default(cuid())
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
| PGN-Upload | Einzelne Partien oder Bulk-Import (mehrere Partien pro Datei) | 🔴 Must |
| PGN-Viewer | Interaktives Nachspielen mit `react-chessboard` + `chess.js` | 🔴 Must |
| Partie-Datenbank | Alle Vereinspartien durchsuchbar (Spieler, Eröffnung, Ergebnis) | 🔴 Must |
| Partie ↔ Turnier | PGN wird mit Turnier, Runde, Brett verknüpft | 🔴 Must |
| Eröffnungserkennung | Automatisch aus PGN extrahieren (ECO-Code) | 🟡 Should |
| Lichess/Chess.com Import | Partien von Online-Plattformen importieren | 🟡 Should |
| Stockfish-Analyse | Im Browser via WASM, optionale Analyse-Ansicht | 🟢 Nice |
| Partie der Woche | Kuratierte Partie auf der Startseite | 🟢 Nice |

```
┌─────────────────────────────────────────────┐
│  PGN-Viewer  (react-chessboard + chess.js)  │
│ ┌─────────┐  1. e4 e5                       │
│ │ ♜♞♝♛♚♝ │  2. Nf3 Nc6                     │
│ │ ♟♟♟♟♟♟ │  3. Bb5 a6       ◀ ▶ ▶▶        │
│ │         │                                  │
│ │ ♙♙♙♙♙♙ │  Eröffnung: Spanisch (C84)      │
│ │ ♖♘♗♕♔♗ │  Ergebnis: 1-0                  │
│ └─────────┘                                  │
│  [PGN herunterladen]  [Mit Stockfish analysieren] │
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
  ADMIN           // Technischer Administrator
  PRESIDENT       // 1. Vorsitzender
  BOARD_MEMBER    // Vorstand allgemein
  SPORT_DIRECTOR  // Sportwart
  YOUTH_DIRECTOR  // Jugendwart
  TREASURER       // Kassenwart
  TRAINER         // Trainer
  MEMBER          // Reguläres Mitglied
  PARENT          // Eltern-Zugang (nur Lesen, eigene Kinder)
}
```

---

## 🔄 Release 5 — „Integrationen & Automatisierung"

> **Ziel:** Anbindung an die Schach-Infrastruktur, weniger manuelle Arbeit.
> **Geschätzter Aufwand:** 4–6 Wochen

| Feature | Details |
|---|---|
| **DeWIS-Sync** | Automatischer DWZ-Abgleich (BullMQ-Cronjob) |
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
  PGN · Viewer · Partiedatenbank

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
| **Release 5** | Vollautomatisierung, Profi-Features | ✅ Ja |

---

## 💡 Meine Empfehlung

> **Veröffentliche nach Release 2.** Das ist der Punkt, an dem die Software einen echten, täglichen Nutzen für den Verein hat: Mitglieder verwalten, Termine planen, Turnier- und Ligaergebnisse erfassen und auf der Website anzeigen. Alles, was der Sportwart und der Vorstand am häufigsten brauchen, ist abgedeckt.
>
> Release 1 allein ist für einen internen Soft Launch geeignet (Vorstand testet), aber noch kein überzeugender Grund für alle Mitglieder, die Software zu nutzen. Erst mit den Turnierergebnissen und der Mannschaftsverwaltung in Release 2 wird es **unverzichtbar**.
>
> Release 3 (Partiedatenbank) ist dann der „Wow-Moment", der die Software von generischen Vereinstools abhebt.