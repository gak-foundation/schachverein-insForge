# Deployment Übersicht

Die Schachvereins-Plattform nutzt eine moderne, vereinfachte Architektur basierend auf Next.js und Supabase Cloud. Dies reduziert den Wartungsaufwand für die Infrastruktur erheblich und ermöglicht volle DSGVO-Konformität durch EU-Regionen.

## Infrastruktur-Komponenten

Das System ist so konzipiert, dass es entweder vollständig in der Cloud (Vercel/Supabase) oder als hybride Lösung (App auf Hetzner, Daten in Supabase) betrieben werden kann.

### Bestandteile des Deployments

1. **App Node (Next.js):**
   - Führt die Webanwendung aus.
   - Kann auf Vercel, Hetzner (Docker) oder Coolify betrieben werden.
   - Nutze `output: "standalone"` für Docker-Deployments.

2. **Supabase (Backend-as-a-Service):**
   - **Datenbank:** PostgreSQL 17 (via Neon oder Supabase).
   - **Authentifizierung:** Supabase Auth (JWT-basiert).
   - **Storage:** Supabase Storage (S3-kompatibel) für Bilder und Dokumente.
   - **Realtime:** Supabase Realtime für Live-Turnierergebnisse.

3. **Background Tasks:**
   - Ersetzt BullMQ durch einfache asynchrone Funktionen oder Edge Functions.
   - Langlaufende Prozesse (z.B. DWZ-Sync) laufen als API-Endpunkte oder Hintergrund-Jobs in der App.

4. **Monitoring & Security:**
   - **Sentry:** Error-Tracking.
   - **Cloudflare:** DDoS-Schutz und Caching vor der Hauptdomain.
   - **Caddy:** Reverse Proxy für On-Demand-TLS bei Custom-Domains der Vereine.

## Deployment-Guide

Eine detaillierte Anleitung für das Setup auf Hetzner (falls gewünscht) findest du unter:
👉 **[Hetzner Deployment Guide](../../HETZNER_DEPLOYMENT.md)**
