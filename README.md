# Schachverein - Vereinsmanagement für Schachvereine

Eine moderne Web-Anwendung für die Verwaltung von Schachvereinen, Mitgliedern und Turnieren.

## Features

- **Mitgliederverwaltung**: Erfassung und Verwaltung von Vereinsmitgliedern mit Rollen und Berechtigungen
- **Turniermanagement**: Schweizer System Turnierverwaltung mit TRF-Import/Export
- **Partieverwaltung**: PGN-Import, Analyse und Datenbank
- **Klub-Management**: Mehrere Klubs verwalten, Mitglieder zuweisen
- **Rollenbasierte Zugriffskontrolle**: 8 Rollen mit granularer Berechtigungssteuerung
- **2FA-Unterstützung**: TOTP-basierte Zwei-Faktor-Authentifizierung für Admins
- **Audit-Logging**: Vollständige Protokollierung aller sicherheitsrelevanten Aktionen

## Tech Stack

| Kategorie | Technologie |
|-----------|-------------|
| Framework | Next.js 16 (App Router, Server Components) |
| Sprache | TypeScript (strict mode) |
| Datenbank | PostgreSQL mit Drizzle ORM |
| Auth | Better Auth v5 |
| UI | shadcn/ui + Tailwind CSS 4 |
| State | Zustand (client-side) |
| Chess | chess.js + react-chessboard |
| Jobs | BullMQ + Redis |
| Validation | Zod |

## Lokale Entwicklung

### Voraussetzungen

- Node.js 20+
- PostgreSQL 17+
- Redis 7+
- Docker (optional, für Datenbanken)

### Installation

```bash
# Dependencies installieren
npm install

# Umgebungsvariablen kopieren und anpassen
cp .env.example .env

# Datenbank mit Docker starten (optional)
npm run docker:up

# Datenbank-Migrationen anwenden
npm run db:push

# Entwicklungsserver starten
npm run dev
```

Die App ist dann unter http://localhost:3000 verfügbar.

### Docker-Setup

```bash
# Alle Dienste starten (PostgreSQL, Redis, MinIO)
npm run docker:up

# Dienste stoppen
npm run docker:down
```

### Datenbank-Seeder

```bash
# Testdaten für Entwicklung laden
npm run db:seed
```

## Deployment (Vercel)

### Voraussetzungen

- GitHub Repository
- Vercel Account
- PostgreSQL Datenbank (Vercel Storage, Neon, oder Supabase)
- Redis (Vercel KV oder Upstash)

### Schritte

1. **Repository mit Vercel verbinden**
   - Auf [vercel.com](https://vercel.com) neues Projekt erstellen
   - GitHub Repository auswählen

2. **Umgebungsvariablen konfigurieren**

   ```bash
   # Better Auth Secret generieren
   openssl rand -base64 32
   
   # Encryption Key generieren
   openssl rand -hex 32
   ```

   In Vercel Environment Variables setzen:
   - `DATABASE_URL` - PostgreSQL Connection String
   - `BETTER_AUTH_SECRET` - Generiertes Secret
   - `BETTER_AUTH_URL` - Produktions-URL (z.B. `https://dein-projekt.vercel.app`)
   - `ENCRYPTION_KEY` - Generierter Key
   - `REDIS_URL` - Redis Connection String
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email-Konfiguration

3. **Build Settings** (automatisch erkannt)
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Datenbank migrieren**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Deployen**
   - Über Vercel Dashboard oder `vercel` CLI

## Umgebungsvariablen

Siehe `.env.example` für alle verfügbaren Variablen.

### Erforderlich

| Variable | Beschreibung |
|----------|--------------|
| `DATABASE_URL` | PostgreSQL Connection String |
| `BETTER_AUTH_SECRET` | Auth Secret (openssl rand -base64 32) |
| `BETTER_AUTH_URL` | App URL |
| `ENCRYPTION_KEY` | Verschlüsselungs-Key (openssl rand -hex 32) |
| `REDIS_URL` | Redis Connection String |

### Optional

| Variable | Beschreibung |
|----------|--------------|
| `GITHUB_ID`, `GITHUB_SECRET` | GitHub OAuth Login |
| `LICHESS_CLIENT_ID`, `LICHESS_CLIENT_SECRET` | Lichess Integration |
| `SMTP_*` | Email-Versand (Einladungen, Benachrichtigungen) |
| `S3_*` | Objektspeicher für PGN-Dateien |
| `MOLLIE_API_KEY` | Zahlungsanbieter für Mitgliedsbeiträge |

## Scripts

| Command | Beschreibung |
|---------|--------------|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build |
| `npm run start` | Produktionsserver |
| `npm run lint` | ESLint |
| `npm run test` | Vitest Tests |
| `npm run test:e2e` | Playwright E2E Tests |
| `npm run db:generate` | Drizzle Migration generieren |
| `npm run db:push` | Schema zur DB pushen |
| `npm run db:studio` | Drizzle Studio öffnen |
| `npm run db:seed` | Datenbank seeden |
| `npm run docker:up` | Docker Dienste starten |
| `npm run docker:down` | Docker Dienste stoppen |

## Sicherheit

- Passwort-Hashing mit bcrypt
- 2FA für Admin-Rollen verpflichtend
- Audit-Logging aller kritischen Aktionen
- Rate Limiting für Login-Versuche
- CSRF-Schutz
- SQL-Injection Protection durch Drizzle ORM

Siehe [SECURITY.md](./SECURITY.md) für Details.

## Lizenz

MIT

## Contributing

1. Issue erstellen für Feature-Wünsche oder Bugs
2. Branch erstellen (`git checkout -b feature/neues-feature`)
3. Commits mit aussagekräftigen Messages
4. Pull Request öffnen
