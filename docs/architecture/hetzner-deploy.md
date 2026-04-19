# 🏗️ Technische Architektur: All-Hetzner (Docker Compose)

Diese Architektur nutzt einen dedizierten Server (z. B. Hetzner Cloud) für alle Dienste. Dies löst die im ursprünglichen Konzept identifizierten Blindspots (Serverless-Timeouts auf Vercel, DGT-WebSockets, bbpPairings in Docker, DSGVO-Bedenken bei US-Clouds).

## Komponenten im "All-Hetzner" Setup

| Komponente | Technologie | Aufgabe |
|------------|-------------|---------|
| **Frontend & API** | Next.js (Node.js) | Server-Side Rendering, API-Routen, UI |
| **Worker** | BullMQ (Node.js) | Hintergrundaufgaben (E-Mails, Metadaten-Parsing, Auslosungen) |
| **Datenbank** | PostgreSQL | Persistente Speicherung (Mitglieder, Turniere) |
| **Cache & Queue** | Redis | Caching, Rate-Limiting, BullMQ-Warteschlange |
| **Objektspeicher** | MinIO | DSGVO-konforme Speicherung von PDFs, Protokollen, Bildern (S3-API) |
| **Turnier-Engine** | bbpPairings | FIDE-konforme Schweizer-System Auslosungen via TRF |
| **Reverse Proxy** | Caddy | SSL (Let's Encrypt), Routing zu Next.js |

## Vorteile

1. **Keine Serverless-Timeouts:** Bei großen Turnieren dauert die Berechnung oder der Import oft länger als 10–60 Sekunden. Auf einem eigenen Server gibt es diese Limits nicht.
2. **Datenschutz (DSGVO):** Alles läuft in einem deutschen Rechenzentrum. Keine Datenübermittlung in die USA (wie bei Vercel, Supabase oder Neon üblich).
3. **Persistente Verbindungen:** Zukünftige Features wie DGT-Live-Boards benötigen dauerhafte WebSocket-Verbindungen.
4. **Kostenkontrolle:** Fixer monatlicher Betrag (z.B. ~9 € für CPX21), keine versteckten Egress- oder Compute-Kosten.

## Deployment-Ablauf

Die gesamte Infrastruktur wird per `docker-compose.yml` orchestriert. Details siehe [HETZNER_DEPLOYMENT.md](../../HETZNER_DEPLOYMENT.md).
