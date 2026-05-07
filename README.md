# schach.studio: Der digitale Heimathafen für Schachvereine

> **100% kostenlos · Open Source · Von der Community für die Community**

**Die einzige All-in-One Plattform für Schachvereine, bei der die interne Verwaltung automatisch Ihre öffentliche Website befüllt — komplett kostenlos und ohne Abo-Fallen.**

schach.studio vereint Mitgliederverwaltung, Finanzwesen, Turnierleitung, Mannschaftsbetrieb und Trainingstools in einem modernen System. Der entscheidende Vorteil: Jede Aktion in der Verwaltung (Turniererstellung, Ergebniseingabe, Terminplanung) wird in Echtzeit auf Ihrer öffentlichen Vereins-Website sichtbar — ohne Doppeltpflege, ohne WordPress-Chaos.

## Warum kostenlos?

Weil Schachvereine ehrenamtlich arbeiten und ihre Mittel für das Wichtigste einsetzen sollten: Für Schach. Dieses Projekt ist ein unabhängiges Hobby-Projekt, das von der Community getragen wird. Alle Features sind für alle Vereine kostenlos verfügbar — ohne Einschränkungen, ohne "Pro-Plan", ohne versteckte Kosten.

## Kern-USP: Single Source of Truth

- **Keine Doppeltpflege:** Ergebnisse und Tabellen fließen automatisch aus der Verwaltung auf die Website.
- **Radikale Zeitersparnis:** Vorstände sparen bis zu 80% ihrer Administrationszeit durch Automatisierung.
- **Sportliche Exzellenz:** Tiefenintegration von Lichess, DWZ-Daten und TRF-Exporten.
- **Rechtssicherheit:** Vollständig DSGVO-konform (Hosting in DE) und bereit für das Barrierefreiheitsstärkungsgesetz (BFSG 2025).

## Features

- ♟️ **Turnierverwaltung** (Schweizer System via bbpPairings, echte DeWIS-Synchronisation, TRF-Export)
- 💰 **Finanzwesen** (Verschlüsselte SEPA-Daten, Beitragsberechnung)
- 🔒 **DSGVO & Sicherheit** (Surgical Encryption: IBAN/BIC AES-256-GCM verschlüsselt, Einwilligungshistorie)
- ♿ **Barrierefreiheit (BFSG 2025)** (Optimiert für Zielgruppe 55+, OKLCH High-Contrast)
- 📱 **Progressive Web App (PWA)** für den Einsatz am Spieltag (Offline-fähig)
- 🔗 **API-Integrationen** (Lichess, DeWIS, FIDE)

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
   cp .env.example .env.local
   # Fülle .env.local mit InsForge-Werten
   ```

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

Die App ist unter `http://localhost:3000` erreichbar.

## Deployment

Das System ist für ein DSGVO-konformes Deployment auf **InsForge Cloud** und **Vercel** oder **Hetzner (Docker)** konzipiert.

## Mitmachen

Dieses Projekt lebt von der Community. Ob du Entwickler bist, Design-Feedback gibst oder einfach nur Bugs meldest — jede Hilfe ist willkommen!

- 🐛 [Bug melden](../../issues/new?labels=bug&template=bug_report.md)
- 💡 [Feature wünschen](../../issues/new?labels=enhancement&template=feature_request.md)
- 🔧 [Pull Request erstellen](../../compare)
- 📖 [Contributing Guide lesen](CONTRIBUTING.md)

**Wir suchen einen Co-Maintainer!** Wenn du Lust hast, dieses Projekt mitzugestalten, schreib uns eine [E-Mail](mailto:kontakt@schach.studio) oder öffne ein Issue.

## Unterstützen

schach.studio ist und bleibt kostenlos. Wenn du das Projekt dennoch unterstützen möchtest:

- ⭐ Gib uns einen Star auf GitHub
- 🐦 Erzähle anderen Vereinen von schach.studio
- 🔧 Contribute Code, Design oder Dokumentation
- ☕ [Buy Me a Coffee](https://buymeacoffee.com/schachstudio) (freiwillig, keine Pflicht!)

## Lizenz

Dieses Projekt ist lizenziert unter der [MIT License](LICENSE).
Integrierte Engine (Stockfish.js) steht unter GPL-3, die Paarungs-Engine (bbpPairings) unter Apache 2.0.

---

**Made with ♟️ and ❤️ for the chess community**
