# InsForge Readiness Audit — schach.studio

**Datum:** 2026-05-05
**Ziel:** Vollständiger General-Check: Ist das Projekt bereit für den produktiven Betrieb auf InsForge?

## Gesamtbewertung: BEREIT (mit P1-Action Items)

Build läuft, 133 Tests grün, 33 Tabellen mit RLS, alle Features auf InsForge SDK migriert. Ein P1-Item vor Go-Live.

---

## Zusammenfassung der 8 Dimensionen

| # | Dimension | Status | P0 | P1 | P2 | P3 |
|---|-----------|--------|----|----|----|----|
| 1 | Code-Aufräumung | grün | 0 | 0 | 2 | 0 |
| 2 | RLS-Verifikation | grün | 0 | 1 | 0 | 0 |
| 3 | Backend-Konfiguration | grün | 0 | 1 | 1 | 1 |
| 4 | Auth-Audit | grün | 0 | 0 | 1 | 1 |
| 5 | Feature-Coverage | grün | 0 | 0 | 0 | 0 |
| 6 | Performance & Sicherheit | gelb | 0 | 0 | 2 | 1 |
| 7 | Produktionsreife | gelb | 0 | 0 | 0 | 1 |
| 8 | Gap-Analyse | gelb | 0 | 0 | 0 | 2 |

---

## Action Items (priorisiert)

### P0 — Keine

### P1 (vor Produktiv-Betrieb)

- **Storage RLS implementieren** — Private Buckets (attachments, documents, protocols) brauchen RLS-Policies, damit authentifizierte Club-Mitglieder Dateien hoch-/runterladen können. Aktuell nur via Service-Role-Key.

### P2 (bald nach Go-Live)

- **DATABASE_URL aus src/env.ts entfernen** — Wird nicht mehr genutzt.
- **build:migrate-Script aus package.json entfernen** — Referenziert nicht-existentes src/lib/db/migrate.ts.
- **Passwort-Policy verschärfen** — Aktuell min 6 Zeichen ohne Komplexität. Empfehlung: min 8 Zeichen, min 1 Sonderzeichen.
- **jwt.ts bereinigen** — getSessionToken() liest insforge_session-Cookie, das nicht mehr gesetzt wird.
- **Rate Limiting auf Redis/Upstash umstellen** — In-Memory reicht nicht für Multi-Instance.
- **Server-seitigen Cache einführen** — Next.js unstable_cache oder Redis für häufig gelesene Club-Daten.

### P3 (Nice-to-have)

- **Evaluieren: InsForge Email statt SMTP** — Eigenes SMTP funktioniert, aber InsForge-Built-in würde eine Abhängigkeit eliminieren.
- **AGENTS.md aktualisieren** — Tailwind-Hinweis von v3.4 auf v4 ändern (Projekt nutzt bereits v4).
- **.gitignore präzisieren** — *.png blockt alle PNGs; nur bestimmte Pfade ignorieren.
- **Dockerfile bereinigen oder entfernen** — Wird nicht mehr benötigt.
- **drizzle/ aus .gitignore entfernen** — Kein Drizzle mehr im Projekt.
- **Sync-Richtung dokumentieren** — InsForge Auth = Source of Truth, auth_user-Tabelle = enriched data.

---

## Detail-Befunde

### 1. Code-Aufräumung (grün)
Alle Drizzle-Referenzen entfernt. package.json sauber, Schema-Dateien sind reine TS-Typen. Scripts nutzen createServiceClient(). Docker enthält kein PostgreSQL.

### 2. RLS-Verifikation (grün)
33 Tabellen mit rowsecurity: true. 159 Policies (CRUD + project_admin_policy). Inline EXISTS-Subqueries statt Funktionsaufrufen. blog_posts mit public SELECT für published Posts. Einzige Lücke: Storage RLS.

### 3. Backend-Konfiguration (grün)
33 Tabellen mit FK/Indizes. 5 Buckets (2 public, 3 private). OAuth (GitHub, Google). 6 AI-Modelle. Keine Edge Functions deployed.

### 4. Auth-Audit (grün)
createServerAuthClient() mit Cookie-Refresh. getSession() per React cache(). 43 Permissions über 8 Rollen. Tenant-Binding bei Signup. Dual-Auth-Pattern (InsForge Auth + auth_user) dokumentierbar.

### 5. Feature-Coverage (grün)
100% InsForge SDK. Keine Drizzle-Referenzen in API-Routen, Queries, Actions.

### 6. Performance & Sicherheit (gelb)
Service-Role-Key nur server-seitig. 3 Client-Typen. In-Memory Rate Limiting. React Query (2-5min stale).

### 7. Produktionsreife (gelb)
Vercel konfiguriert (fra1). Tailwind v4 im Einsatz (AGENTS.md muss aktualisiert werden). Dockerfile nicht mehr benötigt.

### 8. Gap-Analyse (gelb)
Realtime, Edge Functions nicht genutzt. AI-Modelle verfügbar aber nicht integriert.

---

## Go/No-Go-Empfehlung

**Go** — nach Umsetzung des P1-Items (Storage RLS). Das Projekt ist migrations-technisch fertig, alle Tests grün, Code nutzt konsistent InsForge SDK. P2/P3-Items sind Verbesserungen, keine Blocker.
