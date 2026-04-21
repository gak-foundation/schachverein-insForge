# 🚀 Launch-Strategie: Schachverein SaaS-Plattform

## Zusammenfassung

Eure technische Basis ist stark – Multi-Tenant-Architektur, Phasen 1–3 abgeschlossen, All-Hetzner-Stack mit DSGVO-Konformität. Jetzt geht es darum, **systematisch vom Code zum Produkt** zu kommen. Diese Strategie gliedert sich in drei Dimensionen: **Fundament legen**, **Markt gewinnen**, **skalieren**.

---

## 📅 Gesamtfahrplan (20 Wochen)

```
Wochen 1–4        Wochen 5–8        Wochen 9–12       Wochen 13–16       Wochen 17–20
──────────────     ──────────────     ──────────────     ──────────────     ──────────────
FUNDAMENT          SOFT-LAUNCH        CLOSED BETA        PUBLIC LAUNCH      WACHSTUM
Recht, Infra,      1 Pilotverein      5 Vereine          Öffentlich         Skalierung
Business-Setup     Live-Betrieb       Iteration          Paid Plans         Partnerschaften
```

---

## 🔴 Phase 0: Fundament (Wochen 1–4)

> **Ziel:** Alle rechtlichen, infrastrukturellen und geschäftlichen Blocker beseitigen. Ohne diese Phase keinen einzigen Verein live nehmen.

### Woche 1–2: Rechtliches & Business

<details open>
<summary><b>Checkliste Firmengründung & Recht</b></summary>

| Aufgabe | Deadline | Anmerkung |
|---------|----------|-----------|
| **UG (haftungsbeschränkt) gründen** | Woche 1 | Notar-Termin sofort buchen, Stammkapital min. $1{.}000\,€$, geht in 3–5 Tagen |
| **Geschäftskonto eröffnen** | Woche 1 | Qonto oder Kontist – Eröffnung parallel zur UG |
| **Steuerberater beauftragen** | Woche 1 | USt-Voranmeldung, Kleinunternehmerregelung **nicht** nutzen (B2B!) |
| **IT-Berufshaftpflicht + Cyberversicherung** | Woche 2 | Hiscox oder Exali, ab ca. $30\,€$/Monat |
| **AVV-Muster erstellen lassen** | Woche 2 | Anwalt mit DSGVO-Fokus, ca. $800$–$1{.}500\,€$ |
| **AGB / ToS / Datenschutzerklärung** | Woche 2 | Vom selben Anwalt, Bundle-Preis verhandeln |
| **TOMs dokumentieren** | Woche 2 | Technisch habt ihr alles – nur noch verschriftlichen |
| **VVT (Art. 30) erstellen** | Woche 2 | Vorlage z.B. von bayLDA nutzen |
| **DSFA (Jugendliche-Daten)** | Woche 2 | Muster der DSK nutzen, anwaltlich gegenchecken |

**Budget-Schätzung Phase 0 Recht:** $3{.}000$–$5{.}000\,€$

</details>

### Woche 2–3: Infrastruktur Production-Ready

<details open>
<summary><b>Supabase & Hosting Setup</b></summary>

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare (DDoS + CDN)               │
│                    *.checkmate-manager.de                 │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │       Hosting-Platform  │
              │    (Vercel / Hetzner /  │
              │     Coolify / Docker)   │
              │  ┌──────────────────┐   │
              │  │ Next.js App Node │   │
              │  │ (DSGVO-konform)  │   │
              │  └──────────┬───────┘   │
              └─────────────┼───────────┘
                            │
              ┌─────────────▼─────────────┐
              │      Supabase (Cloud)      │
              │  ┌──────────┐  ┌────────┐  │
              │  │ Postgres  │  │ Auth   │  │
              │  │ (Neon/DB) │  │ (JWT)  │  │
              │  └──────────┘  └────────┘  │
              │  ┌──────────┐  ┌────────┐  │
              │  │ Storage   │  │ Real-  │  │
              │  │ (S3/OSS)  │  │ time   │  │
              │  └──────────┘  └────────┘  │
              └───────────────────────────┘
                          │
              ┌───────────▼──────────┐
              │  Supabase Backups    │
              │  (Point-in-Time)     │
              └──────────────────────┘
```

**Konkrete Schritte:**

```bash
# 1. Supabase Projekt anlegen (Region: Frankfurt/EU)
# 2. Datenbank-Schema migrieren (npm run db:push)
# 3. Auth-Provider konfigurieren (E-Mail, Google)
# 4. Storage Buckets für Vereinslogos/Dokumente anlegen
# 5. App-Hosting (z.B. Vercel oder Hetzner Docker)
# 6. Caddy/Nginx für On-Demand-TLS bei Custom-Domains
# 7. Monitoring integrieren (Sentry + Supabase Dashboard)
```

</details>

<details>
<summary><b>Monitoring-Stack (Tag 1 aktivieren!)</b></summary>

```yaml
# Überwachung über Cloud-Provider & Sentry
services:
  sentry:
    # Error-Tracking für Frontend & Backend
    # EU-hosted (sentry.io mit DPA)
    
  supabase_dashboard:
    # Überwachung von DB-Performance & API-Requests
    
  uptime_kuma:
    # Einfaches Status-Monitoring (z.B. auf kleiner Hetzner VM)
    image: louislam/uptime-kuma:latest
    ports: ["3002:3001"]
    
  matomo:
    # Self-hosted Analytics (DSGVO-konform)
    image: matomo:latest
```

**Alerts einrichten für:**
- 🔴 5xx-Rate > 1% → Sofort PagerDuty/Telegram
- 🔴 DB-Storage > 80% → Warnung
- 🔴 Auth-Errors > 5/Min → Warnung
- 🔴 SSL-Zertifikat < 14 Tage → Sofort
- 🟠 LCP > 2.5s → Daily Digest

</details>

### Woche 3–4: Security-Härtung & Deployment-Pipeline

<details>
<summary><b>CI/CD Pipeline finalisieren</b></summary>

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches: [main]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run test -- --coverage
        env:
          MIN_COVERAGE: 80
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - run: npx @axe-core/cli --exit  # BFSG-Check!
      - run: npx @lhci/cli autorun     # Lighthouse CI
      
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: returntocorp/semgrep-action@v1
      - run: npm audit --audit-level=high
      - uses: github/codeql-action/analyze@v3
      
  deploy-staging:
    needs: [quality, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Build & Push Docker Image
        run: |
          docker build -t ghcr.io/your-org/chess-app:${{ github.sha }} .
          docker push ghcr.io/your-org/chess-app:${{ github.sha }}
      - name: Deploy to Staging
        run: ./scripts/deploy.sh staging ${{ github.sha }}
      - name: Smoke Tests
        run: ./scripts/smoke-test.sh https://staging.checkmate-manager.de

  deploy-production:
    needs: [deploy-staging]
    if: github.ref == 'refs/heads/main'
    environment: production  # Manual Approval Gate!
    runs-on: ubuntu-latest
    steps:
      - name: Rolling Deploy
        run: ./scripts/deploy.sh production ${{ github.sha }}
```

</details>

<details>
<summary><b>Security Pre-Launch Audit</b></summary>

```bash
# ZAP Baseline Scan (automatisiert)
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://staging.checkmate-manager.de \
  -r zap-report.html

# Secrets-Check (pre-commit)
pip install detect-secrets
detect-secrets scan --all-files

# SSL-Test
docker run --rm -it nmap -sV --script ssl-enum-ciphers -p 443 checkmate-manager.de

# Header-Check
curl -s -D- https://checkmate-manager.de | grep -i 'strict\|content-security\|x-frame\|x-content'
```

**Erwartete Header-Antwort:**
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-xxx'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

</details>

### Woche 4: E-Mail & Domain

<details>
<summary><b>E-Mail-Infrastruktur</b></summary>

```
Transaktionale E-Mails          Newsletter
(Postmark / MailerSend)         (Brevo / separater Provider)
         │                              │
         ▼                              ▼
   noreply@checkmate-manager.de   news@checkmate-manager.de
   (Verifizierung, Einladungen)   (Vereins-Newsletter)
         │                              │
    Separate IP                    Separate IP
    Warm-up: 2 Wochen             Warm-up: 4 Wochen
```

**DNS-Records:**
```dns
; SPF
@    TXT  "v=spf1 include:_spf.postmarkapp.com include:brevo.com ~all"

; DKIM
pm._domainkey  CNAME  ...postmarkapp.com
brevo._domainkey  TXT  ...

; DMARC
_dmarc  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@checkmate-manager.de"

; Wildcard für Vereinsseiten
*.checkmate-manager.de  A  <LB-IP>
```

**Warm-up-Plan (Postmark):**

| Tag | E-Mails/Tag | Zielgruppe |
|-----|-------------|------------|
| 1–3 | 50 | Eigene Test-Adressen |
| 4–7 | 200 | Pilotverein-Vorstand |
| 8–14 | 500 | Pilotverein-Mitglieder |
| 15+ | Unbegrenzt | Alle Vereine |

</details>

---

## 🟢 Phase 1: Soft-Launch mit Pilotverein (Wochen 5–8)

> **Ziel:** Ein realer Verein nutzt das System im Alltagsbetrieb. Ihr sammelt Feedback, testet Prozesse und baut Vertrauen auf.

### Den richtigen Pilotverein finden

<details open>
<summary><b>Ideales Profil & Akquise-Strategie</b></summary>

**Idealer Pilotverein:**
- $50$–$150$ Mitglieder (groß genug für reale Daten, klein genug für persönlichen Kontakt)
- Aktiver Spielbetrieb (Mannschaften + Vereinsturniere)
- Technikaffiner Vorstand (mindestens 1 Person)
- Jugendabteilung vorhanden (testet DSGVO-Jugendschutz)
- Aktuell unzufrieden mit Excel / ChessBase / gar keiner Software

**Wo findet ihr diesen Verein?**

```
1. PERSÖNLICHES NETZWERK (beste Conversion!)
   └─ Seid ihr selbst in einem Verein? → Fragt euren Vorstand
   └─ Kennt ihr jemanden? → Warme Intro

2. SCHACH-COMMUNITY ONLINE
   ├─ lichess.org/forum → Diskussionen über Vereinssoftware
   ├─ chess.com/forums → Deutsche Community
   ├─ Reddit r/schach → Klein aber aktiv
   └─ Schachbund-Foren der Landesverbände

3. DIREKTE ANSPRACHE (kalt)
   ├─ Landesschachverbände (DSB, Landesverbände)
   │   → Viele haben Mailinglisten für Vereinsvorsitzende
   ├─ Vereins-Websites durchsuchen
   │   → schachbund.de/vereine → Filtert nach Region
   └─ Regionale Schachturniere besuchen (offline!)
```

**Pilotverein-Vertrag (Kernpunkte):**

```
PILOT-VEREINBARUNG

Laufzeit:        12 Monate ab Soft-Launch
Vergütung:       Kostenlos (0 €)
Gegenleistung:   
  - 2× monatlich 30-Minuten-Feedback-Call
  - Mindestens 1 Turnier über die Plattform
  - Mindestens 1 SEPA-Lauf über die Plattform
  - Testimonial für Website (bei Zufriedenheit)
  - Bug-Reports via dediziertem Kanal
Datenschutz:     AVV beigefügt
Kündigung:       Jederzeit, 30 Tage Frist
Datenexport:     Vollständiger Export bei Beendigung
```

</details>

### Onboarding-Prozess für den Pilotverein

<details>
<summary><b>Setup-Wizard & Migration</b></summary>

```
ONBOARDING-FLOW (Ziel: < 30 Minuten bis produktiv)

Schritt 1: Verein anlegen
├─ Vereinsname, Adresse, Logo
├─ Schachbund-Kennung (für DWZ-Import)
└─ Vereinswebsite-Subdomain wählen

Schritt 2: Rollen vergeben
├─ Vorstand einladen (E-Mail)
├─ Kassenwart → finance.sepa Berechtigung
└─ Sportwart → tournaments.results Berechtigung

Schritt 3: Mitglieder importieren
├─ CSV-Import (Vorlage bereitstellen!)
│   Spalten: Name, Email, Geburtsdatum, DWZ, 
│            Beitragsstufe, IBAN (optional)
├─ DWZ-Daten automatisch vom Schachbund ziehen
└─ DSGVO-Einwilligungen per E-Mail einholen

Schritt 4: Beitragsstufen konfigurieren
├─ Erwachsene:  €120/Jahr
├─ Jugend:      €60/Jahr
├─ Familie:     €200/Jahr
└─ Passiv:      €40/Jahr

Schritt 5: Erster Spielabend
├─ Event im Kalender anlegen
├─ Blitzturnier (Schweizer System) erstellen
└─ Ergebnisse eintragen → DWZ-Tracking live
```

**Datenmigration (was der Pilotverein typischerweise hat):**

| Quelle | Zielmodul | Aufwand |
|--------|-----------|---------|
| Excel-Mitgliederliste | Mitglieder-Import | CSV-Mapper bauen |
| DWZ-Datenbank (schachbund.de) | DWZ-History | API-Scraper oder TRF |
| Papier-Satzung (PDF) | Dokumente (MinIO) | Upload |
| Bankauszüge | Zahlungsstatus | Manuell |
| Alte Turnierergebnisse | Partiedatenbank | TRF-Import |

</details>

### KPIs für Phase 1

```
┌─────────────────────────────────────────────┐
│          SOFT-LAUNCH KPIs (Woche 5–8)       │
├─────────────────────────────────────────────┤
│ ✅ Pilotverein aktiv (≥3 Logins/Woche)      │
│ ✅ 1 Turnier erfolgreich durchgeführt        │
│ ✅ 1 SEPA-Lauf erfolgreich generiert         │
│ ✅ 0 Datenverluste                            │
│ ✅ Uptime > 99,5%                             │
│ ✅ E-Mail-Deliverability > 98%               │
│ ✅ < 5 kritische Bugs (alle gefixt)          │
│ ✅ NPS des Pilotvorstands > 20               │
│ ✅ Restore-Test erfolgreich wiederholt        │
└─────────────────────────────────────────────┘
```

---

## 🟢 Phase 2: Closed Beta (Wochen 9–12)

> **Ziel:** $5$ Vereine verschiedener Größen, Product-Market-Fit validieren, Skalierung testen.

### Vereine akquirieren

<details open>
<summary><b>Akquise-Kanäle (priorisiert nach Conversion)</b></summary>

**Kanal 1: Empfehlung durch Pilotverein (höchste Conversion)**
```
Pilotverein → Bezirksliga-Gegner → "Welche Software nutzt ihr?"
                                    → Natürliche Gesprächssituation!

Aktion: Pilotvorstand bitten, in der nächsten Bezirksversammlung 
        2 Minuten über die Software zu berichten.
```

**Kanal 2: Landesschachverbände**
```
Ziel: Als "empfohlene Software" auf Verbandsseiten gelistet werden.

Vorgehen:
1. Kontakt zum Geschäftsführer des Landesverbands
2. Demo anbieten (für Verbands-spezifische Anforderungen)
3. Rabatt für Verbands-Mitgliedsvereine (20%)
4. Technische Integration (DWZ-Schnittstelle, Ergebnismeldung)

Priorisierte Landesverbände:
- Bayerischer Schachbund (größter LV, ~25.000 Mitglieder)
- NRW Schachbund (~20.000)
- Hessischer Schachverband (~8.000)
```

**Kanal 3: Content-Marketing (SEO-Grundlage)**
```
Blog-Artikel (SEO-optimiert):
├─ "Schachverein gründen: Die komplette Anleitung 2026"
├─ "SEPA-Lastschrift im Verein: So funktioniert pain.008"
├─ "DWZ-Berechnung erklärt: Was Vereinsverantwortliche wissen müssen"
├─ "Turnierverwaltung Schweizer System: Software-Vergleich"
├─ "DSGVO im Schachverein: Checkliste für Vorstände"
└─ "Jugendarbeit im Schachverein digital organisieren"

Jeder Artikel endet mit: CTA → "Testen Sie [Produktname] kostenlos"
```

**Kanal 4: Schach-Events (offline!)**
```
Deutsche Schach-Einzelmeisterschaft (April/Mai)
Deutsche Mannschaftsmeisterschaft
Landesmeisterschaften

→ Infostand / Flyer am Spiellokal
→ QR-Code zur Live-Demo
→ "Ihr Verein in 30 Minuten digital" Workshop anbieten
```

</details>

### Verschiedene Vereinsprofile für die Beta

```
Verein A:  ~50 Mitglieder, 1 Mannschaft, kein Jugend       → Basis-Test
Verein B:  ~150 Mitglieder, 4 Mannschaften, Jugendabteilung → Voll-Test
Verein C:  ~300 Mitglieder, 8 Mannschaften                  → Skalierungs-Test
Verein D:  Neugründung, 15 Mitglieder                       → Onboarding-Test
Verein E:  ~100 Mitglieder, technisch wenig versiert         → UX-Test (Zielgruppe 55+!)
```

### Load-Test vor Beta-Eröffnung

<details>
<summary><b>Performance-Anforderungen & Testplan</b></summary>

```javascript
// k6 Load-Test Szenario: Turnier-Abend
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    // 100 Zuschauer verfolgen Live-Ergebnisse
    tournament_viewers: {
      executor: 'constant-vus',
      vus: 100,
      duration: '10m',
      exec: 'viewTournament',
    },
    // 20 Spieler geben Ergebnisse ein
    result_entry: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      exec: 'enterResult',
    },
    // 5 Admins verwalten gleichzeitig
    admin_work: {
      executor: 'constant-vus',
      vus: 5,
      duration: '10m',
      exec: 'adminDashboard',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};
```

**Performance-Ziele:**

| Metrik | Ziel | Messung |
|--------|------|---------|
| LCP (Largest Contentful Paint) | < $2{,}5\text{s}$ | Lighthouse CI |
| TTFB (Time to First Byte) | < $200\text{ms}$ | k6 |
| API Response (p95) | < $500\text{ms}$ | Prometheus |
| Turnier-Live-Update | < $1\text{s}$ | WebSocket/SSE |
| DB Query Time (p95) | < $50\text{ms}$ | pg_stat_statements |
| Concurrent Users | $200+$ | k6 |

</details>

### KPIs für Phase 2

```
┌─────────────────────────────────────────────┐
│          CLOSED BETA KPIs (Woche 9–12)      │
├─────────────────────────────────────────────┤
│ ✅ 5 Vereine aktiv (≥3 Logins/Woche/Verein) │
│ ✅ 3+ Turniere erfolgreich (verschiedene     │
│    Formate: Rundenturnier + Schweizer)       │
│ ✅ SEPA-Lauf bei ≥2 Vereinen                │
│ ✅ Load-Test 200 concurrent users bestanden  │
│ ✅ Uptime > 99,5%                            │
│ ✅ BFSG-Audit bestanden (Lighthouse ≥90)    │
│ ✅ E-Mail-Deliverability > 98%              │
│ ✅ 0 Security Incidents                      │
│ ✅ NPS > 30 (über alle Beta-Vereine)         │
│ ✅ Pentest-Report (ZAP Baseline = clean)     │
│ ✅ 1 simuliertes Incident + Recovery         │
│ ✅ Feature-Requests priorisiert (Top 5)      │
└─────────────────────────────────────────────┘
```

---

## 🟢 Phase 3: Public Launch (Wochen 13–16)

> **Ziel:** Zahlende Kunden, organisches Wachstum, Marke etablieren.

### Pricing-Strategie

<details open>
<summary><b>Preismodell</b></summary>

```
┌──────────────────────────────────────────────────────────────────┐
│                        PREISTABELLE                               │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│              │   STARTER    │    VEREIN    │       PRO          │
│              │   Kostenlos  │  €9,90/Monat │   €24,90/Monat    │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│ Mitglieder   │ bis 30       │ bis 200      │ Unbegrenzt         │
│ Mannschaften │ 1            │ 4            │ Unbegrenzt         │
│ Turniere     │ 3/Jahr       │ Unbegrenzt   │ Unbegrenzt         │
│ SEPA-Export  │ ❌           │ ✅           │ ✅                 │
│ Vereins-     │ Subdomain    │ Subdomain    │ Custom Domain      │
│   website    │              │              │ + White-Label       │
│ DWZ-Tracking │ ✅           │ ✅           │ ✅ + API-Zugriff   │
│ Dokumente    │ 100 MB       │ 2 GB         │ 10 GB              │
│ Support      │ Community    │ E-Mail       │ Priorität + Telefon│
│ Backup       │ Daily        │ Daily        │ Stündlich           │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│ Zielgruppe   │ Neugründung  │ Typischer    │ Großverein /       │
│              │ < 30 Mitgl.  │ Verein       │ Verband            │
└──────────────┴──────────────┴──────────────┴────────────────────┘

Jährliche Zahlung: 2 Monate gratis (€99/Jahr bzw. €249/Jahr)
```

**Warum dieses Modell funktioniert:**

1. **Starter (€0)** → Eliminiert jede Hemmschwelle, jeder Verein kann sofort starten
2. **Verein (€9,90)** → Positionierung unter €10 psychologisch wichtig; €120/Jahr ist für jeden Verein budget-fähig (weniger als 1 Mitgliedsbeitrag)
3. **Pro (€24,90)** → Custom-Domain + White-Label ist der klare Differentiator für größere Vereine

**Einnahme-Projektion (konservativ):**

| Zeitraum | Vereine (gesamt) | Davon zahlend | MRR |
|----------|------------------|---------------|-----|
| Monat 4 (Launch) | 10 | 3 | $\approx 45\,€$ |
| Monat 6 | 30 | 12 | $\approx 160\,€$ |
| Monat 12 | 100 | 45 | $\approx 650\,€$ |
| Monat 24 | 300 | 150 | $\approx 2{.}200\,€$ |
| Monat 36 | 700 | 350 | $\approx 5{.}500\,€$ |

**Marktgröße Deutschland:** $\approx 2{.}500$ Schachvereine im DSB. Bei $25\%$ Marktpenetration = $625$ Vereine.

</details>

### Marketing-Website & Launch-Kampagne

<details open>
<summary><b>Landing-Page-Struktur & SEO</b></summary>

**Seitenstruktur `checkmate-manager.de`:**

```
/                       → Hero + Feature-Übersicht + Social Proof
/funktionen             → Ausführliche Feature-Seiten
  /mitgliederverwaltung
  /turnierverwaltung
  /finanzen-sepa
  /mannschaftsbetrieb
  /vereinswebsite
/preise                 → Pricing-Tabelle + FAQ
/demo                   → Interaktiver Demo-Verein (Seed-Daten!)
/blog                   → SEO-Content (s. oben)
/docs                   → Wissensbasis / Tutorials
/ueber-uns              → Team, Vision, Open-Source-Philosophie
/datenschutz            → DSGVO
/impressum              → UG-Angaben
/agb                    → ToS
```

**Hero-Section (A/B-Test):**

```
Variante A:
"Ihr Schachverein. Digital. Einfach."
Mitgliederverwaltung, Turniere, SEPA-Lastschriften – 
alles in einer Software, die Schach versteht.
[Kostenlos starten] [Live-Demo ansehen]

Variante B:
"Schluss mit Excel-Listen und Zettelwirtschaft"
Die einzige Vereinssoftware, die DWZ, Schweizer System 
und SEPA-Lastschriften nativ versteht.
[Jetzt testen – dauerhaft kostenlos] [Demo-Verein erkunden]
```

**SEO-Strategie:**

| Keyword | Suchvolumen (DE) | Schwierigkeit | Zielseite |
|---------|-------------------|---------------|-----------|
| schachverein software | ~200/Monat | Niedrig | / |
| vereinsverwaltung schach | ~100/Monat | Niedrig | /funktionen |
| turnierverwaltung schach | ~150/Monat | Mittel | /turnierverwaltung |
| schweizer system turnier | ~300/Monat | Mittel | /blog/schweizer-system |
| sepa lastschrift verein | ~400/Monat | Mittel | /blog/sepa-verein |
| dwz berechnung | ~500/Monat | Mittel | /blog/dwz-erklaert |
| schachverein gründen | ~300/Monat | Niedrig | /blog/verein-gruenden |

**Content-Kalender (erste 8 Wochen):**

| Woche | Artikel | Kanal |
|-------|---------|-------|
| 1 | "Schachverein digital: 5 Probleme, die jeder Vorstand kennt" | Blog + LinkedIn |
| 2 | Video-Tutorial: "Verein in 10 Minuten einrichten" | YouTube + Docs |
| 3 | "SEPA-Lastschrift im Verein: Schritt-für-Schritt" | Blog + SEO |
| 4 | Case Study: Pilotverein | Blog + Social |
| 5 | "DWZ-Tracking automatisieren: So geht's" | Blog + SEO |
| 6 | Video: "Turnier mit Schweizer System durchführen" | YouTube |
| 7 | "DSGVO im Schachverein: Die Checkliste" | Blog + SEO |
| 8 | Vergleichsartikel: "ChessManager vs. Excel vs. [Produkt]" | Blog |

</details>

### Launch-Day Taktik

<details>
<summary><b>Launch-Kanäle & Timeline</b></summary>

```
LAUNCH-WOCHE (Woche 13)

Montag:
  ├─ Blog-Post: "Warum wir Schachverein-Software bauen"
  ├─ E-Mail an alle Beta-Vereine: "Wir sind live!"
  └─ LinkedIn-Post (persönliches Profil)

Dienstag (LAUNCH-TAG):
  ├─ 08:00 - ProductHunt Launch (englisch)
  ├─ 09:00 - Hacker News "Show HN" (technische Story)
  ├─ 10:00 - Reddit r/schach + r/chess + r/selfhosted
  ├─ 10:00 - lichess.org Forum-Post
  ├─ 11:00 - Twitter/X Thread (Buildinpublic)
  ├─ 12:00 - Press Release an Schachmedien:
  │   ├─ Schach-Magazin 64
  │   ├─ ChessBase News
  │   ├─ Rochade Europa
  │   └─ Schachbund.de Newsbereich
  └─ Ganztägig: Monitoring + schnelle Bug-Fixes

Mittwoch–Freitag:
  ├─ Auf alle Kommentare/Fragen antworten
  ├─ Individuelle Demo-Angebote an interessierte Vereine
  └─ Quick-Fixes deployen
  
Woche 14:
  ├─ Follow-Up E-Mail an neue Registrierungen
  ├─ Onboarding-Calls anbieten (kostenlos, 30 min)
  └─ Erste Feature-Requests sammeln + priorisieren
```

</details>

---

## 🟢 Phase 4: Wachstum & Skalierung (Wochen 17–20+)

<details open>
<summary><b>Wachstums-Hebel</b></summary>

### 1. Verbands-Partnerschaften (größter Hebel!)

```
STRATEGIE: Landesverbände als Multiplikatoren

DSB (Dachverband)
├─ Bayerischer Schachbund      → ~500 Vereine
├─ Schachbund NRW              → ~400 Vereine  
├─ Hessischer Schachverband    → ~250 Vereine
├─ Baden. Schachverband        → ~300 Vereine
└─ ...

Angebot an Verbände:
1. Kostenlose Verwaltung für den Verband selbst
2. 20% Rabatt für alle Mitgliedsvereine
3. Technische Integration (Ergebnismeldung an Verband)
4. DWZ-Schnittstelle / Automatische Meldung
5. White-Label-Option für den Verband

→ 1 Verbands-Deal = potenziell 100+ Vereine auf einmal
```

### 2. Produkt-gesteuertes Wachstum (PLG)

```
Virale Loops:
├─ Öffentliche Vereinsseiten → "Powered by [Produkt]" Footer
├─ Turnier-Ergebnis-Seiten (SEO!) → Teilnehmer finden euch
├─ SEPA-Exporte → Kassenwart erzählt es weiter
└─ Lichess-Integration → Verlinkung aus Lichess zurück

Referral-Programm:
├─ Verein empfiehlt Verein → 1 Monat gratis für beide
└─ Tracking via Referral-Code im Dashboard
```

### 3. Ökosystem-Integrationen

```
Phase 4 Roadmap:
├─ chess.com API-Integration (neben Lichess)
├─ DSB/DWZ-Schnittstelle (offiziell)
├─ FIDE-Rating-Import
├─ Vereinsregister-Anbindung (eVR)
├─ Buchhaltungs-Export (DATEV, lexoffice)
├─ Mobile App (PWA first, dann native)
└─ Öffentliche API für Drittanbieter
```

</details>

---

## 📊 Erfolgsmessung: North Star Metrics

<details open>
<summary><b>KPI-Dashboard</b></summary>

```
PRIMARY METRIC:
  Wöchentlich aktive Vereine (WAC)
  = Vereine mit ≥3 Logins in der letzten Woche

SECONDARY METRICS:
  ┌───────────────────────────────────────────┐
  │ Akquise                                   │
  │ ├─ Neue Registrierungen / Woche           │
  │ ├─ Conversion: Registrierung → Setup      │
  │ └─ Conversion: Free → Paid                │
  │                                           │
  │ Aktivierung                               │
  │ ├─ Time-to-First-Value (Minuten bis       │
  │ │   erster Mitglieder-Import)             │
  │ ├─ % Vereine mit ≥1 Turnier              │
  │ └─ % Vereine mit ≥1 SEPA-Lauf            │
  │                                           │
  │ Retention                                 │
  │ ├─ 30-Tage-Retention (Verein-Level)       │
  │ ├─ 90-Tage-Retention                      │
  │ └─ Churn-Rate (monatlich)                 │
  │                                           │
  │ Revenue                                   │
  │ ├─ MRR (Monthly Recurring Revenue)        │
  │ ├─ ARPU (Avg Revenue Per Club)            │
  │ └─ LTV (Lifetime Value)                   │
  │                                           │
  │ Zufriedenheit                             │
  │ ├─ NPS (quartalsweise Survey)             │
  │ ├─ Support-Ticket-Volumen                 │
  │ └─ Feature-Request Voting                 │
  └───────────────────────────────────────────┘
```

</details>

---

## ⚠️ Risiken & Mitigationen

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|:------------------:|:------:|------------|
| **DSB/Verbände bauen eigene Software** | Niedrig | Hoch | Frühzeitig Partnerschaften, Integration statt Konkurrenz |
| **ChessBase launcht Vereinsmodul** | Mittel | Hoch | Schneller sein, Nische besetzen, bessere UX |
| **Datenverlust/Breach** | Niedrig | Kritisch | Backups, Monitoring, Cyberversicherung |
| **Langsame Adoption (Vereinsvorstände = konservativ)** | Hoch | Mittel | Kostenloser Starter-Plan, persönliches Onboarding, Video-Tutorials |
| **Feature-Creep / zu viel gleichzeitig** | Hoch | Mittel | Strikte MVP-Mentalität, Feedback-Priorisierung |
| **Schlüsselperson-Risiko** | Mittel | Hoch | Dokumentation, Runbooks, ggf. Co-Founder |
| **Saisonale Schwankungen** (Sommer = wenig Schach) | Hoch | Niedrig | Launch im September/Oktober (Saisonbeginn!) |

### 🗓️ Timing-Empfehlung

> **Idealer Launch-Zeitpunkt: September/Oktober 2026**
> 
> Die Schachsaison beginnt im September. Vereine planen dann neue Mannschaften, Turniere und Beiträge. Das ist der Moment, in dem sie am ehesten neue Software evaluieren.
> 
> **Rückwärts gerechnet:**
> - Phase 0 starten: **Mai 2026**
> - Soft-Launch: **Juni 2026** 
> - Closed Beta: **Juli/August 2026** (Sommerpause für Stabilisierung nutzen!)
> - Public Launch: **September 2026** (Saisonbeginn = maximale Aufmerksamkeit)

---

## ✅ Sofort-Aktionen (Diese Woche)

```
┌─ HEUTE ─────────────────────────────────────────────────┐
│                                                          │
│  1. □ Notar-Termin für UG-Gründung buchen               │
│  2. □ DSGVO-Anwalt kontaktieren (AVV + AGB)             │
│  3. □ Domain sichern (.de + .com + .eu)                  │
│  4. □ Hetzner-Projekt anlegen + erste Server bestellen   │
│  5. □ Postmark/MailerSend Account erstellen              │
│                                                          │
├─ DIESE WOCHE ───────────────────────────────────────────┤
│                                                          │
│  6. □ Pilotverein ansprechen (persönliches Netzwerk!)    │
│  7. □ Monitoring-Stack aufsetzen (Sentry + Uptime Kuma)  │
│  8. □ Backup-Automation + erster Restore-Test            │
│  9. □ CI/CD-Pipeline vervollständigen                    │
│ 10. □ Demo-Verein mit Seed-Daten erstellen               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

**Die technische Grundlage ist solide gebaut. Jetzt geht es darum, aus dem Projekt ein Produkt und aus dem Produkt ein Business zu machen. Der wichtigste Schritt ist der erste: einen echten Verein damit arbeiten lassen. Alles andere folgt daraus.**