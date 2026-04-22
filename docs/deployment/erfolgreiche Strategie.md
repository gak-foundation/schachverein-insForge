# Launch-Strategie — schach.studio

> Quelle der Wahrheit für Positionierung, Pricing und Go-To-Market von **schach.studio**.
> Diese Datei ersetzt die vorherige Version, die vom falschen Ausgangszustand
> (Self-Hosted-Supabase, UG-Gründung, 3.000–5.000 € Rechts-Budget) ausgegangen ist.

---

## 1. Ausgangslage

- **Produkt-Stand:** MVP in Entwicklung — nicht „Phasen 1–3 abgeschlossen".
- **Budget:** Bootstrap, 0–500 € Gesamt-Startbudget.
- **Team:** Solo-Gründer, aktiver DWZ-Spieler.
- **Zielgruppe:** mittlere deutsche Schachvereine, 50–200 Mitglieder.
- **Stack:** Next.js 16 + Supabase Managed (EU) + Drizzle, siehe `docs/AGENTS.md`.
- **Vertriebs-Modus:** Product-Led, keine Aussendienst-Kapazität.

---

## 2. Positionierung & USP

### Hero-Claim

> **Die All-in-One-Schachvereinssoftware — barrierefrei nach BFSG, bezahlbar für jeden Verein.**

### Drei Säulen (immer gemeinsam kommunizieren)

1. **All-in-One** — Website + Mitglieder + Turniere + Liga + DWZ + Beiträge in einem Tool, nicht in fünf zusammengeklebten.
2. **Barrierefrei** — WCAG 2.2 AA umgesetzt, bereit für BFSG 2025.
   *Wording-Regel:* „bereit für BFSG", „WCAG 2.2 AA umgesetzt" — **nicht** „BFSG-konform" und **nicht** „Ihr seid BFSG-pflichtig".
3. **Vereinsfreundlich bezahlbar** — dauerhaft kostenlos bis 20 Mitglieder, 9 €/Monat ab 20, 20 €/Monat mit eigener Domain.

### Abgrenzung gegen bestehende Lösungen

| Wettbewerber | Was sie sind | Schwäche | Unser Framing |
|---|---|---|---|
| **Chessmanager** | Turnier-Software (Swiss/Rundenturnier) | Kein Website-Layer, keine Mitglieder, keine Beiträge, kein A11y | „Chessmanager ist ein Werkzeug. schach.studio ist das Zuhause eures Vereins." |
| **SIS / Schachbund-Meldesystem** | Verband-Meldung | Reine Admin-Datenhaltung, keine Öffentlichkeit für Mitglieder | „Ihr meldet sowieso an SIS. Wir liefern alles dazu, was SIS nicht kann." |
| **easyVerein + WordPress** | Generische Vereins-SW + CMS (~25–40 €/Monat) | Zwei Tools, zwei Logins, kein DWZ, keine Paarung, WP selten barrierefrei | „Ein Tool statt zwei. Halber Preis. Und es versteht Schach." |
| **ChessBase-Vereinslösungen** | Desktop-Profi-Tools | Kein modernes SaaS, nicht mobilfreundlich | „ChessBase ist für Profis. schach.studio ist für Vereine." |
| **WordPress solo + Excel** | Status quo in ~70 % der Vereine | Wartung, kein Schach-Kontext, kein A11y-Fundament | „Wir ersetzen Excel UND WordPress UND den Papierzettel." |

### Feature-Matrix

| Feature | schach.studio | Chessmanager | SIS | easyVerein + WP | Excel + WP |
|---|---|---|---|---|---|
| Öffentliche Vereinswebsite | ✓ | – | – | ✓ (separat) | ✓ (separat) |
| Mitgliederverwaltung | ✓ | – | – | ✓ | teilweise |
| DWZ-Anzeige & Sync | ✓ | teilweise | ✓ | – | – |
| Turnierpaarung | ✓ (R2) | ✓ | – | – | – |
| Liga / Mannschaften | ✓ (R2) | – | – | – | – |
| SEPA / Beiträge | ✓ (R4) | – | – | ✓ | – |
| WCAG 2.2 AA | ✓ | – | – | – | – |
| Einstiegspreis | **0 €** | 0 € (pro Turnier) | 0 € (Verband) | ab 25 € | variabel |

---

## 3. Pricing

### Tarife (vom Gründer bestätigt)

```
┌─────────────────┬─────────────────┬─────────────────────────┐
│ KOSTENLOS       │ VEREIN — 9 €/Mo │ VEREIN PRO — 20 €/Mo    │
│ bis 20 Mitglied.│ ab 20 Mitgl.    │ ab 20 Mitgl.            │
├─────────────────┼─────────────────┼─────────────────────────┤
│ Alle Features   │ Alle Features   │ Alle Features           │
│ Subdomain ODER  │ Subdomain ODER  │ Eigene Domain           │
│ /verein-slug    │ /verein-slug    │ + White-Label           │
│ schach.studio-  │ schach.studio-  │ (eigenes Logo,          │
│ Footer          │ Footer          │ ohne schach.studio-     │
│                 │                 │ Footer)                 │
└─────────────────┴─────────────────┴─────────────────────────┘
```

- **Jahreszahlung = 2 Monate gratis** (10 × 9 € = 90 €/Jahr, 10 × 20 € = 200 €/Jahr). Reduziert Churn und Zahlungs-Overhead.
- **Pilotvereine:** 12 Monate Verein-Tarif gratis, danach lebenslang 50 % (= 4,50 €/Monat) gegen Case Study + Testimonial.

### Warum genau diese Höhe

- Durchschnittsverein mit 100 Mitgliedern, 60 €/Jahr Beitrag = 6.000 € Budget.
- 108 €/Jahr Software = **1,8 %** des Budgets — passt durch jeden Kassenbericht.
- Preissensitivität im Ehrenamt ist nichtlinear: 9 € = „Ja", 19 € = „Diskussion", 39 € = „Nein".
- Niedriger Preis × hohes Volumen ist die einzige Strategie ohne Vertriebsapparat.

### Upsell-Treppe

```
Free (< 20 Mitglieder)
   │   Verein wächst über 20
   ▼
Verein (9 €)
   │   Will eigene Marke/Domain
   ▼
Verein Pro (20 €)
   │   Landesverband fragt nach Bündel
   ▼
Verbands-Lizenz (custom, z. B. 199 €/Mo)
```

### Ziel-MRR

Bei 100 zahlenden Vereinen in Jahr 2: **900–2.000 €/Monat MRR** — realistisches Bootstrap-Ziel.

---

## 4. Go-To-Market (0–500 €)

1. **Dogfooding im eigenen Verein** — wir sind selbst unser erster Kunde.
2. **Direktansprache 20 handverlesener Vereine** (persönliches Netzwerk, Bezirksliga).
3. **DSB-Forum + regionale Facebook-Gruppen** — Präsenz als Mitglied, nicht als Werber.
4. **Landesverband-Outreach** — Angebot an DSB-Untergliederungen, Anwendern Bündelrabatt.
5. **SEO Long-Tail** — drei Seed-Artikel in v1:
   - „BFSG 2025 für Schachvereine: Was Vorstände jetzt wissen müssen"
   - „DWZ automatisch auf der Vereinswebsite anzeigen"
   - „SwissChess-Ergebnisse online veröffentlichen"

### Bewusst **nicht** getan

- Keine bezahlten Ads in v1 (Burn ohne Feedback).
- Keine UG-Gründung bevor ≥ 3 zahlende Vereine da sind (Rechtsform-Overhead).
- Kein Product-Hunt-Launch (falsche Zielgruppe, Trafficspike ohne Bindung).
- Keine 3.000–5.000 € Anwalts-Rechnung vorab — Start mit eRecht24-Generator + Eigen-Review; Anwaltsprüfung erst bei realen zahlenden Kunden.

---

## 5. Domains & technische Trennung

| Domain | Inhalt | Code |
|---|---|---|
| `schach.studio` | Marketing-Site + öffentliche Vereinswebsites | `src/app/(marketing)` + `src/app/clubs/[slug]` |
| `app.schach.studio` | Login + Admin-Dashboard | `src/app/auth`, `src/app/dashboard` |

- **Routing** via `src/middleware.ts` (Host-Header-basiert).
- **Tenancy v1:** Path-based (`schach.studio/<slug>`), umgesetzt als Rewrite auf `src/app/clubs/[slug]`.
- **Subdomain / Custom Domain:** Nachgezogen für Verein-Pro-Tarif.

---

## 6. Roadmap-Anpassung

Ergänzt die vorhandenen Release-Stufen in `docs/roadmap/mvp-phases.md` um einen A11y-Gate:

- **R1 – MVP Vereinskern** → Dogfooding im eigenen Verein.
- **R2 – Turnier + Liga** → Closed Beta mit 3–5 Pilotvereinen.
- **R2.5 – BFSG/WCAG-Audit + Trust-Features (NEU, blockierend)** →
  Lighthouse ≥ 90, axe-core ohne kritische Befunde, Barrierefreiheitserklärung live,
  Impressum + Datenschutz + AVV-Muster veröffentlicht.
- **R3 – Public Launch mit Preisschild** → Pricing live, Zahlungsabwicklung, SEO-Artikel v1.
- **R4 – Finanzen/SEPA + Shop** → Monetarisierung & Zusatzumsatz.

---

## 7. Gates & North-Star-Metric

| Gate | Kriterium |
|---|---|
| R1 abgeschlossen | Eigener Verein nutzt schach.studio im Alltag |
| Beta startet | ≥ 3 Pilotvereine unterschreiben LOI, NPS ≥ 40 |
| Public Launch | ≥ 3 Testimonials, WCAG-Audit bestanden, Rechtsseiten fertig |
| Skalierung | ≥ 20 zahlende Vereine, Churn < 5 %/Monat |

**North Star Metric:** *Wöchentlich aktive Vereine (WAC)* — Vereine mit ≥ 3 Logins in der letzten Woche.

**Qualitäts-KPI:** *Time-to-Migrate* — CSV-Upload bis fertiger SEPA-Lauf in < 60 Minuten.

---

## 8. Erste Woche (konkrete To-dos)

```
HEUTE
  □ Marketing-Route-Group (marketing) fertigstellen
  □ Pricing auf 9/20 € harmonisieren
  □ Kontaktformular produktiv (DB + Resend)

DIESE WOCHE
  □ Landingpage-Copy finalisieren (BFSG-Wording prüfen)
  □ Barrierefreiheitserklärung veröffentlichen
  □ 3 Pilotvereine persönlich ansprechen

NÄCHSTE WOCHE
  □ Pricing-Seite + Vergleichsseite live
  □ SEO-Setup (Sitemap, robots.txt, OG, JSON-LD)
  □ Erste Long-Tail-Artikel schreiben
```

---

## 9. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| BFSG-Abmahnwelle durch übertriebene Claims | mittel | Wording-Regel (Säule 2), Anwalts-Review vor Launch |
| Pilotvereine springen ab | mittel | Langfristige Pilotkonditionen (50 % lifetime), enge Einzel-Begleitung |
| Datenschutz-Vorfall | niedrig, hoch-impact | Supabase EU-Region, Verschlüsselung sensibler Felder, Audit-Logs |
| Konkurrent kopiert Pricing | hoch | Geschwindigkeit + Community-Beziehung als Moat, nicht Feature-Count |
| Solo-Burnout | mittel | Zeitbudget-Disziplin, klare R-Cuts, keine Ads-Experimente |

---

## 10. Was NICHT getan wird

- Kein Self-Hosted Supabase zum Start (Managed Supabase EU ist DSGVO-konform).
- Keine UG-/GmbH-Gründung vor Product-Market-Fit.
- Keine Cookie-Banner-Walls ohne nachgewiesenes Tracking (Plausible self-hosted = cookiefrei).
- Keine Google Fonts vom CDN — lokal via `next/font`.
- Keine Feature-Limitierung im Free-Tier (nur Mitgliederzahl limitiert), damit Kleinvereine als Community gewonnen werden.
- Keine eigenen Zahlungsadapter vor Mollie/Stripe-Integration in R4.
