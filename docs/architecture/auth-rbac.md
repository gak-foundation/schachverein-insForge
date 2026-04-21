
# Authentifizierung & RBAC

## Authentifizierung

Die Anwendung nutzt **Supabase Auth** (managed service) für die Authentifizierung:

- E-Mail & Passwort (via Supabase Auth)
- OAuth-Provider (GitHub, etc.)
- Session-Management via Supabase
- Passwort-Zurücksetzen via E-Mail

### Key Files

| Datei | Beschreibung |
|-------|--------------|
| `src/lib/supabase/client.ts` | Client-side Supabase Client |
| `src/lib/supabase/server.ts` | Server-side Supabase Client |
| `src/lib/auth/session.ts` | Session-Helper für Server Components |
| `src/lib/auth/client.ts` | React Hooks für Auth-State |
| `src/lib/auth/protected.tsx` | Geschützte Page Wrapper |

## Rollenbasiertes Rechtesystem (RBAC)

Das System verfügt über 8 vordefinierte Rollen. Berechtigungen können jedoch auch individuell auf Benutzerbasis überschrieben werden.

### Verfügbare Rollen

1. **Admin**: Voller Zugriff auf alle Funktionen und Einstellungen.
2. **Vorstand**: Verwaltung von Mitgliedern und Einsicht in Finanzen.
3. **Sportwart**: Turnierleitung, Mannschaftsaufstellungen und Lichess-Integration.
4. **Jugendwart**: Fokus auf Jugendmitglieder und Eltern-Kommunikation.
5. **Kassenwart**: Finanzverwaltung, SEPA-Lastschriften und Beiträge.
6. **Trainer**: Einsicht in Mitglieder und Sportbetrieb, Verwaltung von Trainings-Events.
7. **Mitglied**: Standardzugriff auf eigene Daten, Termine und Turniere.
8. **Eltern**: Zugriff auf Daten der eigenen Kinder (Parent Dashboard).

### Berechtigungs-Matrix (Auszug)

| Bereich | Berechtigung | Beschreibung |
|---|---|---|
| Mitglieder | `members.read` | Mitgliederliste einsehen |
| | `members.write` | Mitglieder bearbeiten |
| Finanzen | `finance.sepa` | SEPA-Mandate verwalten |
| Sport | `teams.lineup` | Mannschaftsaufstellungen festlegen |
| | `tournaments.results` | Ergebnisse in Turnieren eintragen |
| Admin | `admin.audit` | Audit-Logs einsehen |

Die vollständige Matrix ist in `src/lib/auth/permissions.ts` definiert.

### Implementierung

Prüfungen erfolgen sowohl client-seitig (für UI-Elemente) als auch server-seitig (in Server Actions und der Middleware).

Beispiel in einer Server Action:
```typescript
const session = await getSession();
if (!hasPermission(session.user.role, session.user.permissions, PERMISSIONS.MEMBERS_WRITE)) {
  throw new Error('Nicht autorisiert');
}
```

## Migration von Better Auth

Das Projekt wurde von Better Auth auf Supabase Auth migriert. Details siehe `docs/migration/SUPABASE-MIGRATION.md`.
