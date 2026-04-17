
# Deployment-Guide

## Hosting-Optionen

### Vercel (Empfohlen für Frontend/API)
Die Anwendung ist für Vercel optimiert.
- Framework Preset: Next.js
- Build Command: \
pm run build\
- Environment Variables: Siehe unten.

### Scalingo / Heroku
Unterstützt via \Procfile\ für Docker-basierte Deployments oder Node.js Buildpacks.

## Erforderliche Dienste

1. **PostgreSQL 17+**: Hauptdatenbank.
2. **Redis 7+**: Für BullMQ (Queues) und Rate-Limiting.
3. **S3-kompatibler Speicher**: (Optional) Für Dokumente und PGN-Dateien (z.B. MinIO, AWS S3).
4. **SMTP-Server**: Für E-Mail-Einladungen und Benachrichtigungen.

## Umgebungsvariablen

| Variable | Zweck |
|---|---|
| \DATABASE_URL\ | Verbindung zur PostgreSQL DB |
| \REDIS_URL\ | Verbindung zu Redis |
| \BETTER_AUTH_SECRET\ | Secret für Auth-Tokens |
| \BETTER_AUTH_URL\ | Basis-URL der App |
| \ENCRYPTION_KEY\ | Key für sensible Daten (AES-256) |

