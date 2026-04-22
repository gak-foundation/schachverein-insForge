# schach.studio

Eine ganzheitliche, digitale SaaS-Plattform für Schachvereine. Vereint Mitgliederverwaltung, Finanzwesen, Turnierleitung, Mannschaftsbetrieb und Trainings-Tools in einem sicheren, modernen System.

## Features

- ♟️ **Turnierverwaltung** (Schweizer System via bbpPairings, echte DeWIS-Synchronisation, TRF-Export)
- 💶 **Finanzwesen** (Verschlüsselte SEPA-Daten, Beitragsberechnung)
- 🛡️ **DSGVO & Sicherheit** (Surgical Encryption: IBAN/BIC AES-256-GCM verschlüsselt, Einwilligungshistorie)
- ♿ **Barrierefreiheit (BFSG 2025)** (Optimiert für Zielgruppe 55+, OKLCH High-Contrast)
- 📱 **Progressive Web App (PWA)** für den Einsatz am Spieltag (Offline-fähig)
- 📈 **API-Integrationen** (Lichess, DeWIS, FIDE)

## Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Database**: PostgreSQL (via Drizzle ORM + Supabase/Neon)
- **Authentication**: Supabase Auth (JWT, E-Mail, OAuth)
- **Styling**: Tailwind CSS 4 (OKLCH Themes)
- **Storage**: Supabase Storage (S3-kompatibel)
- **Background Jobs**: Asynchrone Funktionen (vereinfacht, kein Redis nötig)
- **Security**: AES-256-GCM Encryption für Finanzdaten

## Lokale Entwicklung

1. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen einrichten**
   ```bash
   cp .env.example .env
   # Fülle .env mit Supabase-Werten
   ```

3. **Redis starten (Docker)** - nur wenn Background Jobs getestet werden
   ```bash
   npm run docker:up # Startet nur Redis für BullMQ
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

## Deployment

Das System ist primär für ein DSGVO-konformes Deployment auf **Supabase Cloud** und **Vercel** oder **Hetzner (Docker)** konzipiert. Durch die Nutzung von Supabase werden separate Redis- und MinIO-Instanzen überflüssig.


## Lizenz

Dieses Projekt ist lizenziert unter der [MIT License](LICENSE).
Integrierte Engine (Stockfish.js) steht unter GPL-3, die Paarungs-Engine (bbpPairings) unter Apache 2.0.
