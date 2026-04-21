# 🏗️ Technische Architektur: Hetzner + Supabase Hybrid

Diese Architektur nutzt einen dedizierten Server (z. B. Hetzner Cloud) für die Next.js Anwendung, während Datenbank, Authentifizierung und Storage über **Supabase (EU-Region)** verwaltet werden.

## Komponenten im Hybrid-Setup

| Komponente | Technologie | Aufgabe |
|------------|-------------|---------|
| **Frontend & API** | Next.js (Node.js) | Server-Side Rendering, API-Routen, UI |
| **Backend-as-a-Service** | Supabase | Auth, PostgreSQL Datenbank, S3 Storage (EU-Frankfurt) |
| **Turnier-Engine** | bbpPairings | FIDE-konforme Schweizer-System Auslosungen via TRF |
| **Reverse Proxy** | Caddy | SSL (Let's Encrypt), Routing zu Next.js |

## Vorteile

1. **Keine Serverless-Timeouts:** Bei großen Turnieren dauert die Berechnung oder der Import oft länger als 10–60 Sekunden. Auf einem eigenen Server gibt es diese Limits nicht.
2. **Vereinfachte Infrastruktur:** Durch den Wegfall von lokalem Redis, BullMQ und MinIO ist das System wesentlich wartungsärmer.
3. **Skalierbarkeit:** Supabase übernimmt das Management der Datenbank-Performance und Backups.
4. **DSGVO-Konformität:** Nutzung der Supabase EU-Region (Frankfurt) und Hosting der App in Deutschland.

## Deployment-Ablauf

Die Anwendung wird per `docker-compose.yml` auf dem Hetzner-Server gestartet. Details siehe [HETZNER_DEPLOYMENT.md](../../HETZNER_DEPLOYMENT.md).
