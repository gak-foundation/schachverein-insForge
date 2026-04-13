# Techstack für Vereins-Software speziell für Schachvereine

## 🎯 Kernanforderungen eines Schachvereins

Bevor es an die Technologie geht, müssen die fachlichen Anforderungen klar sein. Eine Schachvereins-Software geht weit über klassische Vereinsverwaltung hinaus:

### Kernmodule
- **Mitgliederverwaltung** (inkl. Familien-/Eltern-Kind-Verknüpfungen)
- **Beitragswesen & Finanzen** (SEPA-Lastschrift!)
- **Rollen- und Rechtesystem** (Admin, Vorstand, Sportwart, Jugendwart, Kassenwart, Trainer, Mitglied, Eltern-Zugang)
- **Kalender & Veranstaltungen**
- **Mannschaften & Ligabetrieb**
- **Dokumente & Protokolle**
- **Newsletter / Rundmails**
- **Öffentliche Vereinswebsite**

### Schachspezifische Module
- **DWZ/Elo-Tracking** pro Mitglied
- **Turnierverwaltung** (Schweizer System, Rundenturniere, Schnellschach, Blitz)
- **PGN-Import/Export & Partiedatenbank**
- **Mannschaftsaufstellungen & Brettreihenfolge**
- **Ergebniserfassung je Brett**
- **Spielerverfügbarkeit**
- **Vereinsmeisterschaft**
- **Integration in Landesverbands-Prozesse**

---

## 🏗️ Empfohlener Techstack

### Frontend

| Komponente | Empfehlung | Begründung |
|---|---|---|
| Framework | **Next.js** (React) | SSR für SEO (Vereinswebsite), App-Router, API-Routen, alles in einem |
| Sprache | **TypeScript** | Verhindert Fehler bei komplexen Datenstrukturen (Spieler, Turniere, Partien) |
| Styling | **Tailwind CSS** | Utility-first, schnelle Entwicklung |
| UI-Library | **shadcn/ui** | Professionelle, barrierefreie Komponenten für Tabellen, Dashboards, Formulare |
| Schachbrett | **react-chessboard** | Gut gepflegte React-Komponente für interaktive Bretter |
| Schachlogik | **chess.js** | Zugvalidierung, FEN, PGN-Parsing — der Standard im JS-Ökosystem |
| PGN-Viewer | **@mliebelt/pgn-viewer** oder eigene Komponente | Partien nachspielbar auf der Website |
| State Management | **Zustand** | Leichtgewichtig, unkompliziert |

> **Zur Schachbrett-Wahl:** `react-chessboard` integriert sich nahtlos in React/Next.js-Projekte. `chessground` (die Lichess-Bibliothek) ist ebenfalls hervorragend, erfordert aber etwas mehr manuellen Wrapper-Code in React. Für ein Next.js-Projekt ist `react-chessboard` der pragmatischere Einstieg.

### Backend

| Komponente | Empfehlung | Begründung |
|---|---|---|
| MVP / kleines Team | **Next.js Server Actions + API Routes** | Frontend und Backend in einem Repository, schnelle Iteration |
| Skalierung / SaaS | **NestJS** (TypeScript) | Wenn mehrere Vereine bedient werden oder komplexe Rechte nötig sind |
| Alternative (Python) | **FastAPI** + **python-chess** | Wenn komplexe Schachlogik (Analyse, PGN-Mining) im Backend zentral ist |
| API-Stil | **tRPC** (mit Next.js) oder **REST** | tRPC bietet End-to-End-Typsicherheit im TypeScript-Monolithen |

**Empfehlung:** Starte mit Next.js fullstack. Wenn das Projekt wächst (Multi-Club, SaaS), lässt sich das Backend sauber in NestJS auslagern. Für datenintensive Schachanalyse kann ein kleiner Python-Microservice ergänzt werden.

### Datenbank

| Komponente | Empfehlung | Begründung |
|---|---|---|
| Relationale DB | **PostgreSQL** | Perfekt für stark strukturierte Daten: Spieler ↔ Turniere ↔ Partien ↔ Saisons |
| ORM | **Prisma** | Typsichere Queries, automatische Migrationen, hervorragende DX |
| Alternative ORM | **Drizzle ORM** | Leichtgewichtiger, näher an SQL, sehr performant |
| Cache | **Redis** | Sessions, Live-Ergebnisse, Job-Queue |

> **Warum kein NoSQL?** Schachvereinsdaten sind hochgradig relational. Ein Spieler spielt eine Partie in einem Turnier, das zu einer Saison gehört, in einer Mannschaft, die in einer Liga spielt. PostgreSQL bildet das sauber ab und ermöglicht komplexe Queries wie _„Zeige alle Spieler, die mit Weiß gegen die Französische Verteidigung in der Saison 2023 gewonnen haben"_.

### Auth & Rollen

| Komponente | Empfehlung | Begründung |
|---|---|---|
| Auth | **Auth.js** (NextAuth) | Mitglieder-Login, OAuth-Provider |
| Lichess OAuth | **Login with Lichess** | Mitglieder können sich optional über ihr Lichess-Konto anmelden |
| Multi-Club/SaaS | **Keycloak** | Wenn die Software für mehrere Vereine betrieben wird |

**Rollenmodell für Schachvereine:**
- Admin
- Vorstand
- Sportwart
- Jugendwart
- Kassenwart
- Trainer
- Mitglied
- Eltern-Zugang (optional, aber wichtig bei Jugendarbeit)

### Background Jobs & E-Mail

| Komponente | Empfehlung | Begründung |
|---|---|---|
| Job-Queue | **BullMQ** (auf Redis) | E-Mail-Versand, Erinnerungen, DWZ-Sync, PDF-Erzeugung, Import/Export |
| E-Mail | **Brevo** oder **Mailjet** | EU-freundlich, DSGVO-konform, für Vereine praktikabel |

### Monitoring & Logging

| Komponente | Empfehlung | Begründung |
|---|---|---|
| Error-Tracking | **Sentry** | Fehler im Produktivbetrieb erkennen |
| Uptime | **Uptime Kuma** (self-hosted) | Verfügbarkeitsüberwachung |
| Audit-Log | **Eigene Implementierung** | DSGVO-Pflicht: Wer hat wann welche Daten geändert? |

---

## ♟️ Schach-spezifische Libraries & Engines

```bash
# JavaScript/TypeScript
npm install chess.js              # Zugvalidierung, FEN, PGN
npm install react-chessboard      # Interaktives Schachbrett (React)
npm install @mliebelt/pgn-viewer  # PGN-Nachspiel-Widget

# Python (falls Backend/Microservice in Python)
pip install python-chess           # Vollständige Schachlogik, PGN-Analyse
```

### Engine / Analyse (optional)
- **Stockfish WASM** — Ermöglicht Analyse direkt im Browser
  - „Fehler des Tages" für die Vereinswebsite
  - Partiebesprechung im Jugendtraining
  - Taktiktrainer mit Vereinspartien

### Turnierverwaltung: Schweizer System

Die Implementierung des Schweizer Systems nach FIDE-Regeln ist **äußerst komplex**. Hier eine klare Empfehlung:

> **Nicht selbst implementieren**, es sei denn, das ist euer Kernprodukt.

**Stattdessen:**
1. **FIDE-zertifizierte Engines als Microservice nutzen:** [bbpPairings](https://github.com/BieremaBoworworklaan/bbpPairings) (C++) oder [JaVaFo](https://github.com/FIDE-Pairing/JaVaFo) (Java) über eine kleine API kapseln
2. **TRF-Format (FIDE Tournament Report File)** als Austauschformat für Import/Export nutzen
3. **Ergebnisse und Tabellen** im eigenen System anzeigen, die Paarungsberechnung aber delegieren

Rundenturniere hingegen sind einfach genug, um sie selbst zu implementieren.

---

## 🗄️ Datenmodell (vereinfacht)

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Member   │────▶│  Tournament  │◀────│  Season  │
│           │     │  Participant │     │          │
│ - name    │     │              │     │ - year   │
│ - dwz     │     │ - score      │     │ - league │
│ - elo     │     │ - rank       │     └──────────┘
│ - role    │     └──────┬───────┘
│ - email   │            │
│ - family  │     ┌──────▼───────┐     ┌──────────┐
└─────┬─────┘     │    Game      │     │  Team    │
      │           │ - pgn        │     │ - name   │
      └──────────▶│ - result     │◀────│ - board  │
                  │ - white_id   │     │  order   │
                  │ - black_id   │     └──────────┘
                  │ - round      │
                  │ - opening    │
                  └──────────────┘
```

---

## 🔌 Externe Schnittstellen & Integrationen

| Anbindung | API/Format | Zweck |
|---|---|---|
| **DeWIS (DSB)** | Offizielle Exporte / CSV | DWZ-Daten synchronisieren |
| **Lichess API** | REST (offen) + OAuth | Spielerimport, Online-Turniere, Login |
| **Chess.com API** | REST | Partien importieren |
| **SwissChess / bbpPairings** | TRF-Format (FIDE) | Turnierauslosung |
| **DSB / Landesverbände** | Verschiedene | Ergebnismeldung |
| **Stripe / Mollie** | REST | Beitragszahlung (SEPA-Lastschrift!) |

> **Zur DWZ-Synchronisation:** Die DeWIS-Datenbank des DSB bietet begrenzte öffentliche Schnittstellen. Bevorzuge offizielle Exporte und CSV-Importe gegenüber fragilem Web-Scraping. Es gibt Community-Projekte, die den Zugriff erleichtern. Plane einen regelmäßigen BullMQ-Job für die automatische Synchronisation ein.

> **Zur Beitragszahlung:** SEPA-Lastschrift ist für deutsche Vereine praktisch Pflicht. Stripe und besonders Mollie bieten gute SEPA-Unterstützung.

---

## 🏠 Infrastruktur & Hosting

| Komponente | Empfehlung | Begründung |
|---|---|---|
| Server | **Hetzner Cloud** (Standort DE) | 5–10 €/Monat, DSGVO-konform 🇩🇪, exzellentes Preis-Leistungs-Verhältnis |
| Alternative (Frontend) | **Vercel** (kostenlos für kleine Projekte) | Einfaches Deployment für Next.js |
| Dateispeicher | **Hetzner Object Storage** oder **Cloudflare R2** | PGN-Dateien, Satzungen, Protokolle, Fotos |
| Container | **Docker** + **Docker Compose** | Reproduzierbare Umgebung, Self-Hosting-Option für andere Vereine |
| CI/CD | **GitHub Actions** | Automatisches Testing und Deployment |
| Backup | **Automatisiert** (pg_dump → S3) | Tägliche Datenbank-Backups, verschlüsselt |

---

## 📱 Mobile Strategie

| Option | Aufwand | Empfehlung |
|---|---|---|
| **PWA** (Progressive Web App) | Gering ⭐ | **Klare Empfehlung für den Start** |
| **Capacitor** (Hybrid) | Mittel | Nur wenn App-Store-Präsenz nötig |
| **React Native / Flutter** | Hoch | Erst bei nachgewiesenem Bedarf |

> Eine PWA reicht für die allermeisten Vereine: Mannschaftsführer können Ergebnisse unterwegs eintragen, Spieler sehen den Kalender, Eltern prüfen Trainingszeiten.

---

## 🛡️ DSGVO & Rechtliches (Kritisch für deutsche Vereine!)

Da Vereinssoftware umfangreich personenbezogene Daten verarbeitet — und Schachvereine oft viele **minderjährige Mitglieder** haben — ist DSGVO-Konformität kein Nice-to-have:

| Anforderung | Umsetzung |
|---|---|
| **Hosting in der EU** | Hetzner (Deutschland) |
| **AV-Verträge** | Mit allen Dienstleistern (Hosting, E-Mail, Storage) |
| **Rollen- und Rechtesystem** | Feingranulares Rechtemodell (siehe oben) |
| **Audit-Log** | Protokollierung von Datenänderungen |
| **Verschlüsselte Backups** | pg_dump → verschlüsselt → S3 |
| **Löschkonzept** | Automatisierte Löschfristen, Recht auf Vergessen |
| **Einwilligungen** | Fotos, Newsletter, Veröffentlichung von Ergebnissen |
| **Jugendschutz** | Getrennte Zugriffsrechte für Jugenddaten, Eltern-Zugang |
| **Datenschutzerklärung** | Auf der öffentlichen Website |

---

## 🚫 Was du am Anfang NICHT tun solltest

Folgende Patterns führen bei Vereinsprojekten zu Overengineering und Scheitern:

- ❌ Native App mit Flutter/React Native
- ❌ Microservices-Architektur
- ❌ Eigene Swiss-Pairing-Engine von Grund auf
- ❌ Event-Sourcing oder CQRS
- ❌ Kafka oder Message-Broker
- ❌ Kubernetes-Cluster
- ❌ GraphQL (REST/tRPC ist für diese Domäne ausreichend)

**Stattdessen:**
- ✅ Web-App + PWA
- ✅ Monolith (ggf. mit kleinem Microservice für Turnierpaarung)
- ✅ Saubere Rollen & Rechte
- ✅ Gute Import/Export-Funktionen
- ✅ Integration mit bestehenden Tools

---

## 🔄 Migration & Kompatibilität mit bestehenden Tools

Die meisten Schachvereine nutzen heute eine Mischung aus SwissChess, ChessResults und Excel-Tabellen. Die neue Software muss Migrationspfade bieten:

| Bestehendes Tool | Migrationsstrategie |
|---|---|
| **SwissChess / ChessResults** | TRF-Import für Turnierdaten |
| **Excel-Listen** | CSV-Import für Mitglieder, Ergebnisse |
| **PGN-Sammlungen** | Bulk-PGN-Import |
| **DeWIS-Daten** | Automatischer DWZ-Abgleich per Spieler-ID |

---

## 🖨️ Druck & Offline-Funktionalität

Zwei oft übersehene, aber in der Praxis **unverzichtbare** Anforderungen:

### Drucken
Turnierleitungen brauchen Ausdrucke — das ist Alltag im Amaturschach:
- Turnierpaarungen pro Runde
- Ergebnislisten / Rangtabellen
- Mannschaftsaufstellungen
- Urkunden

**Umsetzung:** Druckoptimierte CSS-Stylesheets (`@media print`) oder serverseitige PDF-Erzeugung (z.B. mit **Puppeteer** oder **@react-pdf/renderer**), ausgelöst als BullMQ-Job.

### Offline-Fähigkeit
Schachturniere finden oft in Schulen, Gemeindezentren oder Gasthäusern mit schlechtem Internet statt:
- **Service Worker** (PWA) für grundlegende Offline-Nutzung
- **Lokaler Zwischenspeicher** für Ergebniseingabe (IndexedDB)
- **Sync bei Wiederverbindung** — eingetragene Ergebnisse werden nachträglich synchronisiert

---

## 🧪 Testing-Strategie

Gerade die Turnierlogik und Ergebniserfassung müssen zuverlässig funktionieren:

| Testebene | Tools | Fokus |
|---|---|---|
| Unit Tests | **Vitest** | Turnierlogik, DWZ-Berechnung, PGN-Parsing |
| Integration Tests | **Vitest** + **Supertest** | API-Routen, Datenbankoperationen |
| E2E Tests | **Playwright** | Kritische Flows: Ergebniseingabe, Turniererstellung, Mitgliederregistrierung |

---

## 🌍 Internationalisierung

Auch wenn der Fokus zunächst auf deutschen Vereinen liegt:

- **next-intl** oder **i18next** für Mehrsprachigkeit
- Ermöglicht Wiederverwendbarkeit der Software in anderen Ländern (Österreich, Schweiz, international)
- Nützlich für Vereine mit internationalen Mitgliedern

---

## 📊 Build vs. Buy: Warum Eigenbau?

Bevor gebaut wird, sollte geprüft werden, ob existierende Lösungen ausreichen. Aktuelle Optionen wie ChessManager, vereinsflieger.de oder generische Vereinssoftware decken selten die Kombination aus:
- Schachspezifischer Funktionalität (PGN, DWZ, Turniersystem)
- Moderner Web-UI
- DSGVO-Konformität
- Anpassbarkeit

Wenn diese Kombination gebraucht wird, ist ein Eigenbau gerechtfertigt. **Aber:** Plane realistisch. Ein MVP mit den Kernfunktionen (Mitglieder, Termine, Ergebnisse, PGN-Viewer) ist von einem erfahrenen Entwickler in **3–6 Monaten** Teilzeitarbeit umsetzbar. Die volle Turnierverwaltung mit Swiss System und Ligabetrieb erfordert deutlich mehr.

---

## 🚀 Empfohlener Minimal-Stack (MVP)

```
Next.js + TypeScript + Prisma + PostgreSQL + Auth.js
+ Tailwind CSS + shadcn/ui
+ chess.js + react-chessboard
+ Redis + BullMQ
+ Docker auf Hetzner VPS
```

### Warum genau dieser Stack?
- **Schnell entwickelbar** — ein einzelner Entwickler kann produktiv sein
- **TypeScript durchgängig** — End-to-End-Typsicherheit
- **DSGVO-konform** — Hosting in Deutschland
- **Kosteneffizient** — unter 15 €/Monat Betriebskosten
- **Gute Entwicklerverfügbarkeit** — großes Ökosystem, leicht Helfer zu finden
- **Mobil nutzbar** — PWA out-of-the-box
- **Kein Overengineering** — Monolith, der bei Bedarf wachsen kann
- **Self-Hosting-fähig** — Docker-Image kann an andere Vereine verteilt werden

---

## 📁 Alternative Stacks

Falls das Team kein TypeScript bevorzugt:

| Stack | Wann sinnvoll |
|---|---|
| **Laravel + Vue/Inertia + PostgreSQL** | Team hat PHP-Erfahrung, Fokus auf schnelle CRUD-Entwicklung |
| **Django + HTMX + PostgreSQL** | Starkes Admin-Backend, Python-Affinität, einfache Nutzung von python-chess |
| **FastAPI + React + PostgreSQL** | Datenintensive Schachanalyse im Backend als Schwerpunkt |

---

## 📋 Zusammenfassung: Architekturübersicht

```
┌─────────────────────────────────────────────────┐
│                   Browser / PWA                  │
│  Next.js + React + shadcn/ui + react-chessboard │
│              + chess.js + Stockfish WASM         │
└──────────────────────┬──────────────────────────┘
                       │ tRPC / REST
┌──────────────────────▼──────────────────────────┐
│              Next.js API / Server Actions         │
│          Auth.js + Rollen + Audit-Log            │
│              BullMQ (Jobs über Redis)            │
└───────┬─────────────────┬───────────────┬───────┘
        │                 │               │
┌───────▼──────┐  ┌───────▼──────┐ ┌──────▼───────┐
│  PostgreSQL  │  │    Redis     │ │  S3 Storage  │
│   (Prisma)   │  │  (Cache/Jobs)│ │ (PGN, Docs)  │
└──────────────┘  └──────────────┘ └──────────────┘
        │
┌───────▼──────────────────────┐
│  Swiss Pairing Microservice  │
│  (bbpPairings / JaVaFo)     │
│  via TRF-Format              │
└──────────────────────────────┘

Externe APIs: Lichess · Chess.com · DeWIS · Stripe/Mollie
Hosting: Hetzner Cloud (Docker) · GitHub Actions (CI/CD)
```