# 🚀 Technische Voraussetzungen für den Launch

Basierend auf eurer Architektur (All-Hetzner, Next.js 16, Postgres 17, Multi-Tenant SaaS mit öffentlichen Vereinswebsites) hier die konsolidierte Launch-Checkliste — gegliedert nach Kritikalität.

---

## 🔴 1. Infrastruktur & Hosting (Must-have)

<details open>
<summary><b>Server-Setup Hetzner</b></summary>

| Komponente | Empfehlung | Begründung |
|------------|-----------|------------|
| **App-Server** | 2× Hetzner CX42 (8 vCPU, 16 GB RAM) DE | Redundanz, Rolling Deploys möglich |
| **DB-Server** | Dedicated PX-Line oder Managed Postgres | Keine Shared-CPU für Primary-DB |
| **Redis** | Separate VM oder Container (min. 4 GB) | BullMQ + Cache trennen vom App-State |
| **MinIO/S3** | Hetzner Object Storage (S3-kompatibel) | Günstiger als eigener MinIO-Cluster |
| **Backup-Server** | Hetzner Storage Box (1 TB) | Off-Site, verschlüsselt |
| **Load Balancer** | Hetzner Load Balancer | SSL-Terminierung optional |
| **DDoS** | Cloudflare (Free-Tier reicht initial) | Pflicht bei öffentlichen Vereinssites (Turnierpeaks!) |

**Standort zwingend:** Nürnberg oder Falkenstein (DE) — DSGVO & Auftragsverarbeitung.

</details>

<details>
<summary><b>Container-Orchestrierung</b></summary>

- **Docker Compose** für den Start ausreichend (eure Entscheidung richtig — Kubernetes wäre Over-Engineering)
- **Watchtower** oder **systemd-Units** für kontrollierte Restarts
- **Caddy** als Reverse Proxy mit automatischem Let's Encrypt + On-Demand-TLS für Custom-Domains der Vereine
- **Healthchecks** in jedem Container (`/api/health`-Endpoint mit DB + Redis + S3-Check)

</details>

---

## 🔴 2. DSGVO, Recht & Compliance

Das ist bei einer SaaS mit personenbeziehbaren Daten (DWZ, Mitglieder, Jugendliche!) **launch-kritisch**.

| Dokument / Maßnahme | Pflicht? | Status-Check |
|---------------------|:--------:|--------------|
| **Impressum** für euer SaaS-Produkt | 🔴 | eigene Firma/UG nötig |
| **Datenschutzerklärung** (eure SaaS-Seite) | 🔴 | anwaltlich geprüft |
| **AVV (Auftragsverarbeitungsvertrag)** mit jedem Verein | 🔴 | Muster vorbereiten |
| **AVV mit Hetzner** | 🔴 | online abschließbar |
| **AVV mit Cloudflare** | 🔴 | EU-Data-Boundary prüfen |
| **Verzeichnis von Verarbeitungstätigkeiten (VVT)** nach Art. 30 | 🔴 | intern |
| **TOMs (Technisch-organisatorische Maßnahmen)** dokumentieren | 🔴 | pro Verein vorzeigbar |
| **Datenschutz-Folgenabschätzung (DSFA)** | 🔴 | wegen Jugendlicher-Daten! |
| **DSB (Datenschutzbeauftragter)** | 🟠 | ab 20 MA Pflicht, bei sensiblen Daten früher sinnvoll |
| **BFSG-Konformität** (WCAG 2.2 AA) | 🔴 | seit 28.06.2025 Pflicht für B2C-Formulare |
| **ToS / AGB / Nutzungsbedingungen** | 🔴 | Haftung, Kündigung, SLA |
| **Cookie-Banner (TTDSG-konform)** | 🔴 | keine Pre-Checks! |
| **DSA-Meldefunktion** | 🟠 | Notice-and-Take-Down-Workflow |

**Rechtliche Form:** UG/GmbH dringend empfohlen — als Einzelperson haftet ihr persönlich für DSGVO-Bußgelder bei Kundenvereinen.

---

## 🔴 3. Sicherheit (Pre-Launch Pflicht)

<details open>
<summary><b>Sicherheits-Checkliste</b></summary>

- ✅ **Secrets-Management**: `.env` niemals in Git — nutzt **Doppler**, **Infisical** or **HashiCorp Vault**
- ✅ **SSH-Hardening**: Key-only, Fail2Ban, Port-Änderung, Root-Login deaktiviert
- ✅ **Firewall**: Hetzner Cloud Firewall + UFW als Defense-in-Depth
- ✅ **Automatische Security-Updates**: `unattended-upgrades` auf allen VMs
- ✅ **Datenbank**: Nur via Private Network erreichbar, niemals Public
- ✅ **AES-256-GCM Schlüssel-Rotation** dokumentiert (IBAN-Encryption)
- ✅ **Backup-Verschlüsselung** (pg_dump | gpg | upload)
- ✅ **Restore-Test** mindestens 1× durchgeführt und dokumentiert (kein Backup ohne Restore-Test!)
- ✅ **Dependency Scanning**: Renovate/Dependabot + `npm audit` in CI
- ✅ **SAST**: Semgrep oder GitHub CodeQL in CI
- ✅ **DAST / Penetration-Test**: Mindestens ZAP-Baseline-Scan, bei ≥ 3 Pilotvereinen Pentest
- ✅ **Rate-Limiting** auch auf Anmelde-Endpunkten der öffentlichen Websites (Turnier-Spam-Schutz!)
- ✅ **CSP ohne `unsafe-inline`** (Next.js Nonce-basiert)
- ✅ **SSRF-Schutz** bei Lichess-API-Aufrufen

</details>

---

## 🔴 4. Monitoring & Observability

Ohne funktionierendes Monitoring ist ein Launch fahrlässig — insbesondere bei Live-Turnier-Tickern.

| Tool | Zweck | Alternative |
|------|-------|-------------|
| **Sentry** (self-hosted oder Cloud-EU) | Error-Tracking Frontend + Backend | GlitchTip (OSS) |
| **Grafana + Prometheus** | Metriken (CPU, DB-Queries, Queue-Länge) | Netdata |
| **Loki** oder **Better Stack** | Log-Aggregation (DSGVO-konform EU!) | Graylog |
| **Uptime Kuma** | Uptime-Monitoring pro Vereinsdomain | StatusCake |
| **Matomo** (self-hosted) | Produkt-Analytics statt GA4 | Plausible (EU) |
| **BullMQ Board** | Queue-Monitoring | — |

**Alerts zwingend konfigurieren für:**
- DB-Connection-Pool voll
- Redis-Memory > 80 %
- Queue-Länge > 1000
- 5xx-Rate > 1 %
- SSL-Zertifikat läuft in < 14 Tagen ab (kritisch bei Custom-Domains!)
- Backup-Job failed

---

## 🔴 5. CI/CD & Deployment-Readiness

<details open>
<summary><b>GitHub Actions Pipeline</b></summary>

```
Pull Request:
├─ Lint (ESLint + Prettier)
├─ TypeCheck (tsc --noEmit)
├─ Unit-Tests (Vitest, ≥80% Coverage)
├─ Integration-Tests (Testcontainers für DB)
├─ E2E-Tests (Playwright, Headless)
├─ Axe-core A11y-Check (BFSG!)
├─ Lighthouse CI (LCP < 2.5s)
├─ Semgrep Security-Scan
└─ Build (Next.js Production)

Main Branch:
├─ Alles oben +
├─ Docker-Image Build & Push (GHCR)
├─ Staging-Deploy (automatisch)
├─ Smoke-Tests gegen Staging
└─ Production-Deploy (Manual Approval)
```

**Rolling Deployment** zwingend — kein Downtime-Deploy akzeptabel, wenn mittendrin ein Turnier-Ergebnis eingegeben wird.

</details>

---

## 🟠 6. Domain, E-Mail & DNS

| Punkt | Details |
|-------|---------|
| **Hauptdomain** | z. B. `checkmate-manager.de` (+ `.com`, `.eu` sichern) |
| **App-Subdomain** | `app.checkmate-manager.de` |
| **Vereins-Subdomains** | `*.checkmate-manager.de` (Wildcard-SSL) |
| **Custom Domains** | Caddy + On-Demand-TLS, DNS-Verifikation-Flow |
| **Transaktionale E-Mails** | **Postmark** oder **MailerSend** (EU) — **nicht** eigener SMTP! Reputation! |
| **SPF / DKIM / DMARC** | Zwingend konfiguriert, DMARC mit `p=quarantine` |
| **Bounce-Handling** | Webhook zu BullMQ → Mitgliederstatus markieren |
| **Newsletter-Versand** | Separate IP / separater Provider (Brevo), nicht über Transaktions-IP |

**E-Mail-Deliverability** ist der Punkt, an dem viele SaaS scheitern. Plant **2 Wochen Warm-up** der Sending-IPs ein.

---

## 🟠 7. Operations-Prozesse

<details>
<summary><b>Runbooks, die vor Launch existieren müssen</b></summary>

1. **Deployment-Rollback** (wie stelle ich in < 5 min den Vorzustand her?)
2. **Datenbank-Restore** aus Backup (getestet!)
3. **Incident-Response** (wer wird wann alarmiert?)
4. **Data-Subject-Request** (DSGVO Art. 15/17) — Workflow von Anfrage bis Umsetzung
5. **Verein-Offboarding** (Datenexport + Löschung)
6. **Security-Incident** (wann meldet ihr an LfDI binnen 72 h?)
7. **Domain-Ausfall** (DNS, SSL-Erneuerung failed)
8. **Payment-Dispute** (Chargeback, Rücklastschrift)

</details>

<details>
<summary><b>SLA & Verfügbarkeit</b></summary>

- **Zielverfügbarkeit** definieren: 99,5 % (≈ 3,6 h Downtime/Monat) ist für euer Preissegment realistisch
- **Status-Page** (Instatus, statuspage.io oder eigene)
- **Wartungsfenster-Kommunikation** (z. B. Dienstag 03–05 Uhr, nie Freitag!)
- **Erreichbarkeit**: Mindestens Werktage 9–17 Uhr E-Mail-Support, Notfall-Hotline für Pro-Tarif

</details>

---

## 🟠 8. Business- & Launch-Readiness

| Punkt | Status-Check |
|-------|--------------|
| **Rechtsform** (UG/GmbH) gegründet | 🔴 |
| **Geschäftskonto** | 🔴 |
| **Steuerberater** für USt-Voranmeldung | 🔴 |
| **Stripe / Mollie** Konto verifiziert | 🔴 |
| **Rechnungsstellung** (sevDesk / lexoffice) automatisiert | 🔴 |
| **Haftpflichtversicherung** (IT-Berufshaftpflicht + Cyberversicherung) | 🔴 |
| **Preistabelle & Checkout** live | 🔴 |
| **Support-Kanal** (Crisp, HelpScout, Freshdesk) | 🔴 |
| **Onboarding-Flow** für neue Vereine (Setup-Wizard) | 🔴 |
| **Pilotverein-Vertrag** (unentgeltlich, 12 Monate, Feedback-Pflicht) | 🟠 |
| **Marketing-Website** + SEO-Content | 🟠 |
| **Demo-Verein** mit Seed-Daten | 🔴 |
| **Dokumentation / Wissensbasis** | 🟠 |
| **Video-Tutorials** (für Zielgruppe 55+!) | 🟠 |

---

## 🎯 9. Launch-Staffelung (Empfehlung)

```
Soft-Launch  ─▶ Closed Beta ─▶ Public Launch
  (1 Verein)     (5 Vereine)     (offen)
   Woche 0        Woche 4        Woche 12
```

<details open>
<summary><b>Gating-Kriterien pro Phase</b></summary>

**Soft-Launch (1 Pilotverein):**
- Alle 🔴 Punkte oben erfüllt
- Daily Backup + erfolgreicher Restore-Test
- Sentry + Uptime-Monitoring live
- DSGVO-Dokumente + AVV unterschrieben

**Closed Beta (5 Vereine):**
- Load-Test bestanden (100 gleichzeitige Turnier-Viewer)
- BFSG-Audit (Lighthouse + manueller Screen-Reader-Test)
- E-Mail-Deliverability > 98 %
- Mindestens 1 erfolgreich durchgeführtes Turnier end-to-end
- 1 simuliertes Incident + Recovery dokumentiert

**Public Launch:**
- Pentest-Report vorliegend
- NPS der Beta-Vereine > 30
- Zahlungsabwicklung (Stripe) live getestet
- Support-SLA schriftlich fixiert

</details>

---

## ⚡ TL;DR — Die 10 absoluten Blocker

1. 🔴 **UG/GmbH gegründet** (persönliche Haftung vermeiden)
2. 🔴 **AVV-Muster + TOMs** dokumentiert
3. 🔴 **Backup + Restore getestet** (nicht nur konfiguriert!)
4. 🔴 **Monitoring & Alerting** (Sentry + Uptime + Logs)
5. 🔴 **E-Mail-Deliverability** (Postmark/MailerSend, SPF/DKIM/DMARC)
6. 🔴 **BFSG / WCAG 2.2 AA** auf öffentlichen Seiten (axe-core in CI)
7. 🔴 **SSL-Automatisierung** inkl. Custom-Domains (Caddy on-demand)
8. 🔴 **Rate-Limiting + DDoS-Schutz** (Cloudflare davor)
9. 🔴 **Cyber-Versicherung + Haftpflicht**
10. 🔴 **Pilotverein-Vertrag + Feedback-Loop** — nie blind launchen
