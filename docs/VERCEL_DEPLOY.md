# Vercel + InsForge Deployment Guide

Diese Anleitung beschreibt das Deployment der Schachverein-Plattform auf Vercel mit InsForge als Backend.

## Übersicht

- **Frontend**: Vercel (Next.js 16)
- **Backend/Database**: InsForge (PostgreSQL + Auth + Storage)
- **Schema**: InsForge MCP Tools (`run-raw-sql`, `get-table-schema`)

---

## Schritt 1: InsForge Projekt erstellen

1. Gehe zu [https://insforge.ai](https://insforge.ai)
2. Erstelle einen neuen Account oder melde dich an
3. Erstelle ein neues Projekt
4. Wähle als **Region**: `EU (Central)` für DSGVO-Konformität
5. Warte bis das Projekt bereit ist

---

## Schritt 2: ENV-Variablen aus InsForge kopieren

Nach dem Erstellen des Projekts:

### 2.1 InsForge URL & API Keys

1. Gehe zu **Project Settings** → **API**
2. Kopiere folgende Werte:

```
NEXT_PUBLIC_INSFORGE_URL=https://[dein-projekt].eu-central.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=[anon-key-hier-einfuegen]
INSFORGE_SERVICE_ROLE_KEY=[service-role-key-hier-einfuegen]
```

⚠️ **WICHTIG**: `INSFORGE_SERVICE_ROLE_KEY` ist geheim und hat Admin-Rechte!

---

## Schritt 3: Verschlüsselungsschlüssel erstellen

Für die Verschlüsselung sensibler Daten (IBAN, etc.):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output kopieren als `ENCRYPTION_KEY`.

---

## Schritt 4: Vercel Projekt erstellen

1. Gehe zu [https://vercel.com](https://vercel.com)
2. Importiere das GitHub Repository
3. Wähle das Framework Preset: **Next.js**
4. Erweiterte Einstellungen:
   - **Root Directory**: `.` (Standard)
   - **Build Command**: `npm run build` (Standard)
   - **Output Directory**: `.next` (Standard)

---

## Schritt 5: ENV-Variablen in Vercel eintragen

Gehe zu **Settings** → **Environment Variables** und füge alle Variablen hinzu:

### Pflicht-Variablen

| Variable | Wert | Environment |
|----------|------|-------------|
| `NEXT_PUBLIC_INSFORGE_URL` | `https://[projekt].insforge.app` | Production, Preview, Development |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | `[anon-key]` | Production, Preview, Development |
| `INSFORGE_SERVICE_ROLE_KEY` | `[service-role-key]` | Production, Preview, Development |
| `ENCRYPTION_KEY` | `[32-byte-hex]` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://[dein-projekt].vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |

### Optionale Variablen (für E-Mail)

| Variable | Beschreibung |
|----------|--------------|
| `RESEND_API_KEY` | Von [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | `kontakt@deine-domain.de` |
| `SMTP_HOST` | z.B. `smtp.gmail.com` |
| `SMTP_PORT` | z.B. `587` |
| `SMTP_USER` | E-Mail-Adresse |
| `SMTP_PASS` | App-Password |
| `SMTP_FROM` | Absender-Adresse |

### Optionale OAuth Provider

| Variable | Beschreibung |
|----------|--------------|
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth App |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Google OAuth |
| `LICHESS_CLIENT_ID` / `LICHESS_CLIENT_SECRET` | Lichess OAuth |

---

## Schritt 6: Datenbank-Schema verwalten

Das Schema wird über InsForge MCP Tools verwaltet:

```bash
# Schema-Änderungen via InsForge CLI
insforge run-raw-sql "CREATE TABLE ..."
```

Seed-Daten lokal einspielen:

```bash
npm run db:seed
```

---

## Schritt 7: InsForge Auth konfigurieren

Im InsForge Dashboard → **Authentication** → **URL Configuration**:

1. **Site URL**: `https://[dein-projekt].vercel.app`
2. **Redirect URLs** hinzufügen:
   - `https://[dein-projekt].vercel.app/api/auth/callback`
   - `https://[dein-projekt].vercel.app/auth/callback`

---

## Schritt 8: Deploy testen

```bash
vercel --prod
```

Oder pushe auf den `main` Branch für automatisches Deploy.

---

## Troubleshooting

### Build Error: "Failed to collect page data"

→ Stelle sicher, dass `NEXT_PUBLIC_INSFORGE_URL` und `NEXT_PUBLIC_INSFORGE_ANON_KEY` korrekt sind

### "DYNAMIC_SERVER_USAGE" Error

→ Das ist normal während des Builds und wird abgefangen

### Datenbank-Verbindung schlägt fehl

→ Prüfe ob die IP erlaubt ist in InsForge → Database → Network Restrictions

### Schema-Änderungen schlagen fehl

→ Nutze das InsForge MCP Tool `run-raw-sql` für Schema-Änderungen

---

## Zusammenfassung ENV-Datei (Production)

```env
# InsForge
NEXT_PUBLIC_INSFORGE_URL=https://XXXX.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=XXXX
INSFORGE_SERVICE_ROLE_KEY=XXXX

# App
NEXT_PUBLIC_APP_URL=https://dein-projekt.vercel.app
NEXT_PUBLIC_ROOT_DOMAIN=deine-domain.de

# Security
ENCRYPTION_KEY=XXXX32ByteHexXXXX

# Optional: E-Mail
RESEND_API_KEY=XXXX
RESEND_FROM_EMAIL=kontakt@deine-domain.de

# Optional: OAuth
GITHUB_ID=XXXX
GITHUB_SECRET=XXXX
GOOGLE_ID=XXXX
GOOGLE_SECRET=XXXX
LICHESS_CLIENT_ID=XXXX
LICHESS_CLIENT_SECRET=XXXX
```
