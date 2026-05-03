# schach.studio: Der digitale Heimathafen für Ihren Schachverein

> **Migration zu https://github.com/InsForge/InsForge https://docs.insforge.dev/introductionlink erfolgreich**

**Die einzige All-in-One Plattform für Schachvereine, bei der die interne Verwaltung automatisch Ihre öffentliche Website befüllt.**

schach.studio vereint Mitgliederverwaltung, Finanzwesen, Turnierleitung, Mannschaftsbetrieb und Trainingstools in einem modernen System. Der entscheidende Vorteil: Jede Aktion in der Verwaltung (Turniererstellung, Ergebniseingabe, Terminplanung) wird in Echtzeit auf Ihrer öffentlichen Vereins-Website sichtbar — ohne Doppeltpflege, ohne WordPress-Chaos.

## 🚀 Kern-USP: Single Source of Truth

- **Keine Doppeltpflege:** Ergebnisse und Tabellen fließen automatisch aus der Verwaltung auf die Website.
- **Radikale Zeitersparnis:** Vorstände sparen bis zu 80% ihrer Administrationszeit durch Automatisierung.
- **Sportliche Exzellenz:** Tiefenintegration von Lichess, DWZ-Daten und TRF-Exporten.
- **Rechtssicherheit:** Vollständig DSGVO-konform (Hosting in DE) und bereit für das Barrierefreiheitsstärkungsgesetz (BFSG 2025).

## ✨ Features

- ♟️ **Turnierverwaltung** (Schweizer System via bbpPairings, echte DeWIS-Synchronisation, TRF-Export)
- 💶 **Finanzwesen** (Verschlüsselte SEPA-Daten, Beitragsberechnung)
- 🛡️ **DSGVO & Sicherheit** (Surgical Encryption: IBAN/BIC AES-256-GCM verschlüsselt, Einwilligungshistorie)
- ♿ **Barrierefreiheit (BFSG 2025)** (Optimiert für Zielgruppe 55+, OKLCH High-Contrast)
- 📱 **Progressive Web App (PWA)** für den Einsatz am Spieltag (Offline-fähig)
- 📈 **API-Integrationen** (Lichess, DeWIS, FIDE)

## Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Database**: PostgreSQL (via Drizzle ORM + InsForge)
- **Authentication**: InsForge Auth (JWT, E-Mail, OAuth)
- **Styling**: Tailwind CSS 4 (OKLCH Themes)
- **Storage**: InsForge Storage (S3-kompatibel)
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
