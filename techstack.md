# Schachverein - Tech Stack & Implementation Status

## Übersicht

Vollständige Next.js 16 Anwendung für Schachvereins-Verwaltung mit enterprise-grade Authentication.

---

## Tech Stack

| Kategorie | Technologie |
|-----------|-------------|
| Framework | Next.js 16.2.3 (App Router, Turbopack) |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Auth | Better Auth |
| State | Zustand (client-side) |
| Validation | Zod |
| Chess | chess.js + react-chessboard |

---

## Auth-System Status

### ✅ Implementiert

| Feature | Status |
|---------|--------|
| JWT Strategy | ✅ |
| Credentials Provider | ✅ |
| GitHub OAuth | ✅ |
| Passwort-Hashing (bcryptjs) | ✅ |
| E-Mail-Verifikation | ✅ |
| Passwort-Zurücksetzen | ✅ |
| Account-Sperrung (Brute-Force) | ✅ |
| Rate-Limiting (Redis) | ✅ |
| Refresh-Token-Rotation | ✅ |
| Security Headers | ✅ |
| Audit Logging | ✅ |
| CSRF Protection | ✅ |
| Secure Cookies | ✅ |

### Auth-Flows

**Login:**
```
POST /login → Rate-Limit-Check → Account-Lock-Check → Passwort-Verify → Refresh-Token → Session
```

**Registrierung:**
```
POST /signup → Validierung → User+Member erstellen → Verifikations-Token → E-Mail senden → /auth/verify-request
```

**Passwort-Zurücksetzen:**
```
POST /auth/forgot-password → Token generieren → E-Mail senden → Link klicken → /auth/reset-password
```

---

## Datenbank-Schema

### Core Tables
- `members` - Vereinsmitglieder mit DWZ/ELO
- `users` - Auth-User mit Rollen
- `teams` - Mannschaften
- `seasons` - Spielzeiten
- `tournaments` - Turniere
- `games` - Partien mit PGN
- `events` - Kalender
- `payments` - Finanzen
- `matches` - Mannschaftskämpfe

### Auth Tables
- `accounts` - OAuth Accounts
- `sessions` - Server-Sessions
- `verification_tokens` - E-Mail/PW-Reset Tokens
- `refresh_tokens` - Refresh-Token-Rotation
- `audit_log` - DSGVO-konformes Logging

---

## Pages & Routes

### Public
- `/` - Landing Page
- `/login` - Anmeldung
- `/signup` - Registrierung
- `/auth/error` - Auth-Fehler
- `/auth/verify-request` - "Prüfe E-Mail"
- `/auth/verify-email` - E-Mail-Verifikation
- `/auth/forgot-password` - Passwort vergessen
- `/auth/reset-password` - Neues Passwort setzen

### Protected (Dashboard)
- `/dashboard` - Übersicht
- `/dashboard/members` - Mitgliederliste
- `/dashboard/members/[id]` - Mitglieder-Detail
- `/dashboard/members/new` - Mitglied anlegen
- `/dashboard/teams` - Mannschaften
- `/dashboard/teams/[id]` - Team-Detail
- `/dashboard/teams/new` - Team anlegen
- `/dashboard/seasons` - Spielzeiten
- `/dashboard/seasons/new` - Saison anlegen
- `/dashboard/tournaments` - Turniere
- `/dashboard/tournaments/[id]` - Turnier-Detail
- `/dashboard/tournaments/new` - Turnier anlegen
- `/dashboard/calendar` - Kalender
- `/dashboard/calendar/new` - Termin anlegen
- `/dashboard/games` - Partien
- `/dashboard/games/[id]` - Partie-Detail
- `/dashboard/games/new` - Partie erfassen
- `/dashboard/finance` - Finanzen
- `/dashboard/protocols` - Audit-Logs

### API Routes
- `/api/auth/*` - Better Auth Endpoints

---

## RBAC (Role-Based Access Control)

### Rollen
- `admin` - Voller Zugriff
- `vorstand` - Verwaltung
- `sportwart` - Turniere/Partien
- `jugendwart` - Jugend
- `kassenwart` - Finanzen
- `trainer` - Training
- `mitglied` - Eingeschränkter Zugriff
- `eltern` - Elternzugang

### Permissions
Mit `hasPermission(role, permissions[], PERMISSION)` prüfbar.

---

## Security Features

1. **Rate Limiting** - Redis-basiert
   - Login: 5 Versuche / 15 Min
   - Registrierung: 3 / Stunde
   - Passwort-Reset: 3 / Stunde

2. **Account Lockout** - Nach 5 Fehlversuchen (30 Min)

3. **Token Rotation** - Refresh-Tokens bei jedem Login neu

4. **Security Headers** - CSP, HSTS, etc.

5. **Audit Logging** - Alle Änderungen protokolliert

---

## PWA Features

- Web App Manifest (`/manifest.json`)
- Service Worker (`/sw.js`)
- Offline-fähige IndexedDB-Utility

---

## Build Commands

```bash
npm run dev        # Development (Turbopack - Next.js 16 default)
npm run build      # Production Build + TypeScript Check
npm run lint       # ESLint
npm run db:generate # Drizzle Migration generieren
npm run db:push    # Schema auf DB anwenden
npm run db:studio  # Drizzle Studio öffnen
npm run test       # Vitest
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# OAuth
GITHUB_ID=...
GITHUB_SECRET=...

# Redis (Rate Limiting)
REDIS_URL=redis://localhost:6379

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=noreply@example.com
```

---

## Nächste Schritte (Offen)

- [ ] 2FA (TOTP) Vervollständigung
- [ ] PGN-Viewer mit Spiel-Analyse
- [ ] DWZ-Import/Export
- [ ] E-Mail-Newsletter Versand
- [ ] Mobile-Optimierung der UI
- [ ] Tests erweitern
