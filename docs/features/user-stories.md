# 📋 User-Stories & Akzeptanzkriterien: Die 8 MVP-Blöcke

Diese Spezifikation liefert **produktionsreife User-Stories** im Gherkin-Stil mit klaren Akzeptanzkriterien, Edge-Cases, Definition of Done und Story-Point-Schätzungen. Zielgruppe: Entwicklungsteam, QA, Product Owner.

---

## 🎯 Rahmenkonzept & Konventionen

<details open>
<summary><b>Format-Konvention für alle Stories</b></summary>

```
ALS       <Rolle>
MÖCHTE    <Aktion>
DAMIT     <Nutzen>

GEGEBEN   <Ausgangssituation>
WENN      <Aktion>
DANN      <erwartetes Ergebnis>
```

**Rollen im System:**
- `Vorstand` (hat `pages.edit` + `pages.publish`)
- `Redakteur` (hat `pages.edit`, nicht `pages.publish`)
- `Mitglied` (Website-Besucher, authentifiziert)
- `Gast` (anonymer Website-Besucher)
- `Screen-Reader-Nutzer` (A11y)
- `Mobile-Nutzer` (primär iOS Safari + Android Chrome)

**Priorisierung (MoSCoW):**
- 🔴 **Must Have** — MVP-Blocker
- 🟠 **Should Have** — wichtige Qualität
- 🟡 **Could Have** — nice-to-have
- 🔵 **Won't Have (this release)** — dokumentiert für später

**Story-Points:** Fibonacci-basiert (1, 2, 3, 5, 8, 13, 21)

</details>

<details>
<summary><b>Universelle Akzeptanzkriterien (gelten für JEDEN Block)</b></summary>

Diese Kriterien gelten implizit und werden pro Block nicht wiederholt:

- ✅ Block rendert ohne JS-Fehler (Console clean)
- ✅ Axe-core 0 Violations (WCAG 2.2 AA)
- ✅ Lighthouse Score Accessibility ≥ 95
- ✅ Funktioniert mit Tastatur alleine (Tab, Enter, Esc, Pfeile)
- ✅ Screen-Reader-Ansage sinnvoll (NVDA + VoiceOver getestet)
- ✅ Funktioniert in den letzten 2 Majorversionen: Chrome, Firefox, Safari, Edge
- ✅ Responsive: 320px (iPhone SE) bis 4K
- ✅ Dark-Mode-Variante vorhanden
- ✅ I18n-Ready (alle Strings via `t()`, kein hardgecodetes Deutsch in JSX)
- ✅ Keine externen Requests ohne Consent (Google Fonts self-hosted, etc.)
- ✅ Zod-Schema vorhanden & getestet (Happy/Sad Paths)
- ✅ Unit Tests (Vitest) ≥ 80% Coverage
- ✅ E2E Test (Playwright) für Create + Edit + Delete + Render
- ✅ Visual Regression Test (Chromatic) für 3 Viewports
- ✅ Storybook-Story vorhanden
- ✅ Inline-Hilfe (Tooltip) für jedes Konfigurationsfeld
- ✅ Undo/Redo funktioniert
- ✅ Autosave ≤ 15s

</details>

---

## 🧱 Block 1: Text-Block (`text`)

> **Der Arbeitstier-Block.** Jede Seite enthält mindestens einen. Wenn dieser Block nicht perfekt ist, wird das ganze CMS nicht angenommen.

### Epic-Beschreibung
Ein Rich-Text-Block mit eingeschränkter Formatierung, der Fließtext mit Überschriften, Listen, Links und Zitaten ermöglicht — ohne den Nutzer mit Optionen zu überfordern.

### Story 1.1: Text erstellen und formatieren 🔴

```
ALS       Vorstand
MÖCHTE    einen Textabschnitt mit Zwischenüberschriften und Listen 
          auf meiner Vereinsseite einfügen
DAMIT     ich Vereinsinformationen strukturiert präsentieren kann
```

**Akzeptanzkriterien:**

| # | Kriterium | Priorität |
|---|-----------|:---------:|
| 1 | Nutzer kann Block über Slash-Command `/text` oder Plus-Button einfügen | 🔴 |
| 2 | Toolbar erscheint bei Textmarkierung schwebend (nicht fest oben) | 🔴 |
| 3 | Formatierungsoptionen: **Fett**, *Kursiv*, Link, H2, H3, Liste (ul/ol), Zitat | 🔴 |
| 4 | **Kein H1** verfügbar (reserviert für Seitentitel — SEO-Konsistenz) | 🔴 |
| 5 | Tastenkombinationen funktionieren: `Strg+B`, `Strg+I`, `Strg+K` (Link) | 🔴 |
| 6 | Max. 5.000 Zeichen, Warnung ab 4.500 (Badge zeigt Zähler) | 🟠 |
| 7 | Automatische URL-Erkennung beim Tippen (smart paste) | 🟠 |
| 8 | Paste von Word/Google Docs säubert Formatierung intelligent | 🔴 |
| 9 | Paste von Bild triggert Upload-Dialog (nicht als base64 einbetten!) | 🔴 |
| 10 | Markdown-Shortcuts: `## ` → H2, `- ` → Liste, `> ` → Zitat | 🟡 |

**Beispiel-Szenario:**
```gherkin
GEGEBEN   ich bin auf einer neuen Seite und klicke auf "+ Block hinzufügen"
WENN      ich "/text" eingebe und Enter drücke
DANN      erscheint ein leerer Text-Block mit Cursor-Fokus
UND       der Screen-Reader sagt "Text-Block, leer, Bearbeitung"

WENN      ich "## Unser Verein" tippe und Leerzeichen drücke
DANN      wird "Unser Verein" zu einer H2-Überschrift umgewandelt
UND       ein aria-live-Announcement "Überschrift Ebene 2" wird gelesen
```

### Story 1.2: Links mit Validierung einfügen 🔴

```
ALS       Vorstand
MÖCHTE    sichere Links zu externen Seiten und internen Vereinsseiten einfügen
DAMIT     Besucher einfach navigieren können
```

**Akzeptanzkriterien:**

- 🔴 Link-Dialog öffnet sich bei `Strg+K` oder Toolbar-Button
- 🔴 Dialog hat zwei Modi: "Externe URL" / "Interne Seite" (Dropdown aus Seitenliste)
- 🔴 `http://` wird automatisch zu `https://` mit Warnung
- 🔴 Externe Links bekommen `rel="noopener noreferrer"` automatisch
- 🔴 Externe Links optional mit `target="_blank"` + Screen-Reader-Hinweis "(öffnet in neuem Tab)"
- 🟠 Link-Validator: HEAD-Request prüft Erreichbarkeit (async, nicht blockierend)
- 🟠 Broken-Link-Report auf Seitenebene ("3 defekte Links auf dieser Seite")
- 🟠 Interne Links: Dropdown zeigt Seitenhierarchie (Breadcrumb-Stil)
- 🔴 Mailto-/Tel-Links erkannt und korrekt gerendert

**Edge Cases:**
```gherkin
# Link zu gelöschter interner Seite
GEGEBEN   ich habe einen Link zu Seite "/impressum" eingefügt
WENN      die Seite gelöscht wird
DANN      erscheint ein Warnbanner im Editor: "Link zu gelöschter Seite"
UND       der Link wird beim Publish als Text gerendert (nicht broken)

# Paste einer E-Mail-Adresse
GEGEBEN   ich habe Text markiert
WENN      ich "info@sf-musterstadt.de" einfüge
DANN      wird automatisch ein mailto:-Link erstellt
```

### Story 1.3: Barrierefreie Formatierung 🔴

```
ALS       Screen-Reader-Nutzer
MÖCHTE    dass Überschriften in korrekter Reihenfolge strukturiert sind
DAMIT     ich mit Rotor-Navigation zur gewünschten Sektion springen kann
```

**Akzeptanzkriterien:**

- 🔴 Heading-Level-Sprünge werden live im Editor gewarnt (z. B. H2 → H4 Skip)
- 🔴 Leere Überschriften werden blockiert beim Speichern
- 🔴 "Klicken Sie hier" / "mehr" als Link-Text → Warning (aussagekräftiger Link-Text)
- 🔴 Kontrast von markiertem Text gegen Hintergrund ≥ 4.5:1
- 🔴 Zitate nutzen `<blockquote>` mit `cite`-Attribut (wenn Quelle angegeben)
- 🟠 Listen brauchen mindestens 2 Items (1-Item-Liste = semantischer Fehler)
- 🔴 Lang-Attribut bei Fremdwörtern (Manuell via Toolbar: "Sprache markieren")

### Definition of Done

- ✅ Alle Akzeptanzkriterien grün in Playwright
- ✅ NVDA + VoiceOver Test-Protokoll dokumentiert
- ✅ Performance: Tippen in 10.000-Zeichen-Dokument ohne Lag (< 16ms Input-Latency)
- ✅ TipTap-Extension isoliert testbar
- ✅ DOMPurify-Whitelist dokumentiert

**Story Points:** 13

---

## 🖼️ Block 2: Bild-Block (`image`)

> **Der rechtlich sensibelste Basis-Block.** Einwilligungen, EXIF, Alt-Texte. Wenn das nicht wasserdicht ist, wird der Verein abgemahnt.

### Epic-Beschreibung
Einzelbild mit zwingendem Alt-Text, automatischer Bildoptimierung, EXIF-Entfernung und Verknüpfung zu Personen-Einwilligungen. Keine Speicherung ohne Alt-Text.

### Story 2.1: Bild hochladen mit Consent-Check 🔴

```
ALS       Vorstand
MÖCHTE    ein Foto hochladen und sicher sein, dass keine Datenschutzverstöße entstehen
DAMIT     ich rechtlich abgesichert bin
```

**Akzeptanzkriterien:**

| # | Kriterium | Priorität |
|---|-----------|:---------:|
| 1 | Upload via Drag-Drop, Klick oder Paste | 🔴 |
| 2 | Akzeptierte Formate: JPG, PNG, WebP, AVIF, HEIC (iOS), GIF | 🔴 |
| 3 | **Max 20 MB** pro Datei, Client-seitige Vorab-Prüfung | 🔴 |
| 4 | Upload läuft direkt zu MinIO via Presigned URL (nicht durch Vercel!) | 🔴 |
| 5 | Progress-Bar während Upload (% + verbleibende Zeit) | 🟠 |
| 6 | **EXIF-Daten werden server-seitig entfernt** (GPS, Kamera-Seriennr.) | 🔴 |
| 7 | Automatische Generierung von: AVIF, WebP, JPG-Fallback in 5 Größen | 🔴 |
| 8 | Client-Side-Resize bei Bildern > 4000px (vor Upload) | 🟠 |
| 9 | HEIC wird serverseitig zu JPG konvertiert | 🟠 |
| 10 | Upload-Abbruch möglich (Cancel-Button) | 🟠 |

**Flow-Diagramm:**
```
┌─────────────┐   1. Request   ┌──────────┐
│   Browser   │ ──────────────▶│  Vercel  │
│             │                │  /api    │
│             │◀───────────────│ Presigned│
│             │   2. URL       │   URL    │
│             │                └──────────┘
│             │
│             │   3. PUT Binary  ┌──────────┐
│             │ ────────────────▶│  MinIO   │
│             │                  │ (Hetzner)│
│             │                  └────┬─────┘
│             │                       │
│             │   4. Confirm S3Key    ▼
│             │ ────────────────▶┌──────────┐
│             │                  │  Hetzner │
│             │                  │  Worker  │
│             │                  │ - Resize │
│             │                  │ - EXIF   │
│             │                  │ - AVIF   │
│             │                  └──────────┘
```

### Story 2.2: Alt-Text als Publish-Blocker 🔴

```
ALS       Redakteur
MÖCHTE    gezwungen werden, einen aussagekräftigen Alt-Text zu setzen
DAMIT     die Seite barrierefrei ist (BFSG-Pflicht)
```

**Akzeptanzkriterien:**

- 🔴 Alt-Text-Feld im Inspector ist Pflichtfeld (visuell markiert mit ⚠)
- 🔴 Speichern als Entwurf möglich ohne Alt-Text (Arbeitsfluss nicht blockieren)
- 🔴 **Publishing blockiert**, wenn Alt-Text leer ist (Error-Toast + Fokus auf Feld)
- 🔴 Tooltip erklärt: "Beschreiben Sie das Bild für blinde Menschen"
- 🟠 Alt-Text-Qualitätscheck: Warning bei "bild.jpg", "foto", "IMG_1234"
- 🟠 Zeichenempfehlung: 10–150 Zeichen (Feedback in Echtzeit)
- 🟠 **Dekoratives Bild**-Checkbox → setzt `alt=""` explizit (erlaubt für rein ästhetische Bilder)
- 🟡 KI-Vorschlag (optional, via lokalem Modell): "Vorschlag: 'Schachbrett mit laufender Partie'"

**Beispiel:**
```gherkin
GEGEBEN   ich habe ein Bild hochgeladen
UND       kein Alt-Text eingegeben
WENN      ich auf "Veröffentlichen" klicke
DANN      erscheint Error-Dialog: "1 Bild ohne Alt-Text gefunden"
UND       der Fokus springt auf das betroffene Feld
UND       ein Link "Details anzeigen" listet alle betroffenen Bilder auf
```

### Story 2.3: Personenbezogene Bilder & Einwilligungen 🔴

```
ALS       Vorstand
MÖCHTE    Bilder mit Mitgliedern mit ihrer Einwilligung verknüpfen
DAMIT     DSGVO-Konformität gewährleistet ist
```

**Akzeptanzkriterien:**

- 🔴 Checkbox "Bild zeigt identifizierbare Personen"
- 🔴 Bei aktivierter Checkbox: Multi-Select Mitgliederliste erscheint
- 🔴 Pro ausgewähltem Mitglied wird Einwilligungsstatus geprüft:
  - ✅ Grün: "Einwilligung vorhanden (gültig bis DD.MM.YYYY)"
  - ⚠ Gelb: "Einwilligung läuft in 30 Tagen ab"
  - ❌ Rot: "Keine Einwilligung — nicht veröffentlichen!"
- 🔴 Publishing blockiert, wenn rote Einwilligungen vorhanden
- 🔴 Verknüpfung wird in `mediaAssetConsents` Tabelle gespeichert
- 🟠 Button "Einwilligung anfordern" → automatische E-Mail an Mitglied mit Double-Opt-In-Link
- 🟠 Kinder-Warnung: "Minderjährige benötigen Eltern-Einwilligung" (rotes Banner)
- 🔴 Audit-Log-Eintrag bei jeder Einwilligungsprüfung

### Story 2.4: Layout & Darstellung 🟠

```
ALS       Vorstand
MÖCHTE    die Bildgröße und Ausrichtung an den Kontext anpassen
DAMIT     die Seite ästhetisch wirkt
```

**Akzeptanzkriterien:**

- 🟠 Seitenverhältnisse: `16:9`, `4:3`, `1:1`, `Original`
- 🟠 Ausrichtung: `Links`, `Zentriert`, `Rechts`, `Volle Breite`
- 🟠 Caption-Feld (optional, max. 200 Zeichen)
- 🟡 Lightbox-Option (Klick öffnet Vollbild mit Zoom)
- 🟠 Rahmen: `Keiner`, `Dünn`, `Schatten`
- 🔵 Bild-Bearbeitung (Crop, Rotation) — verschoben auf Phase 2

### Definition of Done

- ✅ EXIF-Entfernung via `sharp` verifiziert (Vergleichs-Test Vor-/Nach-Metadaten)
- ✅ Presigned-URL-Flow dokumentiert
- ✅ Einwilligungs-Integration mit `mediaAssetConsents` E2E getestet
- ✅ Axe-core 0 Violations bei Bild mit korrektem Alt-Text
- ✅ LCP-Optimierung: `loading="eager"` bei erstem Bild, `loading="lazy"` ab dem zweiten
- ✅ `srcset` für 5 Größen implementiert

**Story Points:** 21

---

## 🔲 Block 3: Button-Block (`button`)

> **Der CTA-Block.** Klein, aber mit viel Konfiguration — und DSGVO-Fallen (Tracking).

### Story 3.1: Button erstellen 🔴

```
ALS       Vorstand
MÖCHTE    auffällige Call-to-Action-Buttons auf meiner Seite platzieren
DAMIT     Besucher die gewünschten Aktionen durchführen (z. B. Anmelden, Kontakt)
```

**Akzeptanzkriterien:**

| # | Kriterium | Priorität |
|---|-----------|:---------:|
| 1 | Button hat Label (Pflichtfeld, max. 40 Zeichen) | 🔴 |
| 2 | Styles: `Primär`, `Sekundär`, `Ghost`, `Text-Link` | 🔴 |
| 3 | Größen: `Klein`, `Standard`, `Groß` | 🟠 |
| 4 | Icon-Auswahl aus kuratiertem Set (ca. 50 Icons, nicht 1000+) | 🟠 |
| 5 | Icon-Position: `Links`, `Rechts`, `Nur Icon` (mit aria-label!) | 🟠 |
| 6 | Ziele: `Interne Seite`, `Externe URL`, `E-Mail`, `Telefon`, `Anker`, `Download` | 🔴 |
| 7 | Ausrichtung: `Links`, `Zentriert`, `Rechts`, `Volle Breite` | 🟠 |
| 8 | Min. Touch-Target 44x44px (WCAG 2.5.5) | 🔴 |
| 9 | Fokus-Indikator sichtbar (3px Outline, 3:1 Kontrast) | 🔴 |
| 10 | Keyboard: Tab fokussiert, Enter/Space aktiviert | 🔴 |

### Story 3.2: Datenschutzkonformes Tracking 🟠

```
ALS       Vorstand
MÖCHTE    sehen, wie oft ein Button geklickt wird
DAMIT     ich die Wirksamkeit meiner CTAs bewerten kann
```

**Akzeptanzkriterien:**

- 🟠 Toggle "Klicks zählen" (Standard: AUS)
- 🟠 Tracking via **Matomo self-hosted** (keine Google Analytics!)
- 🟠 Cookie-loses Tracking (User-Agent + Tagesdatum Hash)
- 🟠 Statistik im Admin-Dashboard einsehbar
- 🔴 Kein Tracking vor Consent-Banner-Entscheidung

### Story 3.3: Externe Links mit Sicherheit 🔴

**Akzeptanzkriterien:**

- 🔴 Externer Link → automatisch `rel="noopener noreferrer nofollow"`
- 🔴 Externer Link → `target="_blank"` mit Screen-Reader-Hinweis
- 🔴 Warnung im Editor, wenn Link zu verdächtiger Domain (IDN-Homograph-Check)
- 🟠 Download-Links prüfen Dateigröße und warnen ab > 5 MB

### Definition of Done

- ✅ 4 Button-Styles in Storybook
- ✅ Tab-Order korrekt in allen Layouts
- ✅ Touch-Target-Test (44x44 min) in 3 Viewports

**Story Points:** 5

---

## 🎯 Block 4: Hero-Block (`hero`)

> **Der erste Eindruck.** Wenn der Hero nicht überzeugt, scrollt niemand weiter.

### Epic-Beschreibung
Großflächiger "Above-the-Fold"-Block mit Bild, Überschrift und CTA. Varianten für verschiedene Anlässe. Muss performant sein (LCP-kritisch!).

### Story 4.1: Hero mit Hintergrundbild erstellen 🔴

```
ALS       Vorstand
MÖCHTE    einen visuellen Einstieg für meine Startseite erstellen
DAMIT     Besucher sofort den Verein emotional erleben
```

**Akzeptanzkriterien:**

- 🔴 Varianten: `Vollbild mit Overlay`, `Split (Text | Bild)`, `Zentriert mit Gradient`, `Video-Hintergrund`
- 🔴 Headline (Pflichtfeld, rendert als `<h1>` wenn erster Block der Seite, sonst `<h2>`)
- 🔴 Subheadline (optional, max. 200 Zeichen)
- 🔴 **Automatischer Kontrast-Check**: Text-Farbe gegen Bild → WCAG AA sonst Warnung
- 🔴 Max. 2 CTAs (psychologisch optimal)
- 🔴 Bild muss Alt-Text haben, auch wenn dekorativ → Toggle "Dekoratives Bild"
- 🟠 Parallax-Effekt-Option (respektiert `prefers-reduced-motion`)
- 🔴 Overlay-Opazität einstellbar (0–100%)
- 🟠 Höhen-Optionen: `Auto`, `50vh`, `75vh`, `100vh`

**Performance-Kritische Akzeptanzkriterien:**

- 🔴 Hero-Bild lädt mit `fetchpriority="high"` und `loading="eager"`
- 🔴 LCP-Ziel: < 2.5s auf 4G-Verbindung
- 🔴 CLS-Ziel: 0 (Höhe vorreserviert via CSS aspect-ratio)
- 🔴 Bild als AVIF + WebP mit JPG-Fallback via `<picture>`
- 🔴 Bei Split-Layout: Text rendert vor Bild (SSR Priority)

### Story 4.2: Video-Hintergrund 🟡

```
ALS       Vorstand
MÖCHTE    ein stimmungsvolles Hintergrundvideo einbinden
DAMIT     meine Seite modern und dynamisch wirkt
```

**Akzeptanzkriterien:**

- 🟡 Video-Upload (MP4, max. 10 MB, max. 15 Sek.)
- 🔴 Automatischer `autoplay muted loop playsinline`
- 🔴 **Reduced-Motion-User**: Zeigt Poster-Bild statt Video
- 🔴 Poster-Bild Pflicht (LCP-Optimierung)
- 🔴 Pause-Button sichtbar (WCAG 2.2.2)
- 🔴 Kein Video auf Mobile (ab < 768px) — Daten-/Akku-Schutz
- 🟠 Video lädt erst bei `IntersectionObserver` (wenn sichtbar)

### Story 4.3: Screen-Reader-Freundlichkeit 🔴

**Akzeptanzkriterien:**

- 🔴 Heading-Struktur korrekt (erste H1 oder H2 der Seite)
- 🔴 CTAs sind `<a>` oder `<button>` semantisch korrekt
- 🔴 Dekoratives Hintergrundbild hat `role="presentation"` + leeren Alt-Text
- 🔴 Nicht-dekoratives Bild hat aussagekräftigen Alt-Text
- 🔴 Fokus-Reihenfolge: Headline → Subline → CTA1 → CTA2
- 🔴 Screen-Reader liest Headline als Überschrift an (H1/H2-Rolle)

### Definition of Done

- ✅ LCP < 2.5s in WebPageTest (Berlin, 4G)
- ✅ CLS = 0
- ✅ Alle 4 Varianten in Chromatic (Light + Dark)
- ✅ Reduced-Motion getestet
- ✅ A11y-Audit mit NVDA protokolliert

**Story Points:** 13

---

## 📐 Block 5: Spalten-Block (`columns`)

> **Der Layout-Ermöglicher.** Nested Blocks — wird schnell zur UX-Hölle, wenn nicht streng begrenzt.

### Story 5.1: Mehrspaltiges Layout erstellen 🔴

```
ALS       Vorstand
MÖCHTE    Inhalte nebeneinander darstellen
DAMIT     ich Informationen vergleichbar oder kompakt zeigen kann
```

**Akzeptanzkriterien:**

- 🔴 Spalten-Anzahl: `2`, `3`, `4` (keine 5+ — UX-Grenze)
- 🔴 Spalten-Breiten: `Gleich`, `1/3 + 2/3`, `2/3 + 1/3`, `1/4 + 3/4`
- 🔴 Erlaubte Inhalte pro Spalte: `Text`, `Bild`, `Button`, `Divider`
- 🔴 **Max. Schachteltiefe: 1** — keine Spalten in Spalten!
- 🔴 Gap-Einstellung: `Klein`, `Standard`, `Groß`
- 🔴 Vertikale Ausrichtung: `Oben`, `Mitte`, `Unten`
- 🔴 Responsive-Verhalten: Stacked auf Mobile (< 768px), konfigurierbar ab wann
- 🟠 Reihenfolge auf Mobile umkehrbar (für "Bild zuerst auf Mobile")
- 🟠 Spalten per Drag-Drop vertauschbar
- 🟡 Spalten individuell löschbar (restliche rücken nach)

### Story 5.2: Inhalte in Spalte hinzufügen 🔴

**Akzeptanzkriterien:**

- 🔴 Jede Spalte hat eigenen "+ Block hinzufügen"-Button
- 🔴 Slash-Command funktioniert auch in verschachtelten Spalten
- 🔴 Drag-Drop zwischen Spalten möglich
- 🔴 Leere Spalte zeigt Placeholder ("Inhalt hinzufügen...")
- 🔴 Keyboard-Navigation über alle Spalten (Tab-Order logisch)

### Story 5.3: Responsive Darstellung 🔴

```
ALS       Mobile-Nutzer
MÖCHTE    dass Spalten auf meinem Handy lesbar gestapelt werden
DAMIT     ich Inhalte ohne horizontales Scrollen sehen kann
```

**Akzeptanzkriterien:**

- 🔴 Ab < 768px: alle Spalten stacken (Default)
- 🟠 Konfiguration pro Block: Breakpoint wählbar (`768px`, `1024px`, `Nie stacken`)
- 🔴 Bei 4 Spalten auf Tablet: 2+2 Grid
- 🔴 Preview im Editor via Viewport-Toggle (📱/📟/💻)

### Definition of Done

- ✅ Schachteltiefe-Limit technisch durchgesetzt (nicht nur UI)
- ✅ 4 Breiten-Varianten visuell getestet
- ✅ Tab-Order in allen Spalten-Layouts linear logisch
- ✅ Performance: DOM-Tiefe < 10 bei max. Nesting

**Story Points:** 8

---

## ➖ Block 6: Divider-Block (`divider`)

> **Der einfachste Block — aber wichtig für Rhythmus.**

### Story 6.1: Trenner einfügen 🔴

```
ALS       Redakteur
MÖCHTE    visuelle Trennungen zwischen Sektionen einfügen
DAMIT     die Seite strukturiert und lesbar wirkt
```

**Akzeptanzkriterien:**

- 🔴 Varianten: `Linie`, `Leerraum`, `Dekorativ (♞ Springer-Symbol)`
- 🔴 Abstand: `XS (16px)`, `S (32px)`, `M (64px)`, `L (96px)`, `XL (128px)`
- 🟠 Linienfarbe: `Standard (border-muted)`, `Primär`, `Sekundär`
- 🔴 Semantisch: `<hr>` für Linie, nicht-semantisch für Leerraum
- 🔴 Screen-Reader: Leerraum wird übersprungen, Linie als "Trennlinie" angesagt
- 🟡 Dekorative Variante nutzt SVG-Springer-Symbol (Schach-Bezug!)

### Definition of Done

- ✅ 3 Varianten in Storybook
- ✅ `<hr>` semantisch korrekt (nicht `<div>` mit Border)
- ✅ Dark-Mode-Kontrast geprüft

**Story Points:** 2

---

## 📞 Block 7: Kontaktformular (`contactForm`)

> **Der gefährlichste Block.** Spam-Fluten, DSGVO-Fallen, Mail-Routing — alles in einem.

### Epic-Beschreibung
Ein barrierefreies, DSGVO-konformes Kontaktformular mit Multi-Empfänger-Routing, Spam-Schutz und konfigurierbaren Feldern.

### Story 7.1: Formular konfigurieren 🔴

```
ALS       Vorstand
MÖCHTE    ein Kontaktformular auf meiner Seite einbinden
DAMIT     Interessenten mich einfach erreichen können
```

**Akzeptanzkriterien:**

| # | Kriterium | Priorität |
|---|-----------|:---------:|
| 1 | Standard-Felder: Name, E-Mail, Betreff, Nachricht (keine Telefonnummer Pflicht!) | 🔴 |
| 2 | Zusätzliche optionale Felder: Telefon, Anrede, Betreff-Dropdown | 🟠 |
| 3 | Empfänger-Routing: Dropdown "An wen?" → `Vorstand`, `Jugendwart`, `Kassenwart`, `Webmaster` | 🔴 |
| 4 | Datenschutz-Checkbox (Pflichtfeld, **NICHT pre-checked!**) | 🔴 |
| 5 | Link zur Datenschutzerklärung direkt in Checkbox-Label | 🔴 |
| 6 | Submit-Button disabled bis alle Pflichtfelder ausgefüllt | 🟠 |
| 7 | Erfolgs-Meldung nach Absenden (nicht Page-Redirect!) | 🔴 |
| 8 | E-Mail wird via BullMQ-Queue versendet (nicht synchron!) | 🔴 |
| 9 | Auto-Reply an Absender mit DSGVO-Hinweis | 🟠 |
| 10 | Honeypot-Feld (unsichtbares Feld — Bots füllen aus) | 🔴 |

### Story 7.2: Spam-Schutz mehrschichtig 🔴

```
ALS       Vorstand
MÖCHTE    vor Spam-Mails geschützt sein
DAMIT     ich nicht in Werbung und Bot-Nachrichten ertrinke
```

**Akzeptanzkriterien:**

- 🔴 **Schicht 1:** Honeypot (`name="website"` mit `display:none` + `tabindex="-1"` + `aria-hidden`)
- 🔴 **Schicht 2:** Time-Trap: Submission < 3 Sek → Rejection (Mensch braucht länger)
- 🔴 **Schicht 3:** Rate-Limit: Max. 3 Submissions pro IP pro 10 Min
- 🟠 **Schicht 4:** hCaptcha (DSGVO-konform, KEIN reCAPTCHA!) — Toggle im Inspector
- 🔴 **Schicht 5:** Content-Filter: Regex gegen typische Spam-Muster (Casino, Viagra, etc.)
- 🟠 **Schicht 6:** DNS-Blackhole-Check der Absender-Domain (optional)
- 🔴 Bei Rejection: Gleiche UI wie Erfolg (Bots sollen nicht lernen!)
- 🔴 Audit-Log: Alle Rejections mit Grund speichern (DSGVO: 30 Tage)

### Story 7.3: Barrierefreie Formular-Implementation 🔴

```
ALS       Screen-Reader-Nutzer
MÖCHTE    das Formular mit meiner Assistiv-Technologie bedienen können
DAMIT     ich den Verein erreichen kann
```

**Akzeptanzkriterien:**

- 🔴 Jedes Feld hat `<label>` (nicht nur Placeholder!)
- 🔴 Pflichtfelder mit `aria-required="true"` und visueller Kennzeichnung (*)
- 🔴 Fehler inline mit `aria-describedby` verknüpft
- 🔴 Fehler-Announcement via `aria-live="polite"`
- 🔴 Fokus springt zum ersten Fehler-Feld bei Validation-Fail
- 🔴 Autocomplete-Hints: `name="email"` `autocomplete="email"`
- 🔴 Fieldsets für gruppierte Felder mit `<legend>`
- 🔴 Submit-Status-Announcement: "Nachricht wird gesendet...", "Nachricht gesendet!"

### Story 7.4: Nachrichten-Verarbeitung 🔴

**Akzeptanzkriterien:**

- 🔴 Nachricht wird in `contactSubmissions`-Tabelle gespeichert (Historie)
- 🔴 E-Mail an Empfänger mit:
  - Absender: `noreply@club-domain.de`
  - Reply-To: E-Mail des Absenders (Antwort direkt möglich)
  - Subject: `[Kontaktformular] <Betreff>`
  - Body: Plain-Text + HTML
- 🟠 Bei E-Mail-Fehler: Fallback-Benachrichtigung im Admin-Dashboard
- 🟠 Anti-Forwarding: Weiterleitung blockiert via Mail-Header
- 🔴 DSGVO: Automatische Löschung nach 90 Tagen (konfigurierbar)
- 🟠 Markierung als "gelesen" / "beantwortet" im Admin
- 🟡 Canned Responses (Textbausteine) für Antworten

### Story 7.5: Anti-Abuse 🟠

- 🟠 Temporäre IP-Blocks bei > 10 Submissions/Tag
- 🟠 Domain-Blacklist (globale + clubspezifische)
- 🟠 E-Mail-Address-Validierung (MX-Record-Check)
- 🟠 Schutz vor E-Mail-Injection-Attacken (CRLF im Subject)

### Definition of Done

- ✅ OWASP Top 10 Check (Injection, XSS, CSRF)
- ✅ Penetrations-Test gegen Spam-Schutz durchgeführt
- ✅ DSGVO-Review abgeschlossen
- ✅ Auto-Reply in 3 Sprachen (DE/EN/FR)
- ✅ E-Mail-Template in Dark-Mode getestet (Outlook-kompatibel)
- ✅ Load-Test: 100 gleichzeitige Submissions ohne DB-Lock

**Story Points:** 21

---

## ♟️ Block 8: Turnier-Karte (`tournamentCard`)

> **Der USP-Block.** Der Moment, in dem Schach-Domäne zum Leben erwacht. Wenn DAS fantastisch ist, wechselt jeder Verein von Swiss-Manager zu uns.

### Epic-Beschreibung
Live-verbundener Block, der ein Turnier prominent darstellt — mit automatischer Synchronisation zu Anmeldestatus, Teilnehmerzahl, Live-Tabelle und Verbandsmeldung.

### Story 8.1: Turnier auswählen und einbinden 🔴

```
ALS       Sportwart
MÖCHTE    ein Turnier aus meiner Verwaltung auf der Website prominent anzeigen
DAMIT     Interessenten sich direkt informieren und anmelden können
```

**Akzeptanzkriterien:**

| # | Kriterium | Priorität |
|---|-----------|:---------:|
| 1 | Dropdown im Inspector: Liste aller Turniere des Vereins | 🔴 |
| 2 | Filter: `Kommend`, `Laufend`, `Abgeschlossen` | 🟠 |
| 3 | Suche im Dropdown (Fuzzy-Search auf Name) | 🟠 |
| 4 | **Nur öffentliche Turniere** (`isPublic = true`) auswählbar | 🔴 |
| 5 | Warnung bei privatem Turnier: "Turnier ist nicht öffentlich — erst freigeben?" | 🔴 |
| 6 | Gelöschtes Turnier → Block zeigt Fallback "Turnier nicht mehr verfügbar" | 🔴 |
| 7 | Vorschau im Editor zeigt Live-Daten | 🔴 |

### Story 8.2: Varianten und Layout 🔴

```
ALS       Vorstand
MÖCHTE    verschiedene Darstellungsvarianten für unterschiedliche Kontexte
DAMIT     die Karte optimal in meine Seite passt
```

**Akzeptanzkriterien:**

- 🔴 **Variante "Kompakt":** Titel + Datum + Anmelde-Button (ideal für Sidebar)
- 🔴 **Variante "Standard":** + Bild + Kurzbeschreibung + Teilnehmerzahl
- 🔴 **Variante "Hero":** Vollbreite mit allen Details, Hintergrundbild
- 🔴 Anzeige von: Name, Datum, Ort, Modus, Bedenkzeit, Teilnehmer (x/y), Startgeld
- 🟠 Anmeldefrist-Countdown ("Anmeldung endet in 3 Tagen, 4 Stunden")
- 🔴 Status-Badge: `Anmeldung offen`, `Ausgebucht`, `Läuft`, `Beendet`, `Abgesagt`

### Story 8.3: Anmelde-Funktion öffentlich 🔴

```
ALS       Gast
MÖCHTE    mich direkt über die Website für ein Turnier anmelden
DAMIT     ich nicht erst einen Account erstellen muss
```

**Akzeptanzkriterien:**

- 🔴 Button "Jetzt anmelden" öffnet Modal oder Weiterleitung
- 🔴 Gast-Anmeldung ohne Account möglich (Feld: FIDE-ID oder Vereinszugehörigkeit)
- 🔴 Für Mitglieder: Ein-Klick-Anmeldung (wenn eingeloggt)
- 🔴 Pflichtfelder: Name, E-Mail, Verein, DWZ/ELO (optional)
- 🔴 Kapazitäts-Check: Bei Überlauf → Warteliste
- 🔴 Startgeld-Info + Zahlungshinweis (PayPal/SEPA/Barzahlung vor Ort)
- 🟠 Optional: Direkte Online-Zahlung via Mollie-Integration
- 🔴 Bestätigungs-E-Mail mit Kalender-Einladung (.ics)
- 🔴 DSGVO-Checkbox (nicht pre-checked)
- 🟠 Jugend-Turnier: Zusatzfeld "Geburtsdatum" + Eltern-Kontakt

**Happy-Path-Szenario:**
```gherkin
GEGEBEN   ich bin Gast auf der Vereinsseite
UND       ein Turnierblock zeigt "Stadtmeisterschaft 2026"
UND       Anmeldung ist offen, 12/24 Teilnehmer
WENN      ich auf "Jetzt anmelden" klicke
DANN      öffnet sich ein Modal mit Anmelde-Formular
WENN      ich alle Pflichtfelder ausfülle und absende
DANN      sehe ich "Anmeldung erfolgreich! Bestätigungs-Mail unterwegs."
UND       ich erhalte E-Mail mit Event-Details + .ics
UND       Teilnehmerzahl auf Website springt auf "13/24"
UND       Sportwart erhält Benachrichtigung
```

### Story 8.4: Live-Turniertabelle 🟠

```
ALS       Spielerfrau (Besucherin während Turnier)
MÖCHTE    den aktuellen Spielstand in Echtzeit sehen
DAMIT     ich weiß, wie mein Mann abschneidet
```

**Akzeptanzkriterien:**

- 🟠 Wenn Turnier läuft: Live-Tabelle unter Turnier-Details
- 🟠 Spalten: Platz, Name, DWZ, Punkte, Buchholz, letzte Runde
- 🔴 WebSocket-Verbindung zu `ws.checkmate-manager.de`
- 🔴 Auto-Refresh bei neuen Ergebnissen (ohne Page-Reload)
- 🔴 Performance: 500 concurrent Viewer (Cloudflare + Redis PubSub)
- 🟠 Hervorhebung: Eigenes Ergebnis fett (wenn eingeloggter Teilnehmer)
- 🟠 Mobile-optimiert: Horizontales Scroll oder Spalten-Stacking
- 🟠 "Ausblenden"-Option wenn nur Turnier-Info gewollt
- 🟡 Partien-Drill-Down: Klick auf Teilnehmer → alle Partien des Spielers

### Story 8.5: SEO & Schema.org 🟠

```
ALS       Google-Crawler
MÖCHTE    das Turnier als SportsEvent erkennen
DAMIT     es in Rich-Results angezeigt wird
```

**Akzeptanzkriterien:**

- 🟠 JSON-LD mit `@type: SportsEvent`
- 🟠 Felder: `name`, `startDate`, `endDate`, `location`, `organizer`, `offers`
- 🟠 Offers mit `price`, `priceCurrency: EUR`, `availability`
- 🟠 Open Graph Tags für Social Sharing
- 🟠 `og:image` automatisch aus Turnier-Bild oder Standard-Bild
- 🟠 Canonical URL: `/turniere/<slug>`
- 🟠 Sitemap-Eintrag automatisch

### Story 8.6: Barrierefreiheit 🔴

- 🔴 Countdown-Timer nicht nur visuell (aria-label mit Restzeit)
- 🔴 Status-Badges haben Text + Icon (nicht nur Farbe)
- 🔴 Tabelle mit korrekten `<th>` und `scope`-Attributen
- 🔴 Anmelde-Modal ist Focus-Trap (Esc schließt)
- 🔴 Live-Update-Announcements via `aria-live="polite"` (nicht bei jedem Tick spammen)

### Definition of Done

- ✅ 3 Varianten responsive getestet
- ✅ Anmelde-Flow E2E mit Playwright
- ✅ Load-Test: 500 concurrent WebSocket-Clients auf Live-Tabelle
- ✅ Rich-Results-Test (Google) bestanden
- ✅ DSGVO-Review für Gast-Anmeldung
- ✅ Offline-Fallback: statische Daten werden gezeigt wenn WS down
- ✅ ISR-Revalidation bei Turnier-Änderung funktioniert
- ✅ Cancel-Flow: Turnier abgesagt → alle Anmeldungen benachrichtigt

**Story Points:** 34 (größte Story, kritisch für USP)

---

## 📊 Zusammenfassung & Gesamtplanung

### Story-Points-Verteilung

| # | Block | Priorität | Points | Komplexität |
|---|-------|:--------:|:------:|:-----------:|
| 1 | Text | 🔴 | 13 | Hoch (TipTap-Integration) |
| 2 | Bild | 🔴 | 21 | Sehr hoch (DSGVO, EXIF, Consent) |
| 3 | Button | 🔴 | 5 | Niedrig |
| 4 | Hero | 🔴 | 13 | Hoch (LCP-Kritisch) |
| 5 | Spalten | 🔴 | 8 | Mittel (Nested Rendering) |
| 6 | Divider | 🔴 | 2 | Trivial |
| 7 | Kontaktformular | 🔴 | 21 | Sehr hoch (Anti-Spam, A11y) |
| 8 | Turnier-Karte | 🔴 | 34 | Extrem (WebSocket, Integration) |
| | **Summe** | | **117** | |

### Sprint-Planung (2-Wochen-Sprints, Team von 2 Entwicklern)

<details open>
<summary><b>📅 Realistische Sprint-Aufteilung (Team-Geschwindigkeit ~25 Points/Sprint)</b></summary>

**Sprint 1 (Woche 1–2): Fundament**
- Editor-Grundgerüst (TipTap-Setup, Block-System, Autosave) — 13 Points
- Block 6: Divider — 2 Points
- Block 3: Button — 5 Points
- **Zwischenziel:** Einfacher Block-Editor funktioniert End-to-End

**Sprint 2 (Woche 3–4): Text & Layout**
- Block 1: Text — 13 Points
- Block 5: Spalten — 8 Points
- A11y-Tooling (axe-core CI) — 3 Points
- **Zwischenziel:** Textseiten mit Struktur erstellbar

**Sprint 3 (Woche 5–6): Medien**
- Block 2: Bild (inkl. Consent-System) — 21 Points
- **Zwischenziel:** Rechtssichere Bildverwaltung

**Sprint 4 (Woche 7–8): Marketing**
- Block 4: Hero — 13 Points
- Block 7: Kontaktformular — 21 Points (geht in Sprint 5 über)
- **Zwischenziel:** Landingpage-Fähigkeit

**Sprint 5 (Woche 9–10): Kontakt fertig + Turnier Start**
- Block 7: Kontaktformular (Abschluss) — 10 Points
- Block 8: Turnier-Karte (Teil 1: Editor, Varianten) — 15 Points

**Sprint 6 (Woche 11–12): Turnier-Karte USP**
- Block 8: Turnier-Karte (Teil 2: Anmeldung, Live-Ticker) — 19 Points
- **Zwischenziel:** MVP launchfähig

**Buffer (Woche 13): Polish & Pilot-Verein-Feedback**
- Bug-Fixing, A11y-Audit, DSGVO-Review
- Erste 2 Pilot-Vereine onboarden

</details>

### Abhängigkeits-Graph

```
┌─────────────────────────────────────────────────┐
│ FUNDAMENT (muss zuerst)                         │
│ • Editor-Shell (TipTap, Slash-Command, Save)    │
│ • Block-Registry & Rendering-Pipeline           │
│ • Inspector-Panel & Autosave                    │
│ • Media-Asset-Service (MinIO)                   │
│ • Permissions & Multi-Tenant-Routing            │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
      Divider   Button     Text
       (2)       (5)       (13)
                             │
                   ┌─────────┼─────────┐
                   ▼         ▼         ▼
                Spalten   Hero      Bild
                  (8)    (13)        (21)
                                      │
                                      ▼
                                 Kontaktform.
                                    (21)
                                      │
                                      ▼
                                 Turnier-Karte
                                    (34)
```

### Risiko-Register

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|:------------------:|:------:|-----------|
| **TipTap-Lernkurve zu steil** | Hoch | Hoch | Prototyp in Week 0, Pair-Programming |
| **Consent-System komplexer als geplant** | Mittel | Hoch | Externe DSGVO-Beratung Week 4 |
| **WebSocket-Load-Test schlägt fehl** | Mittel | Sehr hoch | Frühes Load-Testing, Fallback SSE |
| **Pilot-Verein findet Editor zu kompliziert** | Hoch | Kritisch | User-Testing alle 2 Sprints |
| **Performance-Ziele LCP verfehlt** | Mittel | Hoch | Lighthouse in CI, Performance-Budget |
| **bbpPairings-Integration in Turnier-Karte bricht** | Niedrig | Mittel | Für MVP: Nur Anzeige, kein Pairings-Trigger |

### Test-Coverage-Matrix

| Block | Unit | Component | E2E | A11y | Visual | Load |
|-------|:----:|:---------:|:---:|:----:|:------:|:----:|
| Text | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Bild | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Upload) |
| Button | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Hero | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (LCP) |
| Spalten | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Divider | ✅ | — | ✅ | ✅ | ✅ | — |
| Kontaktformular | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Spam) |
| Turnier-Karte | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (WS) |

---

## 🎯 MVP-Erfolgs-KPIs

Diese KPIs definieren, ob der MVP **erfolgreich** ist (gemessen mit 5 Pilot-Vereinen):

| KPI | Zielwert | Messmethode |
|-----|----------|-------------|
| **Time-to-First-Page** | < 10 min | User-Testing Video-Analyse |
| **Blocks pro Seite (Median)** | ≥ 5 | Analytics |
| **A11y-Score** | Lighthouse ≥ 95 | Automated CI |
| **LCP auf Vereinsseiten** | < 2.5s (P75) | Web Vitals |
| **Editor-Crash-Rate** | < 0.5% Sessions | Sentry |
| **NPS nach 30 Tagen** | > 40 | Umfrage |
| **Datenverlust-Vorfälle** | 0 | Incident-Log |
| **Support-Tickets "Wie geht X?"** | < 5 pro Verein/Monat | Helpdesk |

---

### 💬 Abschluss

Diese Stories sind **bewusst umfangreich** — weil der Teufel im Detail liegt. Gerade die "einfachen" Blöcke (Bild, Kontaktformular) haben **die meisten rechtlichen und A11y-Fallstricke**. Wer hier abkürzt, zahlt später mit Abmahnungen oder Kunden-Churn.

Die **Turnier-Karte** ist die kritische Differenzierung — sie entscheidet, ob euer Editor ein "generisches CMS" bleibt oder zur **unkopierbaren Schach-Plattform** wird.

---

Möchtest du als nächstes eines der folgenden Themen?

- 🧩 **Code-Skeleton für den Turnier-Karte-Block** (Zod-Schema, Editor, Renderer, tRPC-Route)
- 🎨 **Detaillierte UI-Mockups / Wireframes** der 8 Blöcke im Editor
- 📘 **Testplan mit konkreten Playwright-E2E-Skripten** für alle Stories
- 🔐 **DSGVO-Review-Checkliste** für das Kontaktformular & Bild-Block