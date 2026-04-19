# Techstack & Architektur - Schachverein Software

Diese Dokumentation beschreibt den aktuellen technologischen Stand und die Architektur der Schachvereins-Software. Das System ist als Multi-Tenant (Multi-Club) SaaS-Plattform konzipiert.

---

## 🎯 Kernanforderungen & Fachdomäne

Die Software deckt die spezifischen Bedürfnisse von Schachvereinen ab, die über eine klassische Mitgliederverwaltung hinausgehen:

### Kernmodule
- **Mitgliederverwaltung**: Inkl. Familien-Verknüpfungen und DSGVO-Einwilligungen.
- **Finanzwesen**: SEPA-Lastschriften (pain.008), Beitragsstufen, Zahlungsstatus.
- **Multi-Club (Mandantenfähigkeit)**: Ein Benutzer kann Mitglied in mehreren Vereinen sein und nahtlos wechseln.
- **Rollen- & Rechtesystem (RBAC)**: 8 vordefinierte Rollen mit 23 feingranularen Berechtigungen.
- **Veranstaltungskalender**: Terminplanung für Training, Spieltage und Versammlungen.

### Schachspezifische Module
- **DWZ/Elo-Tracking**: Historisierung der Wertungszahlen pro Mitglied.
- **Turnierverwaltung**: 
    - Rundenturniere (Berger-Tabellen Logik implementiert).
    - Schweizer System (Integration von `bbpPairings` via TRF).
    - TRF-Import/Export (FIDE-Standard).
- **Mannschaftsbetrieb**: Saisons, Ligen, Brettreihenfolgen und Ergebnismeldung.
- **Partiedatenbank**: Lichess-Integration, Verlinkung von Partien, Analyse-Links.
- **Infrastruktur & Background**:
    - **Redis (ioredis)**: Caching, Rate-Limiting und BullMQ-Backend.
    - **BullMQ**: Queue für E-Mail-Versand (Nodemailer/SMTP) und Hintergrundprozesse.
    - **MinIO / S3**: Speicherung von Dokumenten (Satzungen, Protokolle).
- **Docker Compose**: Lokale Entwicklungsumgebung für DB, Redis und Storage.

---

## 🛡️ Sicherheit & Zugriffsschutz

Das System implementiert eine mehrschichtige Sicherheitsstrategie:

1. **Authentifizierung**:
   - Better Auth mit E-Mail/Passwort (bcrypt 12).
   - 2FA/TOTP Unterstützung.
   - Account-Lockout nach 5 Fehlversuchen (30 Min Sperre).
2. **Autorisierung (RBAC)**:
   - Rollen: `admin`, `vorstand`, `sportwart`, `jugendwart`, `kassenwart`, `trainer`, `mitglied`, `eltern`.
   - Berechtigungen: Feingranular (z.B. `finance.sepa`, `tournaments.results`).
   - Per-User Overrides möglich.
3. **Schutzmaßnahmen**:
   - **Rate Limiting**: IP- und User-basiert (Login: 5/15min, Register: 3/60min).
   - **Security Headers**: Strikte CSP, HSTS, X-Frame-Options (Deny).
   - **Verschlüsselung**: AES-256-GCM für sensible Daten (IBANs).
   - **Audit-Log**: Lückenlose Protokollierung aller kritischen Aktionen (`auditLog`-Tabelle).

---

## 🗄️ Datenmodell (Drizzle Schema)

Das Datenmodell ist hochgradig relational und in der `src/lib/db/schema/` Verzeichnisstruktur organisiert:

- **Auth**: `authUsers`, `authSessions`, `authAccounts`, `authVerifications`, `authTwoFactors`.
- **Organisation**: `clubs`, `clubMemberships`, `clubInvitations`.
- **Mitglieder**: `members`, `dwzHistory`, `availability`.
- **Sportbetrieb**: `seasons`, `teams`, `boardOrders`, `matches`, `matchResults`.
- **Turniere**: `tournaments`, `tournamentParticipants`, `games`.
- **Verwaltung**: `events`, `documents`, `newsletters`, `payments`, `contributionRates`, `auditLog`.

---

## 🚀 Entwicklung & Betrieb

### Befehle
- `npm run dev` - Lokaler Server
- `npm run db:push` - Schema-Synchronisation
- `npm run test` - Unit/Integration Tests (Vitest)
- `npm run test:e2e` - End-to-End Tests (Playwright)

### Deployment & Infrastruktur
- **Hosting**: "All-Hetzner" Docker-Deployment (DE) für volle DSGVO-Konformität und Kontrolle.
- **Reverse Proxy**: Caddy für SSL (Let's Encrypt) und Routing.
- **Containerization**: Docker & Docker Compose für alle Dienste.
- **CI/CD**: GitHub Actions für automatisiertes Bauen und Testen.

---

## 📈 Roadmap & MVP-Phasen

1. **Phase 1 (Fundament)**: Multi-Club Auth, Basis-Mitgliederverwaltung, RBAC. ✅
2. **Phase 2 (Schach-Sport)**: Saisons, Mannschaften, Turniere, Lichess-Integration. ✅
3. **Phase 3 (Finanzen)**: Beitragsverwaltung, SEPA-XML Export. ✅
4. **Phase 4 (SaaS/Pro)**: Stripe Integration, White-Labeling, API-Zugriff. ⏳
