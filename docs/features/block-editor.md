# 🎨 Detaillierte Spezifikation: Website-Block-Editor für Schachvereine

Diese Spezifikation beschreibt den **Website-Editor "CheckMate Pages"** — ein domänenspezifisches, block-basiertes CMS für Schachvereinswebsites, das tief in die Vereinsverwaltung integriert ist.

---

## 🎯 1. Design-Prinzipien & Leitplanken

<details open>
<summary><b>Kernprinzipien (nicht verhandelbar)</b></summary>

| Prinzip | Bedeutung für Design & Entwicklung |
|---------|-----------------------------------|
| **Domänenspezifisch statt generisch** | Keine "WordPress/Gutenberg Kopie". Schach-native Blöcke als First-Class-Citizens. |
| **Opinionated Defaults** | Jeder Block funktioniert out-of-the-box ohne Konfiguration. Keine 47 Einstellungen pro Block. |
| **Vorschau = Realität** | WYSIWYG: Editor-Ansicht ≡ Produktions-Rendering. Kein "so sieht es später aus" Split-View. |
| **Single Source of Truth** | Blöcke zeigen Live-Daten aus der Verwaltung, keine Dateneingabe im Editor. |
| **Keyboard-first & A11y-first** | BFSG-konform ab Tag 1, nicht nachgerüstet. |
| **Mobile = Primary** | Vorstände editieren auch mal vom Tablet auf der Vereinssitzung. |
| **Undo/Redo ist heilig** | Jede Aktion reversibel. Fehlerangst killt Nutzung bei älteren Vorständen. |

</details>

<details>
<summary><b>Explizite Anti-Patterns</b></summary>

- ❌ Kein Drag-and-Drop auf Pixel-Ebene (Divi/Elementor-Style) → zu komplex
- ❌ Kein Inline-HTML-Editor → Sicherheits- & Wartungsalbtraum
- ❌ Kein freies CSS für Endnutzer → Support-Hölle
- ❌ Keine "Shortcodes" → undurchsichtig für Laien
- ❌ Keine 100 Theme-Optionen → Entscheidungsmüdigkeit
- ❌ Kein eigener WYSIWYG-Parser → Battle-tested Library nutzen (TipTap/Lexical)

</details>

---

## 🏗️ 2. Technische Architektur des Editors

### 2.1 Tech-Stack-Entscheidungen

| Komponente | Wahl | Begründung |
|-----------|------|------------|
| **Editor-Framework** | **TipTap 2** (auf ProseMirror) | Headless, volle Kontrolle, exzellente A11y, React-nativ |
| **Block-Architektur** | **Custom Node System** auf TipTap | Jeder Block = TipTap Custom Node |
| **State Management** | **Zustand** + **Yjs** (CRDT) | Offline-Editing + optionales Kollaboration |
| **Drag & Drop** | **`dnd-kit`** | Volle Keyboard- & Screenreader-Unterstützung |
| **Rendering (Frontend)** | **React Server Components** | Blöcke werden serverseitig zu HTML gerendert |
| **Persistence-Format** | **JSON (ProseMirror-Schema)** + PostgreSQL `jsonb` | Schema-Evolution, Validierung via Zod |
| **Media-Handling** | **Next.js Image + S3** | Automatische Responsive-Varianten (AVIF/WebP) |
| **Versioning** | **Event-Sourcing light** (`pageRevisions`) | Jede Speicherung = neue Revision |

### 2.2 Datenmodell

```typescript
// Drizzle Schema (vereinfacht)

pages: {
  id: uuid
  clubId: uuid (FK)
  slug: string                    // 'startseite', 'ueber-uns'
  title: string
  status: 'draft' | 'published' | 'scheduled'
  publishAt: timestamp | null
  seo: jsonb                      // MetaTitle, MetaDescription, OG-Image
  layout: 'default' | 'wide' | 'landing'
  navigationParent: uuid | null   // Hierarchie für Menüs
  order: integer
  createdAt, updatedAt, deletedAt
}

pageBlocks: {
  id: uuid
  pageId: uuid (FK)
  blockType: string               // 'hero', 'teamTable', 'tournamentCard', ...
  order: integer                  // 10, 20, 30 (lückig für Einschübe)
  content: jsonb                  // Schema pro Blocktyp (Zod-validiert)
  visibility: jsonb               // { public: true, members: true, roles: [...] }
  createdBy: uuid
}

pageRevisions: {
  id: uuid
  pageId: uuid
  snapshot: jsonb                 // Vollständiger Page+Blocks Zustand
  authorId: uuid
  comment: string | null
  createdAt: timestamp
}

mediaAssets: {
  id: uuid
  clubId: uuid
  s3Key: string
  mimeType: string
  width, height: integer
  altText: string                 // BFSG: Pflichtfeld!
  caption: string | null
  consentIds: uuid[]              // Referenz auf Bild-Einwilligungen von Personen
}
```

### 2.3 Rendering-Pipeline

```
┌─────────────────────────────────────────────────┐
│  1. Page-Request trifft Next.js Route ein       │
│     /[clubDomain]/[slug]                         │
├─────────────────────────────────────────────────┤
│  2. Middleware: Club-Auflösung via Domain       │
│     → clubId + Theme                             │
├─────────────────────────────────────────────────┤
│  3. ISR-Cache-Lookup (Revalidate: 60s default)  │
│     → Hit? Serve. Miss? Generate.               │
├─────────────────────────────────────────────────┤
│  4. Block-Liste laden + Parallel fetchen:       │
│     - Statische Blöcke aus jsonb                │
│     - Dynamische Blöcke (Turnier, Tabelle)      │
│       parallelisiert via Promise.all            │
├─────────────────────────────────────────────────┤
│  5. Jeder Block rendert als RSC eigene HTML     │
│     Fehler in Block X = Fallback, Seite lebt    │
├─────────────────────────────────────────────────┤
│  6. Layout-Komposition + Inject Theme-CSS       │
├─────────────────────────────────────────────────┤
│  7. ISR-Cache mit Revalidation                          │
└─────────────────────────────────────────────────┘

Triggers für Cache-Invalidierung:
  - Block-Edit        → revalidateTag(`page:${id}`)
  - Match-Ergebnis    → revalidateTag(`matches:${teamId}`)
  - Tournament-Update → revalidateTag(`tournament:${id}`)
```

---

## 🧱 3. Block-Katalog (Die Kern-Spezifikation)

Der Block-Katalog ist in **4 Kategorien** organisiert. Jeder Block hat eine **feste Zod-Schema-Definition** und eine **Render-Komponente**.

### 3.1 Basis-Blöcke (Generisch)

<details open>
<summary><b>📝 Text-Block</b></summary>

- **Zweck:** Fließtext mit Überschriften, Listen, Links
- **Editor:** TipTap mit reduziertem Toolbar (H2/H3, fett, kursiv, Link, Liste, Zitat)
- **Kein H1** (wird vom Page-Titel reserviert → SEO-Konsistenz)
- **Eingebaute Validierung:** 
  - Max. 5.000 Zeichen
  - Automatischer Rechtschreib-Check (via Browser-API)
  - Link-Prüfer: HTTPS-Warning, interne vs. externe Links
- **Schema:**
```typescript
{
  content: ProseMirrorJSON,
  alignment: 'left' | 'center',
  maxWidth: 'narrow' | 'normal' | 'wide'
}
```

</details>

<details>
<summary><b>🖼️ Bild-Block</b></summary>

- **Zweck:** Einzelbild mit Caption und Alt-Text
- **Zwangs-Workflow:**
  1. Upload → automatische Konvertierung zu AVIF + WebP + JPG-Fallback
  2. **Alt-Text ist Pflichtfeld** (keine Speicherung ohne!)
  3. Bei erkannten Personen: Verknüpfung mit `mediaConsents` → Warning bei fehlender Einwilligung
  4. Automatische EXIF-Daten-Entfernung (Datenschutz!)
- **Crop-Varianten:** 16:9, 4:3, 1:1, Original
- **Lightbox-Option** für Vollbild
- **Lazy Loading** automatisch
- **Schema:**
```typescript
{
  mediaAssetId: uuid,
  caption: string | null,
  ratio: '16:9' | '4:3' | '1:1' | 'original',
  alignment: 'left' | 'center' | 'right' | 'full',
  lightbox: boolean
}
```

</details>

<details>
<summary><b>🎬 Medien-Galerie-Block</b></summary>

- **Zweck:** Bildergalerie (z. B. Turnier-Fotos)
- **Max. 50 Bilder pro Galerie**
- **Automatisches Grid-Layout** (2/3/4 Spalten responsive)
- **Batch-Upload** via Drag & Drop
- **Bulk-Alt-Text-Editor** (Pflichtfeld!)
- **Einwilligungs-Scan:** Erkennt zuordenbare Personen und prüft Consent-Status
- **Keine Gesichtserkennung** (DSGVO-Risiko) → rein manuell

</details>

<details>
<summary><b>📺 Video-Embed-Block</b></summary>

- **Quellen:** YouTube, Vimeo, Twitch, eigenes MP4 (S3)
- **Zwangs-Datenschutz:** 
  - YouTube-Embed nur mit **Shariff-Lösung** (2-Klick)
  - Oder `youtube-nocookie.com` Variante
  - DSGVO-Hinweis automatisch eingeblendet
- **Thumbnail self-hosted** (kein Google-Call vor Klick)

</details>

<details>
<summary><b>🔲 Button / Call-to-Action</b></summary>

- **Styles:** Primär, Sekundär, Ghost, Destructive
- **Icon-Support** (Lucide-Set, ~50 kuratierte Icons, nicht 1000+)
- **Ziele:** Interne Seite, externe URL, E-Mail, Telefon, Anker
- **A11y:** Pflicht-Label, aria-describedby bei externen Links
- **Tracking-Toggle:** "Klicks zählen?" (datenschutzkonform via Matomo)

</details>

<details>
<summary><b>➖ Divider / Spacer</b></summary>

- Horizontale Linie oder Leerraum (S/M/L/XL)
- Minimalistisch, kein Styling-Overkill

</details>

### 3.2 Schach-Spezifische Blöcke (Der USP!)

<details open>
<summary><b>♟️ Turnier-Karte (`tournamentCard`)</b></summary>

- **Zweck:** Einzelnes Turnier prominent darstellen
- **Datenquelle:** `tournaments` Tabelle, Live-Sync
- **Automatische Inhalte:**
  - Name, Datum, Ort, Modus, Bedenkzeit
  - Teilnehmerzahl (aktuell / max.)
  - Anmeldestatus (offen / geschlossen / läuft / beendet)
  - Startgeld
  - Ausschreibung als PDF-Download
- **Aktionen:**
  - "Jetzt anmelden"-Button (öffentlich, auch für Nicht-Mitglieder)
  - Live-Tabelle einblenden (wenn Turnier läuft)
- **Varianten:** Kompakt, Standard, Hero
- **Konfig (im Editor):**
```typescript
{
  tournamentId: uuid,
  variant: 'compact' | 'standard' | 'hero',
  showRegistration: boolean,
  showLiveStandings: boolean
}
```

</details>

<details open>
<summary><b>📅 Turnier-Liste (`tournamentList`)</b></summary>

- **Zweck:** Alle kommenden / laufenden / vergangenen Turniere
- **Filter:** Zeitraum, Modus, Altersklasse
- **Sortierung:** Chronologisch auf-/absteigend
- **Pagination:** 10/20/50 pro Seite
- **Archiv-Link:** "Alle Turniere ab 2020"
- **iCal-Feed**: Automatisch generiert pro Liste (Abo-Button)

</details>

<details open>
<summary><b>🏆 Mannschafts-Tabelle (`leagueTable`)</b></summary>

- **Zweck:** Aktueller Tabellenstand der Liga
- **Datenquelle:** `seasons`, `teams`, `matches`, `matchResults`
- **Auto-Updates:** Bei Ergebniseintragung sofort (SSR-Revalidate)
- **Berechnung:** Mannschaftspunkte, Brettpunkte, SoBe, eigene Mannschaft fett
- **Drill-Down:** Klick auf Mannschaft → Details
- **Varianten:** 
  - Voll (alle Spalten)
  - Kompakt (nur Platz/Name/Punkte)
  - Widget (Top 3 + eigene Mannschaft)
- **Export:** CSV-Download

</details>

<details>
<summary><b>🗓️ Mannschafts-Spielplan (`matchSchedule`)</b></summary>

- **Zweck:** Kommende und vergangene Mannschaftskämpfe
- **Anzeige pro Spiel:** Datum, Heim/Auswärts, Gegner, Ergebnis, Aufstellung (wenn publiziert)
- **"Anfahrt"-Button** für Auswärtsspiele (OpenStreetMap)
- **ICS-Export** pro Spiel

</details>

<details open>
<summary><b>👥 Mannschafts-Aufstellung (`lineup`)</b></summary>

- **Zweck:** Zeigt die Aufstellung einer Mannschaft (aktuell oder für bestimmten Spieltag)
- **Datenquelle:** `boardOrders`, `members` mit DWZ
- **Auto-Consent-Check:** Nur Spieler mit Einwilligung zur Namensnennung werden angezeigt, andere als "Spieler X"
- **Spalten:** Brett, Name, DWZ, ELO (optional)
- **Veröffentlichungslogik:** Aufstellung erst ab Freigabe durch Mannschaftsführer sichtbar

</details>

<details open>
<summary><b>📊 Live-Ticker (`liveTicker`)</b></summary>

- **Zweck:** Echtzeit-Anzeige laufender Partien (Turnier oder Liga)
- **Tech:** WebSocket (Redis Pub/Sub) + SSE als Fallback
- **Anzeige:** Brett, Spieler, Live-Stellung (FEN), Zeit, Ergebnis
- **Quelle:** Manuelle Eingabe via Turnierleiter-App oder DGT-Board
- **Performance-Kritisch:** 500+ gleichzeitige Besucher am Turniertag → CDN + Edge Functions

</details>

<details>
<summary><b>♟️ Partie-Viewer (`gameViewer`)</b></summary>

- **Zweck:** Einzelne Partie mit Metadaten und Link zur Lichess-Analyse darstellen
- **Tech:** Metadaten-Rendering (Server-side) + Lichess-Link
- **Features:**
  - Anzeige von Weiß, Schwarz, Ergebnis, ECO
  - Direkter Link zur Analyse auf Lichess.org
  - Statisches Brett-Vorschaubild (FEN-basiert)
- **Opt-In Voraussetzung:** Spieler müssen Veröffentlichung erlaubt haben

</details>

<details>
<summary><b>📈 DWZ-Bestenliste (`ratingLeaderboard`)</b></summary>

- **Zweck:** Top-Spieler des Vereins nach DWZ
- **Filter:** Gesamt, Jugend, Senioren, Damen
- **Consent-Filter:** Nur Mitglieder mit Public-DWZ-Einwilligung
- **Trend-Indikatoren:** Pfeil hoch/runter (Monatsveränderung)
- **Anonymisierungs-Option:** "Spieler X" bei fehlender Einwilligung

</details>

<details>
<summary><b>🎓 Trainingsplan (`trainingSchedule`)</b></summary>

- **Zweck:** Trainingszeiten und Gruppen anzeigen
- **Datenquelle:** `events` mit Typ "Training"
- **Gruppierung:** Erwachsene / Jugend / Senioren
- **Trainer-Anzeige** (opt-in)
- **Probetraining-Buchung** direkt über Block
- **Schul-/Ferien-Ausfälle** markiert

</details>

<details>
<summary><b>📜 Partie-des-Monats (`featuredGame`)</b></summary>

- **Zweck:** Highlight einer besonderen Partie
- **Kurator-Feld:** Kommentartext, optional mit Varianten
- **Mit vollem Partie-Viewer** eingebettet
- **Archiv-Link:** "Alle Partien des Monats"
- **Nominierungs-Workflow** im internen Bereich

</details>

### 3.3 Vereins-Organisation-Blöcke

<details>
<summary><b>👔 Vorstands-Team (`boardTeam`)</b></summary>

- **Zweck:** Vorstandsmitglieder mit Rolle, Foto, Kontakt
- **Datenquelle:** `members` mit Rolle `vorstand`/`sportwart`/etc.
- **Consent-Pflicht:** Nur wer Foto+Name veröffentlichen erlaubt hat
- **Kontakt-Optionen:** E-Mail (mit JS-Obfuscation gegen Spam), Kontaktformular
- **Layout:** Grid 2/3/4 Spalten oder Liste

</details>

<details>
<summary><b>📍 Anfahrt & Kontakt (`locationMap`)</b></summary>

- **Karte:** **OpenStreetMap via Leaflet** (KEIN Google Maps!)
- **Inhalt:** Adresse, Öffnungszeiten, Anfahrt (ÖPNV, Parken)
- **Schema.org Markup** für lokale SEO
- **Kontaktzeiten** flexibel konfigurierbar

</details>

<details>
<summary><b>🎉 Event-Ankündigung (`eventCard`)</b></summary>

- **Zweck:** Einzel-Event prominent (Vereinsfeier, Simultan)
- **Felder:** Titel, Datum, Bild, Beschreibung, Anmeldung
- **Kapazitätsanzeige:** "15/50 angemeldet"
- **Warteliste** wenn voll

</details>

<details>
<summary><b>📧 Newsletter-Anmeldung (`newsletterSignup`)</b></summary>

- **Double-Opt-In verpflichtend** (DSGVO!)
- **Kategorien:** "Turniere", "Jugend", "Allgemein"
- **Captcha:** hCaptcha (kein reCAPTCHA!)
- **DSGVO-Hinweis** automatisch

</details>

<details>
<summary><b>✍️ Mitgliedsantrag (`membershipApplication`)</b></summary>

- **Multi-Step-Formular:**
  1. Persönliche Daten
  2. Spielstärke (DWZ/ELO, optional)
  3. Beitragsstufe wählen
  4. SEPA-Mandat (optional)
  5. DSGVO-Einwilligungen (granular!)
  6. Vorschau + Absenden
- **BFSG-konform:** Fieldsets, Labels, Fehlermeldungen mit ARIA
- **Ergebnis:** Eintrag in `memberApplications`, E-Mail an Vorstand
- **PDF-Generierung** für Postversand (manche Vereine wollen das)

</details>

<details>
<summary><b>💬 Kontaktformular (`contactForm`)</b></summary>

- **Anti-Spam:** Honeypot + hCaptcha + Rate-Limiting
- **Empfänger-Routing:** "Vorstand", "Jugendwart", "Webmaster" je nach Dropdown
- **Auto-Reply** mit Datenschutzhinweis
- **DSGVO-Checkbox** (nicht pre-checked!)

</details>

<details>
<summary><b>🤝 Sponsoren-Wand (`sponsors`)</b></summary>

- **Logo-Grid** mit Links
- **Tier-System** (Gold/Silber/Bronze → Logo-Größen)
- **Beschriftung:** "Wir danken unseren Sponsoren"
- **Alt-Texte Pflicht**

</details>

<details>
<summary><b>📄 Dokumenten-Liste (`documentList`)</b></summary>

- **Zweck:** Satzung, Beitragsordnung, Jahresberichte
- **Datenquelle:** `documents` mit Flag `isPublic`
- **Icon nach Dateityp** (PDF, Word, Excel)
- **Download-Zähler** (optional, datenschutzfreundlich)
- **Barrierefreie PDFs:** Warnung bei nicht-tagged PDFs

</details>

### 3.4 Layout & Struktur-Blöcke

<details>
<summary><b>🎯 Hero-Block</b></summary>

- **Zweck:** Erster Eindruck auf Landing Pages
- **Varianten:** Full-Bleed-Bild, Split (Text + Bild), Video-Hintergrund, Gradient
- **Max. 2 CTAs** (psychologisch optimal)
- **A11y:** Overlay-Kontraste werden automatisch validiert (WCAG AA)

</details>

<details>
<summary><b>📐 Spalten-Block (`columns`)</b></summary>

- **Layout:** 2, 3 oder 4 Spalten
- **Nested Blocks erlaubt** (Text, Bild, Button)
- **Mobile:** Stacked automatisch
- **Max. Schachteltiefe: 1** (keine Spalten in Spalten → UX-Katastrophe)

</details>

<details>
<summary><b>🗂️ Tabs-Block</b></summary>

- **Zweck:** Mehrere Sektionen auf einer Seite (z. B. "Erwachsene / Jugend / Senioren")
- **A11y:** Volle Keyboard-Navigation (ARIA-Tabs-Pattern)
- **Nested Blocks** möglich

</details>

<details>
<summary><b>🪗 Accordion-Block</b></summary>

- **Zweck:** FAQ, lange Inhalte
- **Max. 20 Items**
- **A11y:** `<details>`/`<summary>` als Fallback

</details>

<details>
<summary><b>📣 Info-Banner (`banner`)</b></summary>

- **Zweck:** Hinweise ("Training fällt aus am 24.12.")
- **Varianten:** Info (blau), Warnung (gelb), Erfolg (grün), Fehler (rot)
- **Dismissible-Option** (per Cookie merken)
- **Ablaufdatum:** Banner verschwindet automatisch nach Datum

</details>

---

## 🖱️ 4. Editor-UX im Detail

### 4.1 Layout des Editor-Interfaces

```
┌──────────────────────────────────────────────────────────────┐
│  TOP BAR:                                                     │
│  [← Zurück]  Seitenname (inline editierbar)                  │
│  [Entwurf] [Speichern] [Vorschau] [Veröffentlichen ▼]        │
├──────────┬──────────────────────────────────┬────────────────┤
│          │                                  │                │
│  LEFT    │     CENTER: CANVAS (WYSIWYG)     │   RIGHT:       │
│  SIDEBAR │                                  │   INSPECTOR    │
│          │  ┌────────────────────────────┐  │                │
│  - Seiten│  │  HERO BLOCK                │  │  Block:        │
│    baum  │  │  [Bearbeitung inline]      │  │  Hero          │
│          │  └────────────────────────────┘  │                │
│  - Block-│      [+ Block hinzufügen]        │  Einstellungen:│
│    biblio│  ┌────────────────────────────┐  │  - Variante    │
│    thek  │  │  TEXT BLOCK                │  │  - Ausrichtung │
│    (📦)  │  │  [Tiptap Editor inline]    │  │  - Sichtbarkeit│
│          │  └────────────────────────────┘  │                │
│  - Revi- │      [+ Block hinzufügen]        │  A11y-Check:   │
│    sionen│  ┌────────────────────────────┐  │  ✓ Alt-Text    │
│          │  │  TOURNAMENT CARD           │  │  ⚠ Kontrast    │
│          │  │  [Live-Vorschau]           │  │                │
│          │  └────────────────────────────┘  │                │
│          │                                  │                │
├──────────┴──────────────────────────────────┴────────────────┤
│  BOTTOM BAR: Autosave-Status • Letzte Änderung von X vor 2m  │
└──────────────────────────────────────────────────────────────┘

Viewport-Toggle (oben rechts): [📱] [📟] [💻]
```

### 4.2 Interaktionsmuster

<details open>
<summary><b>Block hinzufügen</b></summary>

Drei Wege — jeder Nutzertyp findet seinen:

1. **Inline-Plus-Button** zwischen Blöcken (Maus)
2. **Slash-Commands**: Tippe `/` in leeren Block → Block-Picker (Power-User)
3. **Drag aus Block-Bibliothek** (Sidebar links, Tablet-Nutzer)

Block-Picker zeigt:
- **Häufig verwendet** (je Nutzer)
- **Empfohlen für diese Seite** (z. B. "Turnier-Karte auf Turnierseite")
- **Kategorien:** Schach, Basis, Layout, Vereinsorganisation
- **Suchfeld** mit Fuzzy-Matching auf Deutsch ("Tabelle" findet "Mannschaftstabelle")

</details>

<details>
<summary><b>Block bearbeiten</b></summary>

- **Klick auf Block** → Inspector rechts wird aktiv
- **Direct Editing** im Canvas für Text (TipTap)
- **Block-Toolbar** erscheint schwebend über aktivem Block:
  - ↑↓ Verschieben
  - 🗑 Löschen
  - 📋 Duplizieren
  - 👁 Sichtbarkeit
  - ⚙ Erweitert

</details>

<details>
<summary><b>Block verschieben</b></summary>

**Maus:** Drag-Handle links neben Block, Drop-Zonen zwischen Blöcken visuell markiert

**Keyboard (A11y!):**
- Block fokussieren (Tab)
- `Strg+Shift+↑/↓` verschiebt Block
- Screen-Reader-Feedback: "Block verschoben an Position 3 von 7"

</details>

<details>
<summary><b>Autosave & Konfliktvermeidung</b></summary>

- **Autosave alle 15 Sekunden** (silent, Indikator unten rechts)
- **Manueller Save:** `Strg+S` (mit Confirmation-Toast)
- **Leave-Guard:** `beforeunload` bei unsaved Changes
- **Optimistic Locking:** Revision-Konflikt bei parallelem Edit → Merge-UI
- **Offline-Detection:** Speicherung in IndexedDB, Sync bei Reconnect

</details>

### 4.3 Publishing-Workflow

```
  DRAFT ──(Speichern)──> DRAFT (gespeichert, nicht live)
    │
    ├─(Vorschau)──> Preview-URL mit Token (geteilt werden kann)
    │
    ├─(Veröffentlichen)──> PUBLISHED (live)
    │                        │
    │                        └─(Bearbeiten)──> PUBLISHED + DRAFT-Overlay
    │                                              │
    │                                              └─(Aktualisieren)─> PUBLISHED
    │
    └─(Zeitgesteuert)──> SCHEDULED (Cronjob via BullMQ)
```

**Publish-Dialog zwingend:**
- ✅ Checkliste: Alt-Texte? Einwilligungen? Impressum-Link?
- ✅ SEO-Preview: Google-Snippet Vorschau
- ✅ Social-Preview: OG-Tag Rendering
- ✅ A11y-Check: Automatische Axe-Scan-Results
- ⚠️ Blocker bei Fehlern (z. B. Bild ohne Alt-Text)

### 4.4 Revisions-System

- **Jede Speicherung** erzeugt Revision
- **Sidebar "Versionen":** Liste mit Zeit, Autor, Kommentar
- **Diff-Viewer:** Seite-an-Seite Vergleich (links alt, rechts neu)
- **Restore:** "Diese Version wiederherstellen" → erzeugt neue Revision
- **Retention:** 30 Tage auf Free, 1 Jahr auf Pro, unbegrenzt auf Verband
- **Storage-Optimierung:** Nur Deltas nach N=10 Revisions (patch-basiert)

---

## 🛡️ 5. Sicherheit, DSGVO & Barrierefreiheit (Zwangsintegriert)

### 5.1 Security-Hardening

<details open>
<summary><b>Content Security Policy im Editor-Output</b></summary>

- **Strict CSP** auf allen gerenderten Seiten
- **Keine Inline-Scripts** in User-generiertem Content
- **Sanitization:** ProseMirror-JSON → HTML via **DOMPurify** mit Allowlist
- **Iframe-Allowlist:** Nur YouTube, Vimeo, Twitch, eigene S3-Videos
- **SVG-Upload:** Sanitization via **DOMPurify SVG-Profile** (verhindert XSS in SVGs)

</details>

<details>
<summary><b>Berechtigungsmodell im Editor</b></summary>

| Aktion | Erforderliche Permission |
|--------|--------------------------|
| Seite anzeigen (intern) | `pages.view` |
| Seite bearbeiten | `pages.edit` |
| Seite veröffentlichen | `pages.publish` |
| Seite löschen | `pages.delete` |
| Navigation bearbeiten | `pages.navigation` |
| Theme ändern | `pages.theme` |
| Domain konfigurieren | `pages.domain` (nur Admin) |

Plus: **Per-Seite-ACLs** (z. B. "nur Jugendwart kann Jugendseite editieren")

</details>

### 5.2 DSGVO-Integration (automatisiert)

<details open>
<summary><b>Consent-Engine im Editor</b></summary>

Bei jedem Block mit personenbezogenen Daten prüft das System automatisch:

```
Block: TeamLineup (Mannschaftsaufstellung)
  ├── Spieler Max Mustermann
  │     ├── ✓ Einwilligung "Namensnennung Website"
  │     └── ✓ Einwilligung "DWZ-Veröffentlichung"
  │     → Wird angezeigt
  │
  └── Spielerin Erika Musterfrau
        ├── ✓ Einwilligung "Namensnennung Website"  
        └── ✗ Einwilligung "DWZ-Veröffentlichung"
        → Name OK, aber DWZ wird als "—" dargestellt

  ⚠️ Editor-Hinweis: "1 Spielerin ohne DWZ-Einwilligung.
                      Einwilligung anfordern?"
```

</details>

<details>
<summary><b>Auto-generierte Rechtstexte</b></summary>

- **Impressum-Generator:** Aus `clubs`-Tabelle (V.i.S.d.P., Registergericht, Vereinsregister-Nr.)
- **Datenschutzerklärung:** Automatisch basierend auf eingebauten Features
  - Matomo aktiv? → Abschnitt Analytics
  - Kontaktformular? → Abschnitt Formulardaten
  - YouTube-Embeds? → Abschnitt Drittanbieter
- **Cookie-Banner:** Nur wenn nötig (reine statische Seite = kein Banner!)
- **Updates:** Bei Feature-Änderung Prüfung "Datenschutzerklärung anpassen?"

</details>

### 5.3 Barrierefreiheit (BFSG-konform)

<details open>
<summary><b>Kontinuierliche A11y-Checks im Editor</b></summary>

**Live während des Editierens:**
- Kontrast-Warnung bei unzureichendem Hintergrund/Text
- Alt-Text-Pflicht (Speicher-Blocker)
- Heading-Hierarchie-Prüfung (keine H3 ohne H2 davor)
- Link-Text-Prüfung ("klicken Sie hier" wird markiert)
- Sprachauszeichnung (lang-Attribut) bei Fremdwörtern

**Pre-Publish-Scan:**
- **axe-core** läuft vor Veröffentlichung
- Fehler (Violations) = Publish-Blocker
- Warnings = Hinweis, aber publishbar
- Report als PDF exportierbar (für Audit-Dokumentation!)

**Monatlicher Lighthouse-Scan:**
- Automatisch im BullMQ-Worker
- Bericht an Vorstand per E-Mail
- Historische Entwicklung in Admin-Dashboard

</details>

<details>
<summary><b>A11y-Features im gerenderten Frontend</b></summary>

- **Skip-Links** (zum Hauptinhalt, zur Navigation)
- **Fokus-Indikatoren** klar sichtbar (WCAG 2.4.7)
- **Screenreader-optimierte Live-Regions** für Live-Ticker
- **Reduzierte Bewegung** (`prefers-reduced-motion`) respektiert
- **Dark Mode** (`prefers-color-scheme`)
- **Zoom bis 200%** ohne horizontales Scrolling

</details>

---

## 🎨 6. Theming-System

### 6.1 Theme-Struktur

```typescript
Theme: {
  name: string,
  preset: 'classic' | 'modern' | 'minimalist' | 'dark' | 'royal',
  tokens: {
    colors: {
      primary: HSL,        // Vereinsfarbe 1
      secondary: HSL,      // Vereinsfarbe 2
      accent: HSL,
      background: HSL,
      foreground: HSL,
      // Derivate automatisch berechnet (10er-Skala)
    },
    typography: {
      headingFont: 'Inter' | 'Merriweather' | 'Playfair' | 'Space Grotesk',
      bodyFont: 'Inter' | 'Source Sans' | 'Libre Franklin',
      scale: 'compact' | 'comfortable' | 'spacious',
    },
    radius: 'none' | 'subtle' | 'medium' | 'playful',
    density: 'compact' | 'comfortable' | 'airy',
  },
  logo: MediaAssetId,
  favicon: MediaAssetId,
  customCss: null  // Nur im Verband-Tarif!
}
```

### 6.2 Theme-Prinzipien

- **Fonts self-hosted** (keine Google-Fonts-Calls → DSGVO!)
- **Kontraste vorab validiert** — Farbwahl kann nie WCAG unterschreiten
- **Dark-Mode-Varianten automatisch** generiert (nicht konfigurierbar)
- **Live-Preview** während Theme-Edit
- **Preset-Bibliothek** mit 10 vorgefertigten Schachverein-Themes

---

## 📱 7. Navigation & Seiten-Hierarchie

### 7.1 Seiten-Typen

| Typ | Besonderheit |
|-----|--------------|
| **Standard-Seite** | Normale Content-Seite |
| **Landing Page** | Ohne Standard-Navigation, für Kampagnen |
| **Blog-Post** | Autor, Datum, Tags, Kommentare (optional) |
| **System-Seite** | Impressum, Datenschutz (nicht löschbar) |
| **Dynamische Seite** | `/turniere/[slug]` — Templated aus DB |

### 7.2 Menü-Editor

- **Hierarchischer Tree-View** (Drag & Drop, max. 2 Ebenen)
- **Mega-Menu-Option** für größere Vereine
- **Sichtbarkeits-Regeln:** Öffentlich / nur Mitglieder / nur Rolle X
- **Mobile-Menü** separat konfigurierbar
- **Breadcrumbs** automatisch aus Hierarchie

### 7.3 URL-Management

- **Slug-Editor** mit deutscher Umlaut-Normalisierung
- **Automatische Weiterleitungen** bei Slug-Änderung (301)
- **Redirect-Manager** für manuelle Redirects
- **URL-Historie** (Ex-Slugs leiten weiter)

---

## 🧪 8. Testing-Strategie

| Ebene | Tool | Ziel |
|-------|------|------|
| **Unit** | Vitest | Block-Schema-Validierung, Rendering-Logik |
| **Component** | Vitest + Testing Library | Editor-Interaktionen |
| **E2E** | Playwright | Komplette User-Flows (Block einfügen → Speichern → Veröffentlichen) |
| **A11y** | axe-playwright | Jede Seite + jeder Block automatisch |
| **Visual Regression** | Chromatic / Percy | Theme-Änderungen, Block-Renderings |
| **Load** | k6 | 500 concurrent Viewer auf Live-Ticker |

---

## 📦 9. Block-Entwicklung: Plugin-System (Phase 2)

Langfristig sollten neue Blöcke einfach hinzufügbar sein:

```typescript
// src/blocks/MyCustomBlock/index.ts

export const MyCustomBlock = defineBlock({
  type: 'myCustomBlock',
  name: 'Mein Block',
  category: 'schach',
  icon: ChessKnightIcon,
  
  schema: z.object({
    title: z.string().min(1).max(100),
    tournamentId: z.string().uuid().optional(),
  }),
  
  defaultData: {
    title: 'Neuer Block',
  },
  
  Editor: MyCustomBlockEditor,       // Editor-Komponente
  Renderer: MyCustomBlockRenderer,   // Frontend-Komponente
  Inspector: MyCustomBlockInspector, // Rechte Sidebar
  
  validate: async (data, ctx) => {
    // Custom-Validierung, z. B. "Turnier muss public sein"
  },
  
  permissions: ['pages.edit'],
  
  onInstall: async (clubId) => {
    // Migrations, Seed-Daten
  },
});
```

Das ermöglicht:
- Externe Entwickler (Verbände) können eigene Blöcke bauen
- White-Label-Partner können Blöcke monetarisieren
- Klare API-Grenze für Wartbarkeit

---

## 🗺️ 10. Roadmap des Editors

| Phase | Monate | Inhalt |
|-------|:------:|--------|
| **Phase 1: MVP** | 1–3 | 8 Basis-Blöcke (Text, Bild, Button, Hero, Columns, Divider, Kontaktformular, Turnier-Karte), TipTap-Integration, Autosave, 3 Themes, Subdomain-Hosting |
| **Phase 2: Schach-Integration** | 4–6 | Liga-Tabelle, Spielplan, Aufstellung, Partie-Viewer, Live-Ticker, Turnier-Liste |
| **Phase 3: Organisation** | 7–9 | Vorstands-Team, Anfahrt, Newsletter, Mitgliedsantrag, Dokumente, Sponsoren |
| **Phase 4: Advanced** | 10–12 | Tabs, Accordion, Galerie, Video, Blog-Modul, Custom-Domain, A/B-Testing |
| **Phase 5: Pro** | 13–15 | Plugin-System, API für externe Blöcke, Marketplace, White-Label-Theme-Builder |

---

## 🎯 11. Erfolgskriterien (KPIs)

- **Time-to-First-Page:** < 10 Minuten für neuen Vorstand (User Testing!)
- **A11y-Score:** Lighthouse 95+ auf allen Seiten standardmäßig
- **Core Web Vitals:** LCP < 2.5s, CLS < 0.1, INP < 200ms
- **DSGVO-Audit-Bestehen:** 100% der gerenderten Seiten ohne Drittanbieter-Calls ohne Einwilligung
- **Editor-Crash-Rate:** < 0.1% der Sessions
- **Autosave-Datenverlust:** 0 dokumentierte Fälle

---

### 💬 Abschluss

Dieser Editor ist **kein generisches CMS** — er ist ein **hoch spezialisiertes Werkzeug**, das die Schach-Domäne zu First-Class-Bürgern macht. Der entscheidende Unterschied zu WordPress/Gutenberg: **Wer hier einen Turnier-Block einfügt, bekommt keine Konfigurations-Orgie, sondern wählt aus einer Dropdown-Liste sein Turnier — fertig. Die Daten pflegen sich selbst.**

Das ist der **tiefe Integrations-Moat**, den Mitbewerber nicht einfach nachbauen können.

---

Möchtest du als nächsten Schritt eines der folgenden Themen vertieft haben?

- 🏗️ **Technisches Architektur-Diagramm (Vercel + Supabase)**
- 🧩 **Konkrete Code-Spezifikation für den ersten Block** (z. B. Turnier-Karte) mit Datenbank, Renderer, Editor-Komponente
- 🎨 **Theme-Preset-Katalog** mit 10 konkreten Schachverein-Designs (Mockups/Beschreibung)
- 📋 **User-Stories + Akzeptanzkriterien** für die ersten 8 MVP-Blöcke