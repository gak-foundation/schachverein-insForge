# Features Page Design - schach.studio

**Datum:** 2026-05-04
**Status:** Approved

---

## Ziel

Eigenständige `/features`-Seite die alle Feature-Bereiche der schach.studio-Plattform detailliert prasentiert. Dient als zentrale Produktubersichtsseite fur Interessenten.

## Route & Layout

- **Route:** `/features`
- **Layout:** Nutzt `(marketing)/layout.tsx` (Navbar + Footer)
- **Page-Typ:** Server Component (`page.tsx`), mit Client-Komponenten (`FeatureNav`)
- **SEO:** Meta-Title "Features | schach.studio", Description, JSON-LD `WebPage`

## Seitenstruktur

### Hero-Bereich
- Kleiner Hero im Stil des bestehenden Homepage-Heros
- Titel: "Alle Features im Uberblick"
- Untertitel: "Entdecke, was schach.studio fur deinen Verein leisten kann"
- Badge: "100% Kostenlos fur alle Vereine"
- Gradient-Blur-Orb Hintergrund

### Sticky Feature-Navigation (`FeatureNav`)
- **Desktop:** Linke Sidebar (`w-56`, `sticky top-24`), Glass-Effekt
  - Links zu allen 10 Sektionen per `scrollIntoView({ behavior: "smooth" })`
  - Aktiver Zustand via `IntersectionObserver` (rootMargin: -20%)
  - Aktiver Link: `text-primary` + `border-l-2 border-primary`
- **Mobile:** Horizontal scrollbare Tab-Leiste unter dem Hero (`sticky top-16`)
  - Aktiver Tab: Bottom-Border `border-primary`

### Feature-Sektionen (`FeatureSection`)
10 Sektionen im Schachbrett-Muster (alternierendes Layout):

| # | Sektion | Ungerade (Bild links) / Gerade (Bild rechts) |
|---|---------|---------------------------------------------|
| 1 | Mitgliederverwaltung | Bild links |
| 2 | Turniere & Spiele | Bild rechts |
| 3 | Mannschaften | Bild links |
| 4 | Finanzen & Beitrage | Bild rechts |
| 5 | Vereins-Website & CMS | Bild links |
| 6 | Kalender & Termine | Bild rechts |
| 7 | Kommunikation | Bild links |
| 8 | Training & Analyse | Bild rechts |
| 9 | Sicherheit & DSGVO | Bild links |
| 10 | Integrationen | Bild rechts |

Jede Sektion enthalt:
- **Icon** (lucide-react) in einer farbigen Box (`bg-primary/10`)
- **Titel** (`font-heading text-3xl font-bold`)
- **Beschreibung** (2-3 Satze, `text-muted-foreground`)
- **Unterfeatures:** Liste mit Check-Icons (`CheckCircle2`, `Clock` fur Coming Soon)
  - Jedes Unterfeature mit Status-Badge (`Bereits verfugbar` / `In Entwicklung`)
- **Bild-Platzhalter:** `aspect-video` Container mit `bg-muted/50`, gestricheltem Border, Text "Screenshot folgt"
- **Trennlinie** zwischen Sektionen (`editorial-divider`)

## Feature-Kategorien & Inhalte

### 1. Mitgliederverwaltung
**Icon:** `Users`
**Beschreibung:** Zentrale Verwaltung aller Vereinsmitglieder mit Selbstverwaltungs-Portal. Mitglieder konnen ihre eigenen Daten pflegen, wahrend der Vorstand volle Kontrolle behalt.
**Unterfeatures:**
- [Verfugbar] DWZ-Integration mit automatischem Abgleich
- [Verfugbar] Familien-Verknupfungen und Beitragsstufen
- [Verfugbar] Rollen- und Berechtigungssystem (8 Rollen)
- [Verfugbar] CSV-Import/Export fur Mitgliederdaten
- [Verfugbar] Selbstverwaltungs-Portal fur Mitglieder
- [Verfugbar] Gastzugange fur Eltern

### 2. Turniere & Spiele
**Icon:** `Trophy`
**Beschreibung:** Vollstandiges Turniermanagement mit Schweizer System, Rundenturnieren und Live-Ergebnissen. Alle Ergebnisse erscheinen automatisch auf der Vereins-Website.
**Unterfeatures:**
- [Verfugbar] Schweizer System Paarungen (bbpPairings Engine)
- [Verfugbar] Rundenturniere mit automatischer Runden-Generierung
- [Verfugbar] Live-Ticker fur Turnierergebnisse
- [Verfugbar] Kreuztabellen-Generierung
- [Verfugbar] PGN-Import und Cloud-Speicherung
- [Verfugbar] Matrix-Ergebniseingabe fur schnelle Erfassung

### 3. Mannschaften
**Icon:** `UsersRound`
**Beschreibung:** Mannschaftsplanung mit Verfugbarkeitsabfragen und Drag & Drop Aufstellung. Mannschaftsfuhrer behalten den Uberblick uber alle Spieler.
**Unterfeatures:**
- [Verfugbar] Verfugbarkeitsabfragen pro Spieltag
- [Verfugbar] Aufstellungsplanung per Drag & Drop
- [Verfugbar] Automatische Mannschaftsseiten auf der Website
- [Verfugbar] Saison- und Ligenverwaltung
- [In Entwicklung] Spielerstatistiken pro Mannschaft

### 4. Finanzen & Beitrage
**Icon:** `PieChart`
**Beschreibung:** Automatische Beitragsberechnung, SEPA-Export und dreistufiges Mahnwesen. Alle Finanzdaten werden mit AES-256 verschlusselt gespeichert.
**Unterfeatures:**
- [Verfugbar] Automatische Beitragsberechnung nach Stufen
- [Verfugbar] SEPA-XML Export (pain.008) fur Bankeinzuge
- [Verfugbar] 3-stufiges Mahnwesen mit automatischen Fristen
- [Verfugbar] DATEV-Export fur Steuerberater
- [Verfugbar] AES-256-GCM Verschlusselung fur IBAN/BIC
- [Verfugbar] Zahlungsverfolgung und -historie

### 5. Vereins-Website & CMS
**Icon:** `Globe`
**Beschreibung:** Jeder Verein erhalt automatisch eine professionelle, SEO-optimierte Website. Inhalte aus der Verwaltung erscheinen in Echtzeit - ohne Doppelpflege.
**Unterfeatures:**
- [Verfugbar] Automatisch befullte Vereins-Website
- [Verfugbar] Block-basierter Seiteneditor mit Drag & Drop
- [Verfugbar] News- und Blog-System
- [Verfugbar] SEO-Optimierung mit JSON-LD
- [Verfugbar] Individuelle Domain-Anbindung
- [Verfugbar] Barrierefrei nach WCAG 2.2 AA

### 6. Kalender & Termine
**Icon:** `CalendarCheck`
**Beschreibung:** Zentraler Vereinskalender mit iCal-Export. Trainings, Spieltage und Veranstaltungen auf einen Blick - automatisch auf der Website.
**Unterfeatures:**
- [Verfugbar] Terminverwaltung mit Kategorien
- [Verfugbar] iCal-Feed fur externe Kalender
- [Verfugbar] Automatische Anzeige auf der Website
- [Verfugbar] Wiederkehrende Termine
- [In Entwicklung] Anwesenheits-Tracking

### 7. Kommunikation
**Icon:** `Mail`
**Beschreibung:** DSGVO-konforme Mitgliederkommunikation mit Zielgruppen-Filtern. Opt-in/Opt-out Management fur Newsletter und E-Mail-Verteiler.
**Unterfeatures:**
- [In Entwicklung] E-Mail-Verteiler mit Zielgruppen-Filtern
- [In Entwicklung] Newsletter-System mit Opt-in/Opt-out
- [In Entwicklung] E-Mail-Vorlagen fur wiederkehrende Kommunikation
- [In Entwicklung] Kommunikations-Historie pro Mitglied

### 8. Training & Analyse
**Icon:** `Brain`
**Beschreibung:** Integrierte Schach-Analyse mit Stockfish-Engine. Partien analysieren, Eroffnungen studieren und Trainingsfortschritte dokumentieren.
**Unterfeatures:**
- [Verfugbar] Stockfish-Partieanalyse
- [Verfugbar] PGN-Import von Lichess und anderen Plattformen
- [Verfugbar] Interaktives Analyse-Brett
- [In Entwicklung] Eroffnungstrainer
- [In Entwicklung] Trainingsdokumentation

### 9. Sicherheit & DSGVO
**Icon:** `Shield`
**Beschreibung:** Hochste Sicherheitsstandards mit AES-256 Verschlusselung, Audit-Logging und voller DSGVO-Konformitat. Hosting ausschliealich in Deutschland.
**Unterfeatures:**
- [Verfugbar] AES-256-GCM Verschlusselung sensibler Daten
- [Verfugbar] Luckenloses Audit-Logging aller Anderungen
- [Verfugbar] Granulares Rollen- und Berechtigungssystem (65+ Permissions)
- [Verfugbar] DSGVO-Einwilligungsmanagement (Bilder, Daten)
- [Verfugbar] Hosting in Deutschland (ISO 27001)
- [Verfugbar] Automatische Loschfristen

### 10. Integrationen
**Icon:** `Plug`
**Beschreibung:** Nahtlose Integration mit den wichtigsten Schach-Plattformen und -Formaten. Automatischer Datenabgleich mit DWZ, Lichess und Verbanden.
**Unterfeatures:**
- [Verfugbar] DWZ/DeWIS-Sync (automatischer Rating-Abgleich)
- [Verfugbar] Lichess OAuth-Integration
- [Verfugbar] TRF-Format Import/Export (Turnier-Report-Format)
- [Verfugbar] DSB-Schnittstelle fur Verbandsmeldungen
- [Verfugbar] FIDE-Rating-Integration

---

## Komponenten-Architektur

```
src/app/(marketing)/features/
  page.tsx                         # Server Component

src/components/marketing/
  feature-nav.tsx                  # Client Component - Sticky Navigation
  feature-section.tsx              # Client Component - Feature-Sektion
  feature-data.ts                  # Feature-Daten (Icons, Texte, Unterfeatures)
```

### feature-data.ts
Exportiert das `features` Array mit allen 10 Kategorien:
```ts
interface SubFeature {
  text: string;
  available: boolean;
}

interface FeatureCategory {
  id: string;           // Anchor-ID (z.B. "mitgliederverwaltung")
  icon: LucideIcon;
  title: string;
  description: string;
  subFeatures: SubFeature[];
}
```

### feature-nav.tsx
- Props: `features: { id, title }[]`
- `useState` fur aktiven Index
- `useEffect` mit `IntersectionObserver` auf alle Sektionen
- `scrollIntoView` bei Klick
- Responsive: Desktop Sidebar / Mobile Tab-Bar
- Accessible: `role="navigation"`, `aria-label`, Keyboard-Navigation

### feature-section.tsx
- Props: `FeatureCategory`, `index: number`
- `index % 2 === 0` -> Bild links, Text rechts
- `index % 2 === 1` -> Text links, Bild rechts
- framer-motion `motion.div` mit `whileInView` fur Animation
- Bild-Platzhalter als `div` mit `aspect-video`, gestricheltem Border

### page.tsx
```tsx
import { features } from "@/components/marketing/feature-data";
import { FeatureNav } from "@/components/marketing/feature-nav";
import { FeatureSection } from "@/components/marketing/feature-section";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative pt-16 pb-16 lg:pt-20 lg:pb-20 overflow-hidden">
        {/* ... gradient bg ... */}
        <div className="container mx-auto px-4 text-center">
          <Badge>100% Kostenlos</Badge>
          <h1>Alle Features im Uberblick</h1>
          <p>Entdecke, was schach.studio fur deinen Verein leisten kann</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <FeatureNav features={features} />
          <div className="flex-1">
            {features.map((feature, index) => (
              <FeatureSection key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 bg-muted/30 text-center">
        <h2>Bereit fur den ersten Zug?</h2>
        <Link href="/auth/signup">Kostenlos starten</Link>
      </section>
    </div>
  );
}
```

## Design-Tokens (aus bestehendem System)

- **Schrift:** Playfair Display (Uberschriften), Inter (Flieatext)
- **Farben:** OKLCH-basiert - Primary `oklch(0.52 0.08 250)`, Background `oklch(0.98 0.01 80)`
- **Cards:** `rounded-xl bg-card border hover:shadow-md`
- **Effekte:** `.glass` (backdrop-blur), `.card-hover` (translate-y), `.friendly-shadow`
- **Abstande:** `py-20` Sektionen, `gap-6` Grid
- **Icons:** lucide-react, `h-5 w-5` Standard
- **Animation:** framer-motion mit `ease: [0.21, 0.47, 0.32, 0.98]`

## Accessibility

- Alle Sektionen als `<section>` mit `aria-labelledby` auf die Uberschrift
- Navigation: `role="navigation"`, `aria-label="Feature-Bereiche"`
- Skip-Link vor der Navigation (visually hidden, focus-visible)
- Tastatur-Navigation fur Sticky-Nav (Tab durch Links)
- Ausreichende Kontraste (OKLCH-Farben = WCAG 2.2 AA)
- `prefers-reduced-motion` respektieren bei Animationen
- Bild-Platzhalter ohne `alt`-Text (rein dekorativ)
- Fokus-Indikatoren auf allen interaktiven Elementen

## Nicht im Scope

- Screenshots/Illustrationen (werden spater generiert)
- Ubersetzungen in andere Sprachen
- A/B-Testing oder Analytics-Tracking
- Dynamisches Laden der Feature-Daten (derzeit statisch)
