# 📋 Ausführliche Funktionsliste: schach.studio / Schachverein-Software

Basierend auf den drei bereitgestellten Konzeptdokumenten folgt eine konsolidierte, ausführliche Übersicht aller Funktionen und Funktionalitäten des Online Schach Club Managers.

---

## 🧭 1. Benutzer-, Rollen- & Rechtemanagement (RBAC)

### Rollensystem (8 vordefinierte Rollen)

| Rolle | Hauptverantwortung |
|-------|-------------------|
| `admin` | System- & Plattform-Administration |
| `vorstand` | Vereinsleitung, rechtliche Protokolle, Mitgliederversammlungen |
| `sportwart` / Turnierleiter | Auslosungen, Ergebnisse, Verbandsexporte |
| `jugendwart` | Jugendarbeit, Eltern-Kommunikation |
| `kassenwart` | Beiträge, SEPA, Mahnwesen, Finanzberichte |
| `trainer` | Jugendtraining, Lichess-Archiv, Fortschrittsanalyse |
| `mitglied` / Spieler | Turnieranmeldung, Statistiken, interne Kommunikation |
| `eltern` | Eltern-Portal für Jugendschach |
| *(zusätzlich)* Mannschaftsführer | Aufstellung, Ersatzspieler-Management |

### Funktionen
- **23 feingranulare Berechtigungen** (z. B. `finance.sepa`, `tournaments.results`, `members.edit`)
- **Per-User Overrides**: Individuelle Rechte-Abweichungen pro Nutzer
- **Multi-Tenant-Mitgliedschaft**: Ein Benutzer kann Mitglied in mehreren Vereinen sein, Rolle pro Verein unterschiedlich
- **Nahtloser Verein-Wechsel** im Frontend
- **Einladungssystem** für neue Mitglieder (`clubInvitations`)

---

## 👥 2. Mitgliederverwaltung

<details open>
<summary><b>Digitale Mitgliederakte (Kernfunktionen)</b></summary>

- **Stammdaten**: Name, Adresse, Kontakt, Geburtsdatum
- **Verbands-IDs**: FIDE-ID, DSB-ID, nationale Verbands-IDs
- **Wertungszahlen**: DWZ/ELO mit vollständiger Historie (`dwzHistory`)
- **Mitgliedsstatus**: aktiv / passiv / ermäßigt / Ehrenmitglied
- **Familien-Verknüpfungen**: `ParentID` für Jugendliche → Eltern-Zuordnung
- **Verfügbarkeitsabfragen** (`availability`) für Mannschaftsspiele
- **DSGVO-Einwilligungen** pro Datenverarbeitungszweck
- **Bild- und Namensnennungs-Einwilligungen** (Website, Social Media)

</details>

<details>
<summary><b>Weitere Mitgliederfunktionen</b></summary>

- Beitrittsdatum und Vereinsjubiläen
- Austrittsmanagement mit DSGVO-konformem Lösch-Workflow
- Notizen-Funktion (intern, rollenbasiert sichtbar)
- Import/Export (CSV, Excel) für Migration aus Altsystemen
- Massenmutationen (Statusänderungen, Beitragsstufen-Updates)

</details>

---

## 🏛️ 3. Vereins- & Klub-Management (Multi-Tenant)

- **Mehrere Klubs** parallel verwalten (Mandantenfähigkeit)
- **Klub-Profil**: Logo, Farben, Kontakt, Satzung, Vereinsregister-Nr.
- **White-Labeling** (geplant, Phase 4): Eigene Domain, eigenes Branding
- **Verbandslösung**: Landesverbände können zentral für Untervereine bereitstellen
- **Öffentliche Vereinsseite**: SEO-optimiert (Next.js SSR) mit Terminen, News, Kontakt

---

## 💶 4. Finanzwesen & Beitragswesen

### Beitragsverwaltung
- **Beitragsstufen** (`contributionRates`): aktiv, passiv, Jugend, Familie, ermäßigt
- **Automatische Beitragsberechnung** nach Mitgliedsstatus und Alter
- **Fällige Zahlungen** (`payments`) mit Status-Tracking

### SEPA-Integration
- **SEPA-XML Export** nach Standard `pain.008` (Lastschriften)
- **Mandatsverwaltung** mit verschlüsselter IBAN-Speicherung (AES-256-GCM)
- **Pre-Notification** für Lastschriften
- **Rücklastschrift-Handling** inkl. Gebühren-Zuordnung

### Mahnwesen & Zahlung
- **Automatisches 3-stufiges Mahnwesen** mit konfigurierbaren Fristen
- **Mollie-Integration** (optional) für Online-Zahlungen
- **Stripe-Integration** (geplant, Phase 4)
- **Quittungen & Spendenbescheinigungen** (PDF-Generierung)
- **Finanzberichte** für Kassenwart und Kassenprüfung

---

## ♟️ 5. Turnierverwaltung

### Turnier-Engine
| Modus | Details |
|-------|---------|
| **Schweizer System** | FIDE-konform via `bbpPairings` (Docker/CLI), TRF-basiert |
| **Rundenturniere** | Berger-Tabellen-Logik implementiert |
| **K.-o.-Systeme** | Single-Elimination Brackets |
| **Scheveninger System** | Mannschaftsvergleiche |

### Turnier-Features
- **TRF-Import/Export** (FIDE-Standard) für Auswertung und Verbandsmeldung
- **Teilnehmerverwaltung** (`tournamentParticipants`): Anmeldung, Startgelder, Gruppen
- **Ergebniserfassung** mit automatischer Tabellenfortschreibung
- **Tiebreak-Regeln**: Buchholz, Sonneborn-Berger, Feinwertung
- **DWZ-Rechner** (Phase 2): Prognose-Tool für anstehende Partien
- **Barcode-Scanner** (Phase 3): Mobile Schnelleingabe analoger Ergebnisse via Smartphone
- **DGT-Board-Integration**: Live-Übertragung von Spitzenbrettern
- **Offline-Modus** (PWA + IndexedDB): Lokale Zwischenspeicherung bei instabilem Internet
- **Live-Tabellen** & öffentliche Turnierseiten
- **Export an DSB/FIDE** (Phase 3)

---

## 🤝 6. Mannschafts- & Ligabetrieb

- **Saisonverwaltung** (`seasons`): Spielzeiten mit Start-/Enddatum
- **Mannschaftsplanung** (`teams`): Mehrere Mannschaften pro Verein (1., 2., Jugend etc.)
- **Ligen-Zuordnung** pro Mannschaft
- **Brettreihenfolge** (`boardOrders`): Digitale Verwaltung der Bretthierarchie
- **Aufstellungsplaner**: Drag-&-Drop-Oberfläche für Mannschaftsführer
- **Verfügbarkeitsabfrage** vor jedem Spieltag (E-Mail/Push)
- **Ersatzspieler-Management** mit Regel-Prüfung (z. B. Stammspieler-Regelung)
- **Ergebnismeldung** (`matches`, `matchResults`) an Verbände
- **Fahrgemeinschaften-Koordination** zu Auswärtsspielen (Schwarzes Brett)

---

## 📚 7. Partiedatenbank & Analyse

- **Lichess-Archiv**: Zentrales Verzeichnis aller Vereinspartien mit Verlinkung zu Lichess
- **Import**: Metadaten-Extraktion aus PGN-Dateien inkl. automatischer Lichess-Verlinkung
- **Analyse**: Direkte Verlinkung zur Lichess-Analyse statt lokaler Viewer
- **Validierung** via `chess.js` für Metadaten-Korrektheit
- **Integrierte Engine**: Stockfish.js für clientseitige Analyse (optional)
- **API-Integration**:
  - **Lichess** (OAuth) – Import eigener Online-Partien und Verknüpfung
  - **Chess.com** – Import-Links für gemeinsame Analyse im Training
- **"Partie des Lebens"** (Heritage-Modul): Mitglieder können ihre bedeutendste Partie dauerhaft im Vereinsarchiv verewigen (via Lichess-Link)
- **Suche & Filter**: Nach Spieler, Eröffnung (ECO-Code), Ergebnis, Datum, Turnier
- **Eröffnungsbaum** aus Metadaten der Vereinspartien

---

## 🎓 8. Training & Jugendarbeit

- **Trainingsgruppen** mit Zuordnung von Trainern and Schülern
- **Fortschrittsanalyse** pro Jugendlichem (DWZ-Entwicklung, Aufgaben-Statistik)
- **Taktikaufgaben-Datenbank**
- **Eltern-Portal** (Phase 3):
  - Termine einsehen
  - Trainingsfortschritt des Kindes
  - Abmeldungen vom Training
  - Kommunikation mit Jugendwart/Trainer
- **KI-Trainer** (Zukunftsvision): Automatisierte Fehleranalyse → individuelle Taktikaufgaben
- **Trainings-Partien** separat von Turnierpartien

---

## 📅 9. Kommunikation & Events

<details open>
<summary><b>Kernfunktionen</b></summary>

- **Event-Kalender** (`events`): Training, Spieltage, Versammlungen, Turniere
- **iCal / Google Calendar Synchronisation**
- **Newsletter-System** (`newsletters`) mit Zielgruppen-Filter
- **Interne Nachrichten** zwischen Mitgliedern
- **Push-Benachrichtigungen** (Web Push)
- **E-Mail-Versand**: Asynchrone Hintergrundverarbeitung (Nodemailer/Postmark)

</details>

<details>
<summary><b>Schwarzes Brett / Community</b></summary>

- Fahrgemeinschaften zu Auswärtsspielen
- Material-Marktplatz (Bretter, Uhren, Bücher)
- Aushänge und Ankündigungen
- Kommentarfunktionen

</details>

---

## ⚖️ 10. Recht, DSGVO & Compliance

- **Protokoll-Generator** für Mitgliederversammlungen (automatisiert)
- **Verwaltung der Gemeinnützigkeit**: Fristen, Unterlagen, Finanzamts-Kommunikation
- **DSGVO-Workflows**:
  - Auskunftsersuchen (Art. 15 DSGVO)
  - Löschanträge (Art. 17 DSGVO) mit revisionssicherem Workflow
  - Datenübertragbarkeit (Art. 20 DSGVO)
- **Einwilligungsmanagement** mit Versionierung
- **Dokumentenarchiv** (`documents`): Satzungen, Protokolle, Beitragsordnung
- **Hosting bevorzugt InsForge Cloud / Vercel (EU Region)**

---

## 🔐 11. Sicherheit

| Schicht | Maßnahme |
|---------|----------|
| **Authentifizierung** | InsForge Auth (JWT) |
| **RBAC / Zugriffsschutz** | InsForge Access Control + Middleware Check |
| **Account-Lockout** | InsForge Built-in Schutz |
| **Rate Limiting** | InsForge API Limits |
| **Verschlüsselung** | AES-256-GCM für IBANs und sensible Daten |
| **Headers** | Strikte CSP, HSTS, `X-Frame-Options: DENY` |
| **CSRF-Schutz** | Built-in |
| **SQL-Injection** | Verhindert durch InsForge SDK (parametrisiert) |
| **Audit-Log** | Lückenlose Protokollierung (`auditLog`) |
| **OAuth** | Google, Lichess (via InsForge) |

---

## 🔌 12. Integrationen & APIs

- **DSB/FIDE**: Export für Verbandsmeldungen (Metadaten)
- **Lichess API**: Partie-Verlinkung, OAuth-Login
- **Chess.com API**: Partie-Verlinkung
- **DGT-Boards**: Hardware-Schnittstelle für Live-Übertragung
- **SEPA**: pain.008 XML-Generator
- **Mollie / Stripe**: Zahlungsabwicklung
- **SMTP**: E-Mail-Versand (Postmark/MailerSend)
- **InsForge Storage**: Objektspeicher (Dokumente, Protokolle)
- **iCal / Google Calendar**: Kalender-Sync
- **REST API** (Phase 4): Für externe Entwickler und Verbände

---

## 📊 13. Reporting & Statistik

- **Persönliche Spielerstatistik**: Partien, Siege, DWZ-Verlauf, Eröffnungsrepertoire
- **Vereinsstatistik**: Mitgliederentwicklung, Altersstruktur, aktive Spieler
- **Finanzreports**: Beitragsstand, offene Forderungen, Cashflow
- **Turnierstatistik**: Teilnehmerzahlen, Durchschnitts-DWZ
- **Mannschaftsauswertung**: Brett-Performance, Top-Scorer
- **Export**: PDF, Excel, CSV

---

## 🛠️ 14. Technische Plattform-Features

<details>
<summary><b>Architektur-Details</b></summary>

- **Next.js 16.2** mit App Router & Server Components
- **TypeScript 5.8 Strict Mode**
- **PostgreSQL 17 + InsForge SDK**
- **InsForge Backend**: Auth, Database, Storage, Realtime
- **Asynchrone Hintergrund-Tasks** für E-Mails und Metadaten
- **Zod** für Input-Validierung
- **Zustand 5.0** für Client-State
- **shadcn/ui + Tailwind CSS 4**
- **Docker Compose** für lokale Entwicklung
- **Deployment**: InsForge Cloud (EU) + Vercel.

</details>

<details>
<summary><b>PWA & Offline-Features</b></summary>

- **Progressive Web App** (installierbar)
- **Offline-Turniere** via IndexedDB
- **Background-Sync** bei Wiederverbindung
- **Mobile-First Design** für Smartphone-Eingabe

</details>

---

## 💼 15. Geschäftsmodell (Freemium + Addons)

### Grundprinzip: Kostenlos für immer

Die Software ist **für alle Vereine kostenlos** — ohne Mitgliedslimit, ohne Zeitbegrenzung, ohne versteckte Kosten.

**Kostenlos enthalten:**
- Unbegrenzte Mitglieder
- Mitgliederverwaltung
- Öffentliche Vereinsseite (Subdomain)
- Terminkalender
- Mannschaftsaufstellungen
- Basis-Turniere (Rundenturniere)
- Ergebniseingabe
- DSGVO-Tools
- E-Mail-Support

### Bezahlbare Addons (einzeln buchbar)

| Addon | Preis | Enthaltene Features |
|-------|-------|---------------------|
| **Finanzmodul** | 9,90 €/Monat | SEPA-Export, Mahnwesen, Beitragsstufen, Zahlungs-Tracking, Rechnungen |
| **Turnier-Pro** | 9,90 €/Monat | Schweizer System (bbpPairings), TRF-Import/Export, Live-Ticker, Kreuztabellen |
| **Professional** | 4,90 €/Monat | Eigene Domain, White-Label, API-Zugang, erweiterte Analytics |
| **Kommunikation** | 4,90 €/Monat | Newsletter, Push-Benachrichtigungen, Eltern-Portal, Rundmails |
| **Speicher+** | 2,90 €/Monat | 10 GB Speicher (statt 500 MB), größere Datei-Uploads |

**Kombi-Rabatt:** 2 Addons = 10% Rabatt · 3+ Addons = 20% Rabatt

### Warum dieses Modell?

- **Keine Barriere für kleine Vereine** — Dorfvereine mit 10 Mitgliedern zahlen nichts
- **Nur das zahlen, was man braucht** — Ein Verein ohne SEPA braucht kein Finanzmodul
- **Skalierbar** — Wachstum des Vereins kostet nicht mehr
- **Faire Preise** — Keine überhöhten "Pro"-Pläne mit Features, die niemand nutzt

---

## 🚀 16. Roadmap-Status

| Phase | Inhalt | Status |
|-------|--------|:------:|
| **1 — Fundament** | Multi-Club Auth, Mitgliederverwaltung, RBAC | ✅ |
| **2 — Schach-Sport** | Saisons, Mannschaften, Turniere, Lichess-Integration, DWZ-Rechner | ✅ |
| **3 — Finanzen & Pro** | SEPA, Mahnwesen, DSB-Export, Eltern-Portal, Barcode-Scanner | ✅ |
| **4 — SaaS/Pro** | Stripe, White-Labeling, öffentliche API | ⏳ |

---

## 🔮 17. Zukunftsvision & Innovation

- **🤖 KI-Trainer**: Automatisierte Fehleranalyse der Vereinspartien → individuelle Taktikaufgaben
- **🧠 Eröffnungs-Scouting**: KI-Analyse der Gegner in der Liga
- **📱 Native Mobile App** (iOS/Android) zusätzlich zur PWA

---

### Zusammenfassung

Das System vereint **administrative Effizienz** (Mitglieder, Finanzen, Recht) mit **sportlicher Professionalität** (Turniere, Liga, Analyse) auf einer **mandantenfähigen, DSGVO-konformen SaaS-Plattform**. Durch das modulare Design mit 8 Rollen, 23 Berechtigungen und spezialisierten Schachmodulen (bbpPairings, TRF, DGT, Stockfish) wird jede Vereinsgröße — vom Dorfverein bis zum Landesverband — abgedeckt.
