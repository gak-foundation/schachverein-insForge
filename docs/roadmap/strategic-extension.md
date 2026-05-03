# 🌐 Strategische Erweiterung: Vereins-Website als Kern-Feature

Das ist ein **strategisch sehr kluger Pivot** — und er löst gleich mehrere der zuvor identifizierten Blindspots. Lass mich das einordnen, die Konsequenzen durchdenken und einen konkreten Umsetzungsplan skizzieren.

---

## 🎯 1. Warum das ein Game-Changer ist

<details open>
<summary><b>Marktrealität der Schachvereins-Websites</b></summary>

Wer sich heute Schachvereins-Websites ansieht, findet:
- **~60%** hoffnungslos veraltetes WordPress mit Jahre alten Plugins (Sicherheitsrisiko!)
- **~20%** selbstgebastelte HTML/Joomla-Uralt-Seiten vom "Vereinsmitglied, das was mit Computern macht"
- **~10%** Jimdo/Wix (statisch, keine Integration)
- **~5%** gar keine Website, nur Facebook/DSB-Portal-Eintrag
- **~5%** professionell gepflegt

**Das Schmerzensproblem ist riesig und ungelöst:**
- Kein Vereinsvorstand *will* WordPress-Admin sein
- Plugin-Updates werden vergessen → Security-Desaster
- Der "IT-Wart" zieht weg → Website tot
- Termine werden doppelt gepflegt (einmal Website, einmal intern)
- Tabellen werden per Copy-Paste aktualisiert

</details>

<details open>
<summary><b>Euer USP wird dadurch massiv schärfer</b></summary>

**Vorher:** "Noch eine Vereinsverwaltung, die mit Swiss-Manager konkurriert" → schwacher USP
**Nachher:** "Die einzige Lösung, bei der eure interne Verwaltung **automatisch** eure öffentliche Website befüllt" → **starker, eindeutiger USP**

Das ist ein klassischer **"Single Source of Truth"-Vorteil**: Tabellenstand ändert sich in der Verwaltung → Website aktualisiert sich live. Kein Doppelpflege-Aufwand mehr.

</details>

---

## 🏗️ 2. Architektur-Implikationen

Das verändert euer technisches Setup grundlegend. Hier die saubere Architektur:

### Das 3-Ebenen-Modell

```
┌─────────────────────────────────────────────────────┐
│  PUBLIC LAYER  (Öffentliche Website)                │
│  → schachverein-musterstadt.de                      │
│  → SSG/ISR, öffentlich cachebar, SEO-optimiert      │
│  → Liest aus: Tournaments, Matches, Events, News    │
├─────────────────────────────────────────────────────┤
│  MEMBER LAYER  (Mitgliederbereich)                  │
│  → schachverein-musterstadt.de/intern               │
│  → Authentifiziert, SSR, eure bestehende App        │
├─────────────────────────────────────────────────────┤
│  ADMIN LAYER  (Verwaltung)                          │
│  → app.checkmate-manager.de                         │
│  → Full Dashboard, Finanzen, Turniere               │
└─────────────────────────────────────────────────────┘
           ↓
     Gemeinsame PostgreSQL-DB (Multi-Tenant)
```

### Technologie-Stack-Anpassungen

| Bereich | Entscheidung | Begründung |
|---------|-------------|------------|
| **Rendering** | **ISR (Incremental Static Regeneration)** | Öffentliche Seiten müssen schnell sein (Core Web Vitals für SEO) |
| **Multi-Domain** | **Custom Domains pro Verein** via Vercel | `schachverein-musterstadt.de` statt Subdomain |
| **CMS-Layer** | **Eigenes Block-basiertes CMS** (nicht Sanity/Strapi) | Tight Integration mit Turnier-/Mitgliederdaten |
| **Bild-Handling** | **Next.js Image + S3/MinIO** | WebP/AVIF, Responsive |
| **Caching** | **CDN + ISR** | Wichtig, da Vereinswebsites peak bei Turnieranmeldung |

---

## 📋 3. Funktionsumfang: Das Website-Modul

### A. Seiten-Baukasten (No-Code für Vorstände)

<details open>
<summary><b>Block-basierter Editor (keine Code-Kenntnisse nötig)</b></summary>

- **Hero-Blöcke**: Bild + Überschrift + CTA
- **Text-Blöcke**: WYSIWYG mit Vereinsvokabular-Spellcheck
- **Team-Blöcke**: "Unsere Mannschaften" → zieht automatisch aus DB
- **Turnier-Blöcke**: Aktuelle Turniere + Anmeldelink
- **Tabellen-Blöcke**: Mannschaftsspielpläne, Tabellen (live!)
- **Mitglieder-Blöcke**: "Unser Vorstand" (mit Berechtigung zur Namensnennung)
- **Partie-des-Monats-Blöcke**: Interaktives Brett eingebettet
- **Anfahrts-Blöcke**: Karte + Öffnungszeiten
- **News/Blog-Blöcke**: Artikel mit Tags (Jugend, Liga, Turnier)

</details>

### B. Automatisch generierte Inhalte (Das Killer-Feature)

| Inhalt | Quelle | Aktualisierung |
|--------|--------|----------------|
| **Mannschaftsspielpläne** | `matches`-Tabelle | Live bei Ergebniseingabe |
| **Tabellenstände** | `matchResults` | Automatisch berechnet |
| **Turnierankündigungen** | `tournaments` mit `isPublic=true` | Sofort bei Erstellung |
| **Live-Turniertabellen** | `tournamentParticipants` | WebSocket-Push |
| **Vereinskalender** | `events` | iCal-Sync für Besucher |
| **DWZ-Bestenliste** | `members` + `dwzHistory` | Monatlich |
| **Spieler-Steckbriefe** | `members` (opt-in) | Bei DWZ-Änderung |
| **Partie-Archiv** | `games` mit `isPublished=true` | Kurator gibt frei |

### C. Multi-Domain & Branding

- **Eigene Domain**: `sf-musterstadt.de` statt Subdomain
  - SSL via **Let's Encrypt automatisiert** (Vercel/Caddy)
  - DNS-Anleitung für Vorstände (TXT/CNAME-Verifikation)
- **Subdomain-Fallback**: `sf-musterstadt.checkmate.club` für Einsteiger
- **Theme-System**:
  - 5–10 vordefinierte Themes (klassisch, modern, minimalistisch, dark)
  - Farbanpassung (Primär/Sekundär)
  - Logo-Upload
  - Schriftart-Auswahl (Google Fonts DSGVO-sicher self-hosted!)
- **Kein Custom-CSS** im Basistarif (Support-Albtraum vermeiden)

### D. SEO & Auffindbarkeit

<details>
<summary><b>SEO-Features (wichtig, viele Vereine leiden hier)</b></summary>

- **Automatische Meta-Tags** aus Vereinsdaten
- **Schema.org Markup**: 
  - `SportsOrganization` für den Verein
  - `SportsEvent` für Turniere
  - `Person` für Spielerprofile (opt-in)
- **Sitemap.xml** automatisch
- **robots.txt** konfigurierbar
- **Open Graph** für Social Sharing
- **Canonical URLs** (wichtig bei Multi-Domain)
- **Core Web Vitals** Monitoring (PageSpeed)
- **Lokale SEO**: "Schachverein in [Stadt]" → strukturierte Adressdaten
- **Google Business Profile Sync** (manuell, aber dokumentiert)

</details>

### E. Öffentliche Komponenten (mit Datenschutz-Toggle)

- **Kontaktformular** mit Spam-Schutz (Honeypot + hCaptcha, **kein** reCAPTCHA = DSGVO-Problem)
- **Turnier-Anmeldung** (auch für Nicht-Mitglieder/Gäste)
- **Newsletter-Anmeldung** (Double-Opt-In!)
- **Mitgliedsantrag-Online-Formular** → landet in eurer Verwaltung
- **Spendenformular** (Mollie-Integration)
- **Probetraining-Buchung**
- **Event-Anmeldung** (Vereinsfeier, Simultan)

---

## 🛡️ 4. Welche Blindspots werden dadurch gelöst?

| Bisheriger Blindspot | Wird gelöst durch Website-Modul? |
|---------------------|----------------------------------|
| Schwacher USP vs. Swiss-Manager | ✅ **Massiv**: Swiss-Manager bietet keine Website |
| Preismodell wirkt teuer | ✅ 39 €/Monat für **Verwaltung + Website + Hosting** ist plötzlich günstig |
| Zielgruppe 55+ überfordert | ✅ "Ein System statt drei" ist *einfacher*, nicht komplizierter |
| "Feature-Maximalismus" | ⚠️ Wird noch schlimmer, wenn nicht fokussiert |
| Akquisestrategie unklar | ✅ **Website als Einstiegs-Hook**, Verwaltung als Upsell |

---

## ⚠️ 5. Neue Blindspots, die durch Website-Modul entstehen

<details open>
<summary><b>🔴 DSGVO-Komplexität explodiert</b></summary>

Eine öffentliche Website ist **DSGVO-rechtlich deutlich sensibler** als interne Verwaltung:

- **Cookie-Banner nach TTDSG**: Muss pro Vereinsseite konfigurierbar sein
- **Impressumspflicht nach § 5 TMG** — **wer haftet**? Der Verein, aber ihr müsst Felder zwingend einfordern
- **Datenschutzerklärung-Generator**: Muss automatisch generiert werden basierend auf eingebauten Features (Matomo? Google Fonts? Karten?)
- **Karten-Einbettung**: Google Maps = DSGVO-Problem → **OpenStreetMap/Leaflet** zwingend
- **Bilder von Mitgliedern**: Einwilligung pro Bild/pro Person nötig — eigener Workflow
- **Spieler-Ergebnisse veröffentlichen**: DWZ ist personenbeziehbar → **Opt-in nötig**, besonders bei Jugendlichen!
- **Turnierfotos mit Kindern**: Eltern-Einwilligung explizit
- **Analytics**: Matomo self-hosted (DSGVO-OK) vs. Plausible vs. GA4 (problematisch)
- **Social-Media-Embeds** (YouTube, Instagram) → Shariff-Lösung nötig

</details>

<details open>
<summary><b>🔴 Barrierefreiheit wird zur Pflicht</b></summary>

Mit dem **BFSG (seit 28.06.2025)** wird das kritisch:
- B2C-Formulare (Mitgliedsantrag, Kontakt) **fallen unter BFSG**
- **WCAG 2.2 AA** muss zwingend erfüllt sein
- Kontraste, Alt-Texte, Keyboard-Navigation, Screenreader-Tests
- Automated Testing via **axe-core** im CI
- **Testflächen-Haftung**: Ihr haftet ggü. Kunden-Vereinen

</details>

<details>
<summary><b>🟠 Content-Moderation & Verantwortlichkeit</b></summary>

- **Was, wenn ein Verein rechtswidrige Inhalte postet?** (Beleidigungen, Urheberrechtsverletzungen)
- **Notice-and-Take-Down-Workflow** nötig (nach DSA!)
- **Digital Services Act (DSA)** — ihr seid "Hosting-Dienst" ab erstem Kunde
- **Transparenzberichte** nach DSA ab 45 Mio. Nutzer — irrelevant für euch, aber: **allgemeine Meldefunktionen sind Pflicht**
- **Moderationsrichtlinien** für Kommentare (falls aktiviert)

</details>

<details>
<summary><b>🟠 Domain- & DNS-Management</b></summary>

- **Wer registriert die Domain?** Der Verein bei einem Registrar oder ihr?
- **Domain-Transfer** bei Kündigung → muss sauber dokumentiert sein
- **DNS-Ausfall** = Website weg → Wer supportet nachts?
- **E-Mail unter eigener Domain** (info@sf-musterstadt.de) → **erwartet eure Kunden!** → Ihr braucht ein E-Mail-Hosting-Angebot oder Partner
- **DMARC/SPF/DKIM**-Setup-Anleitung für Vereine
- **DNSSEC** für höhere Sicherheit

</details>

<details>
<summary><b>🟡 Content-Migration von Bestandsseiten</b></summary>

- **WordPress-Import-Tool** (Medien, Artikel, Menüs) — nicht trivial
- **Joomla-Import** für ältere Seiten
- **URL-Redirects** (301) von alter zu neuer Struktur, sonst SEO-Crash
- **Content-Audit** — viele Vereinsseiten haben 10+ Jahre Inhalt-Leichen
- **Google Search Console**-Re-Indexing dokumentieren

</details>

<details>
<summary><b>🟡 Performance & Skalierung</b></summary>

- Am Turniertag: **1 Seite = 500 Besucher gleichzeitig** (Liveticker!) → muss funktionieren
- **DDoS-Schutz** (CDN in front = empfohlen)
- **CDN-Kosten** bei vielen Vereinen → in Preisen einkalkulieren
- **Bild-Optimierung pflicht**: Vorstände laden 8-MP-Fotos hoch

</details>

---

## 💰 6. Angepasstes Preismodell: Freemium + Addons

### Grundprinzip: Kostenlos für immer

Die Software ist **für alle Vereine kostenlos** — ohne Mitgliedslimit, ohne Zeitbegrenzung.

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

**Entscheidende Änderungen:**
- **Kostenlos für immer** — Keine Mitgliedslimits, keine Zeitbegrenzung
- **Nur das zahlen, was man braucht** — Ein Verein ohne SEPA braucht kein Finanzmodul
- **Kombi-Rabatt** belohnt Vereine, die mehrere Module nutzen
- **Jahresabo -15%** (Vereine planen jährlich!)
- **Gemeinnützigkeits-Rabatt -20%** (formalisiert)
- **Setup-Paket** (299 € einmalig, Migration + Schulung)

---

## 🗺️ 7. Angepasste Roadmap

### Phase 1 (Monat 1–3): Fundament + **Website-MVP**
- Multi-Club Auth, RBAC ✅
- **Basis-Website mit 5 Block-Typen**
- Subdomain-Routing
- Impressum-/DSGVO-Generator

### Phase 2 (Monat 4–6): Integration Website ↔ Verwaltung
- Automatische Turnier-/Mannschaftsseiten
- Custom-Domain-Support
- News/Blog-Modul
- Kontaktformulare + Mitgliedsantrag

### Phase 3 (Monat 7–9): Schach-Sport
- Schweizer System, Lichess-Integration, DWZ
- **Live-Ticker auf öffentlicher Website**

### Phase 4 (Monat 10–12): Finanzen + SaaS
- SEPA, Mahnwesen
- Stripe-Abos
- **Migration-Tools (WordPress-Importer)**

---

## 🎯 8. Konkrete nächste Schritte (empfohlen)

<details open>
<summary><b>Sofort-Maßnahmen</b></summary>

1. **Wettbewerbsanalyse Vereinswebsite-Anbieter**:
   - **Vereinsflieger** (hat Website-Modul, aber generisch)
   - **SPG-Verein** (älter, aber etabliert)
   - **Kirchturm.digital** / **Clubdesk** (Schweiz)
   - **wir-der-verein.de** (günstig, simpel)
   
2. **5 Vereinsvorstände interviewen**:
   - Was nervt an eurer aktuellen Website?
   - Wer pflegt sie? Wie viel Zeit?
   - Was würdet ihr zahlen für "Verwaltung + Website in einem"?

3. **Referenz-Verein finden** für Pilotprojekt
   - Idealerweise mit sterbendem WordPress und motiviertem Vorstand
   - Kostenlose erste 12 Monate gegen Referenz + Feedback

4. **Architekturentscheidung final treffen**:
   - **Vercel ist nun tatsächlich sinnvoll** für Website-Layer (ISR, Edge, CDN)
   - **Vercel** für Frontend + InsForge für Backend
   - Split-Architektur für optimale Performance
   - Split-Architektur wird aus "Bug" zum "Feature"

</details>

---

### 💬 Strategisches Fazit

Mit dem Website-Modul **transformiert sich euer Produkt** von "Noch-eine-Verwaltungssoftware" zu einer **vertikalen All-in-One-Plattform für Schachvereine**. Das ist strategisch klüger, weil:

1. **Der Schmerz auf Website-Seite ist viel akuter** als auf Verwaltungsseite (Swiss-Manager "reicht" vielen Vereinen)
2. **Ihr bekommt einen klaren Graben**: Swiss-Manager kann das nicht, Vereinsflieger hat keine Schachkompetenz
3. **Der "Single Source of Truth"-Effekt** ist ein mächtiger Lock-in (sobald Website + Verwaltung gekoppelt sind, wechselt niemand mehr)
4. **Akquisitionskosten sinken** durch kostenlose Website-Tier

**Aber**: Der Rechts-, Barrierefreiheits- und Support-Aufwand verdoppelt sich. Das muss in Team-Planung und Preisgestaltung einfließen.

---

Möchtest du, dass ich als nächstes eines davon ausarbeite?
- 🎨 **Detaillierte Spezifikation des Website-Block-Editors**
- 🏗️ **Technisches Architektur-Diagramm (Vercel + InsForge)**
- 📊 **Detaillierte Wettbewerbsanalyse Vereinswebsite-Markt**
- ⚖️ **DSGVO-Compliance-Paket für öffentliche Vereinsseiten**