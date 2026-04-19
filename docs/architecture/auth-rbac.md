
# Authentifizierung & RBAC

## Authentifizierung

Die Anwendung nutzt **Better Auth** für die Authentifizierung. Unterstützt werden:
- E-Mail & Passwort (bcrypt)
- 2FA/TOTP (Pflicht für Admins)
- Session-Management
- Account-Lockout nach Fehlversuchen

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
| Mitglieder | \members.read\ | Mitgliederliste einsehen |
| | \members.write\ | Mitglieder bearbeiten |
| Finanzen | \inance.sepa\ | SEPA-Mandate verwalten |
| Sport | \	eams.lineup\ | Mannschaftsaufstellungen festlegen |
| | \	ournaments.results\ | Ergebnisse in Turnieren eintragen |
| Admin | \dmin.audit\ | Audit-Logs einsehen |

Die vollständige Matrix ist in \src/lib/auth/permissions.ts\ definiert.

### Implementierung

Prüfungen erfolgen sowohl client-seitig (für UI-Elemente) als auch server-seitig (in Server Actions und der Middleware).

Beispiel in einer Server Action:
\\\	ypescript
const session = await getSession();
if (!hasPermission(session.user.role, session.user.permissions, PERMISSIONS.MEMBERS_WRITE)) {
  throw new Error('Nicht autorisiert');
}
\\\

