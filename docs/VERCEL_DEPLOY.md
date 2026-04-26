# Vercel + Supabase Deployment Guide

Diese Anleitung beschreibt das Deployment der Schachverein-Plattform auf Vercel mit Supabase als Backend.

## Übersicht

- **Frontend**: Vercel (Next.js 16)
- **Backend/Database**: Supabase Cloud (PostgreSQL + Auth + Storage)
- **Migrationen**: Drizzle ORM mit `DIRECT_URL`

---

## Schritt 1: Supabase Projekt erstellen

1. Gehe zu [https://supabase.com](https://supabase.com)
2. Erstelle einen neuen Account oder melde dich an
3. Klicke "New Project"
4. Wähle als **Region**: `EU (Frankfurt)` für DSGVO-Konformität
5. Warte bis das Projekt bereit ist (ca. 2-3 Minuten)

---

## Schritt 2: ENV-Variablen aus Supabase kopieren

Nach dem Erstellen des Projekts:

### 2.1 Supabase URL & API Keys

1. Gehe zu **Project Settings** → **API**
2. Kopiere folgende Werte:

```
NEXT_PUBLIC_SUPABASE_URL=https://[dein-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-hier-einfuegen]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key-hier-einfuegen]
```

⚠️ **WICHTIG**: `SUPABASE_SERVICE_ROLE_KEY` ist geheim und hat Admin-Rechte!

### 2.2 Database Connection URLs

1. Gehe zu **Project Settings** → **Database**
2. Wähle **Connection Pooling** (Session Mode)
3. Kopiere die URLs:

```
# Connection Pooling (Port 6543) - für App/Next.js
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Direct Connection (Port 5432) - für Migrations
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

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
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[anon-key]` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `[service-role-key]` | Production, Preview, Development |
| `DATABASE_URL` | `postgresql://...:6543/...` | Production, Preview, Development |
| `DIRECT_URL` | `postgresql://...:5432/...` | Production, Preview, Development |
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
| `EMAIL_FROM` | Absender-Adresse |

### Optionale OAuth Provider

| Variable | Beschreibung |
|----------|--------------|
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth App |
| `LICHESS_CLIENT_ID` / `LICHESS_CLIENT_SECRET` | Lichess OAuth |

---

## Schritt 6: Datenbank-Migrationen ausführen

Lokal ausführen (verbindet sich mit Supabase):

```bash
# ENV-Variablen prüfen
cat .env.local

# Migrationen ausführen
npm run db:push
```

Oder über Vercel CLI:

```bash
vercel --prod
```

---

## Schritt 7: Supabase Auth konfigurieren

In Supabase Dashboard → **Authentication** → **URL Configuration**:

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

→ Stelle sicher, dass `DATABASE_URL` und `DIRECT_URL` korrekt sind

### "DYNAMIC_SERVER_USAGE" Error

→ Das ist normal während des Builds und wird abgefangen

### Datenbank-Verbindung schlägt fehl

→ Prüfe ob die IP erlaubt ist in Supabase → Database → Network Restrictions

### Migrationen schlagen fehl

→ Nutze `DIRECT_URL` (Port 5432), nicht `DATABASE_URL` (Port 6543)

---

## Zusammenfassung ENV-Datei (Production)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=XXXX
SUPABASE_SERVICE_ROLE_KEY=XXXX

# Database
DATABASE_URL=postgresql://XXXX:XXXX@pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://XXXX:XXXX@db.XXXX.supabase.co:5432/postgres

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
LICHESS_CLIENT_ID=XXXX
LICHESS_CLIENT_SECRET=XXXX
```
