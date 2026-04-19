# Deployment Übersicht

Die Schachvereins-Plattform ist als "All-Hetzner" Lösung konzipiert. Dies stellt sicher, dass alle DSGVO-Anforderungen erfüllt werden und dass technische Limits (wie Serverless Timeouts bei langen Importen oder Auslosungen) umgangen werden.

## Bevorzugte Methode: Docker Compose (Hetzner)

Die gesamte Infrastruktur (Next.js, PostgreSQL, Redis, MinIO, Background Worker und bbpPairings) ist in Docker containerisiert. 

Für das Deployment in Produktion nutzt du das bereitgestellte `docker-compose.yml` File. 

Eine Schritt-für-Schritt-Anleitung findest du unter:
👉 **[Hetzner Deployment Guide](../../HETZNER_DEPLOYMENT.md)**

## Bestandteile des Deployments

1. **App Container:** Führt die Next.js Webanwendung aus (`output: "standalone"`).
2. **Worker Container:** Führt die BullMQ Background Jobs aus (E-Mail, DWZ Sync, Metadaten-Parsing).
3. **Datenbank:** PostgreSQL 17.
4. **Cache/Queue:** Redis 7.
5. **Storage:** MinIO für Bilder, Dokumente und Protokolle.
6. **Reverse Proxy:** Caddy Server, der sich automatisch um SSL (Let's Encrypt) kümmert und HTTPS-Traffic auf Port 3000 weiterleitet.
