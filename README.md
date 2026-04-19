# CheckMate Manager

Eine ganzheitliche, digitale SaaS-Plattform für Schachvereine. Vereint Mitgliederverwaltung, Finanzwesen, Turnierleitung, Mannschaftsbetrieb und Trainings-Tools in einem sicheren, modernen System.

## Features

- 👤 **Rollenbasierte Mitgliederverwaltung** (RBAC)
- 💶 **Finanzwesen** (SEPA-Lastschriften, Beitragsberechnung)
- ♟️ **Turnierverwaltung** (Schweizer System, DWZ/Elo, TRF-Export)
- 🛡️ **DSGVO-Konformität** (Einwilligungen, Lösch-Workflows)
- 📱 **Progressive Web App (PWA)** für den Einsatz am Spieltag (Offline-fähig)
- 📈 **API-Integrationen** (Lichess, DeWIS, FIDE)

## Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Database**: PostgreSQL (via Drizzle ORM)
- **Authentication**: Better Auth (Passkey, E-Mail/Passwort, OAuth)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Background Jobs**: BullMQ + Redis
- **Containerization**: Docker & Docker Compose

## Lokale Entwicklung

1. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen einrichten**
   ```bash
   cp .env.example .env
   # Fülle .env mit lokalen Werten
   ```

3. **Lokale Infrastruktur (Datenbank, Redis, MinIO) starten**
   ```bash
   npm run docker:up
   ```

4. **Datenbank-Schema anwenden & Seed**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

Die App ist unter `http://localhost:3000` erreichbar.

## Deployment (All-Hetzner Docker)

Das System ist primär für ein DSGVO-konformes Docker-Deployment (z.B. auf einem Hetzner Cloud Server) konzipiert. Dies verhindert Timeout-Probleme von Serverless-Anbietern (Vercel) und erlaubt persistente Worker für PGN-Verarbeitung, E-Mail-Versand und Auslosungen.

### Voraussetzungen

- Server (z.B. Hetzner CPX21 oder CX32)
- Docker & Docker Compose installiert
- Domain mit DNS-Records (`A`-Record) zum Server

### Setup

Alle Details für das Deployment auf Hetzner findest du im entsprechenden [Hetzner Deployment Guide](HETZNER_DEPLOYMENT.md).

## Lizenz

Dieses Projekt ist lizenziert unter der [MIT License](LICENSE).
Integrierte Engine (Stockfish.js) steht unter GPL-3, die Paarungs-Engine (bbpPairings) unter Apache 2.0.
