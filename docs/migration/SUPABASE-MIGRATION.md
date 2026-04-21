# Migration zu Supabase Cloud

Diese Anleitung beschreibt die Migration von Better Auth + Redis + MinIO zu Supabase Cloud.

## Warum Supabase Cloud?

| Feature | Vorher | Nachher |
|---------|--------|---------|
| Auth | Better Auth (selbst gehostet) | Supabase Auth (managed) |
| Storage | MinIO (selbst gehostet) | Supabase Storage (managed) |
| Realtime | Redis + BullMQ | Supabase Realtime |
| Queue System | BullMQ (komplex) | Einfache async Functions |
| Wartung | Hoch | Minimal |

## Schritt-für-Schritt Migration

### 1. Supabase Projekt erstellen

1. Gehe zu [https://supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. **Wichtig:** Wähle Region `EU (Frankfurt)` für DSGVO-Konformität
4. Kopiere die Project URL und API Keys aus den Projekteinstellungen

### 2. Umgebungsvariablen aktualisieren

Kopiere `.env.example` zu `.env.local` und fülle die Werte aus:

```bash
# Supabase Konfiguration
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Database (für Drizzle)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 3. Database Schema migrieren

Verbinde mit Supabase PostgreSQL und führe Migrationen aus:

```bash
# Migrationen anwenden
npm run db:push

# Oder mit Studio bearbeiten
npm run db:studio
```

### 4. Auth-User migrieren

Falls du bestehende Nutzer hast:

1. Exportiere Nutzer aus Better Auth Database
2. Nutze Supabase Auth Admin API zum Importieren
3. Nutzer müssen bei erstmaligem Login Passwort zurücksetzen

### 5. Storage Buckets erstellen

In Supabase Dashboard → Storage:

1. Erstelle Buckets:
   - `avatars` (public: true)
   - `documents` (public: false)
   - `protocols` (public: false)
   - `attachments` (public: false)

2. Setze RLS Policies für jeden Bucket

### 6. Code-Anpassungen

#### Auth in Komponenten

Vorher (Better Auth):
```typescript
import { authClient } from "@/lib/auth/client"
const { data } = await authClient.signIn.email({...})
```

Nachher (Supabase):
```typescript
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({...})
```

#### Storage

Vorher (MinIO):
```typescript
import { uploadToS3 } from "@/lib/storage/s3"
await uploadToS3(file, path)
```

Nachher (Supabase):
```typescript
import { uploadFile } from "@/lib/supabase/storage"
await uploadFile("avatars", path, file)
```

## Entfernte Dependencies

```bash
# Diese wurden entfernt:
npm uninstall better-auth @better-auth/drizzle-adapter bullmq ioredis
```

## Neue Dependencies

```bash
# Diese wurden hinzugefügt:
npm install @supabase/supabase-js @supabase/ssr ai @ai-sdk/openai
```

## Lokale Entwicklung

Für lokale Entwicklung wird nur PostgreSQL benötigt:

```bash
# Starte lokale DB
docker compose -f docker/docker-compose.yml up -d

# Dev Server starten
npm run dev
```

## Produktions-Deployment

### Hetzner Setup

1. Docker Compose ist nun **drastisch vereinfacht**
2. Nur noch App + PostgreSQL (optional für Caching)
3. Kein Redis, kein MinIO, kein Worker mehr nötig

### Umgebungsvariablen in Produktion

```bash
# Kopiere .env.example und fülle aus
cp .env.example .env.production

# Dann auf Server deployen
```

## Fehlerbehebung

### Connection Errors

Wenn Supabase nicht erreichbar:
- Prüfe Project URL
- Prüfe API Keys
- Stelle sicher dass `NEXT_PUBLIC_` für Client-Keys gesetzt ist

### Database Connection

Für Drizzle ORM:
- Verwende die **Connection Pooler** URL für Serverless Functions
- Verwende **Direct Connection** für Migrations

### Auth Callbacks

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://deine-domain.de`
- Redirect URLs: `https://deine-domain.de/auth/callback`

## Ressourcen

- [Supabase Dokumentation](https://supabase.com/docs)
- [Supabase Auth mit Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
