# Admin-Verbesserungen — Design Spec

**Datum**: 2026-05-03
**Thema**: Verbesserungen für den Vereinsadministrator (UI/UX + Funktionalität)
**Ausgangspunkt**: Umfassendes Audit aus Admin-Perspektive, 10 identifizierte Schmerzpunkte

---

## Problemstellung

Die Schachverein-Plattform ist funktional sehr umfassend, aber der Admin-Alltag wird durch fehlende Bulk-Operationen, umständliche Turnier-Eingabe und einen Mangel an Quick-Actions erschwert. Admins arbeiten doppelt (z.B. Kalender manuell übertragen, Buchhaltung extern führen) und verlassen die Plattform für Kommunikation, weil E-Mail-Funktionen zu rudimentär sind.

## Ziele

1. Reduziere tägliche Klickarbeit durch Bulk-Operationen und Matrix-Eingabe
2. Verhindere Plattform-Verlust durch iCal-Export, bessere Kommunikation
3. Mache das Dashboard von einer Auslage zu einem Cockpit mit Schnellaktionen
4. Vernetze die Plattform mit externen Tools (DATEV, WhatsApp, Kalender-Apps)

## Nicht-Ziele

- Kein volles E-Mail-Marketing mit Öffnungsraten-Tracking
- Kein Zwei-Wege-Messenger-Chat (nur Broadcast)
- Keine komplette Dashboard-Neuentwicklung (bestehende 7 Rollen bleiben)
- Kein neues Auth-System (bestehendes InsForge Auth bleibt unangetastet)

---

## Architektur

### 6 Phasen über 20 Wochen (~240h)

Jede Phase mischt einen Quick-Win (QB, sichtbarer Fortschritt in Woche 1-2) mit einem substantiellen Fix (S, löst echtes Admin-Problem).

```
Phase 1 (Wo 1-3)   "Erste Hilfe"     ████░░░░░░░░░░░░░░░░
Phase 2 (Wo 4-7)   "Turnier-Revolution" ░░░░████████░░░░░░░░
Phase 3 (Wo 8-10)  "Dashboard-Cockpit"  ░░░░░░░░░░██████░░░░
Phase 4 (Wo 11-14) "Finanz-Finish"      ░░░░░░░░░░░░░░████░░
Phase 5 (Wo 15-18) "Komm & Admin-Tools" ░░░░░░░░░░░░░░░░░███
Phase 6 (Wo 19-20) "Polishing"          ░░░░░░░░░░░░░░░░░░░█
```

### Technische Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Server Actions (React) + Route Handlers bleiben primär | Bestehender Code-Stil, keine neue API-Schicht |
| Kein neues npm-Paket für iCal | RFC 5545 ist simpel genug für inline Generator (`src/lib/ical/generator.ts`) |
| WhatsApp Cloud API für Messenger | Weiteste Verbreitung unter Vereinen, fertige REST-API |
| DATEV-CSV (nicht XML) | Einfachere Implementierung, von den meisten Buchhaltungen akzeptiert |
| Feature-Flags als DB-Tabelle + Server-Utility | Einfach, keine externe Abhängigkeit |
| Kein separates Microservice für Impersonation | Via spezielle Cookies + Middleware, analog zu bestehendem Session-Handling |

### Keine neuen Abhängigkeiten

Alle Änderungen nutzen existierende Pakete aus `package.json`. WhatsApp wird per `fetch()` zur Cloud API aufgelöst — kein SDK nötig.

---

## Phase 1 — "Erste Hilfe" (Wochen 1–3, ~35h)

### Modul 1.1: iCal/Calendar-Export (QB, 8h)

**Was**: Admins und Mitglieder können Events als `.ics` herunterladen oder den gesamten Kalender abonnieren.

**Neue Dateien**:
- `src/lib/ical/generator.ts` — `generateICal(event)` und `generateCalendarFeed(events)` — reiner String-Generator nach RFC 5545
- `src/app/dashboard/calendar/ical/route.ts` — GET-Route: `?eventId=X` für Einzelexport, ohne Parameter für Gesamtkalender (Content-Type: `text/calendar`)

**Betroffene Dateien**:
- `src/features/calendar/components/CalendarGrid.tsx` — Neuer Button "Zum Kalender hinzufügen" / "Kalender abonnieren"
- `src/app/clubs/[slug]/termine/page.tsx` — Gleicher Button auf öffentlicher Terminseite

**UI**:
- Button mit Dropdown: "Einladung herunterladen (.ics)" | "Gesamten Kalender abonnieren"
- Bei "Abonnieren": Kopierbarer URL-Link + Anleitungstext für Apple/Google/Outlook

**Datenfluss**:
```
CalendarGrid (Client) → fetch(/dashboard/calendar/ical?eventId=X) → 
ical/generator.ts → Response(text/calendar)
```

**Fehlerfälle**: Ungültige eventId → 404. Kein Event → 204. Generierungsfehler → 500 mit Log.

---

### Modul 1.2: E-Mail-Vorlagen + Personalisierung (QB, 10h)

**Was**: Admins wählen Vorlagen statt jede Mail manuell zu schreiben. Platzhalter `{{Vorname}}` werden pro Empfänger ersetzt.

**Neue Dateien**:
- `src/features/kommunikation/components/template-selector.tsx` — Dropdown "Vorlage wählen", befüllt Betreff + Body
- `src/lib/email/placeholder-replacer.ts` — `replacePlaceholders(template, member)` — ersetzt `{{Vorname}}`, `{{Nachname}}`, `{{DWZ}}`, `{{Team}}`, `{{Rolle}}`

**Betroffene Dateien**:
- `src/lib/email/templates.ts` — Erweitern um: `welcomeTemplate()`, `paymentReminderTemplate()`, `tournamentInviteTemplate()`, `genericAnnouncementTemplate()`
- `src/app/dashboard/kommunikation/mail-form.tsx` — Template-Auswahl einbinden, Empfängeranzahl live anzeigen
- `src/app/dashboard/kommunikation/page.tsx` — Seite übergibt Template-Daten an Form
- `src/features/kommunikation/actions.ts` — `sendMail()` ersetzt Platzhalter vor Versand

**Vorlagen**:
| Name | Betreff | Platzhalter |
|---|---|---|
| Willkommensmail | "Willkommen im [Verein]!" | `{{Vorname}}` |
| Beitragserinnerung | "Erinnerung: Mitgliedsbeitrag fällig" | `{{Vorname}}`, `{{Nachname}}` |
| Turniereinladung | "Einladung zum [Turnier]" | `{{Vorname}}`, `{{DWZ}}` |
| Allgemeine Mitteilung | Leer/Beliebig | `{{Vorname}}`, `{{Nachname}}`, `{{Rolle}}` |

**UI-Änderung**: Live-Zähler unter Empfänger-Auswahl: "Diese E-Mail wird an **47** Mitglieder gesendet."

**Datenfluss**:
```
MailForm → TemplateSelector (ändert Betreff/Body) → User klickt "Senden" →
sendMail() → replacePlaceholders() pro Mitglied → SMTP via Nodemailer
```

**Fehlerfälle**: Ungültiger Platzhalter bleibt unverändert (kein Fehler). SMTP-Fehler → Toast mit Fehler + Anzahl bereits gesendeter Mails.

---

### Modul 1.3: Bulk-Select-Fundament (S, 12h)

**Was**: Checkboxen in der Mitgliedertabelle + Aktionsleiste. In Phase 1 nur UI, Server-Actions kommen in Phase 2.

**Neue Dateien**:
- `src/features/members/components/bulk-action-bar.tsx` — Client-Komponente: Fixierte Leiste am unteren Rand mit "X ausgewählt" + Aktions-Dropdown (disabled in Phase 1, aktiv in Phase 2)

**Betroffene Dateien**:
- `src/features/members/components/members-table.tsx` — Checkbox-Spalte hinzufügen, Auswahl-State (`useState<Set<string>>`), onChange-Prop für Bulk-Action-Bar
- `src/app/dashboard/members/page.tsx` — Bulk-Action-Bar einbinden, State zwischen Table und Bar teilen

**UI**:
- Checkbox ganz links in Tabellenkopf (alle/nichts) + pro Zeile
- Bulk-Action-Bar: `<Badge>3 ausgewählt</Badge>` + `<Button disabled variant="outline">Aktion ausführen</Button>`
- In Phase 1: Button zeigt Tooltip "Demnächst verfügbar"

**Datenfluss (Phase 1)**:
```
MembersTable (Client) → checkbox onChange → Set<string> im Page-Client-State →
BulkActionBar liest count + selectedIds → zeigt UI (Buttons disabled)
```

---

## Phase 2 — "Turnier-Revolution" (Wochen 4–7, ~50h)

### Modul 2.1: Matrix-Ergebniseingabe (S, 18h)

**Was**: Statt 63 Einzel-Dialogen bei einem Blitzturnier gibt es eine Matrix-Tabelle: Alle Partien einer Runde auf einen Blick eintragbar.

**Neue Dateien**:
- `src/features/tournaments/components/matrix-result-entry.tsx` — Client-Komponente

**Betroffene Dateien**:
- `src/features/tournaments/actions.ts` — `saveAllRoundResults(tournamentId, round, results[])` Server-Action
- `src/app/dashboard/tournaments/[id]/page.tsx` — Neuer Tab "Schnelleingabe" im Tabs-Array
- `src/lib/validations/tournaments.ts` — Zod-Schema für `matrixResultSchema` (validiert: keine Duplikate, keine Selbstpaarung)

**UI**:
```
Runde: [Dropdown 1..N] [Button: "Paarungen generieren"]

┌─────────┬──────┬──────┬──────┬──────┐
│         │ Schwarz                          │
│ Weiß    │ Max   │ Anna  │ Tom   │ Lisa  │
├─────────┼──────┼──────┼──────┼──────┤
│ Max     │  —   │ 1-0   │ ½-½   │       │
│ Anna    │      │  —    │       │ 0-1   │
│ Tom     │      │       │  —    │       │
│ Lisa    │ 1-0   │       │       │  —    │
└─────────┴──────┴──────┴──────┴──────┘

[Speichern]
```

**Zellen**: Klick zyklisch: Leer → 1-0 → ½-½ → 0-1 → Leer. Farbcodiert (grün/grau/rot). Diagonale gesperrt.

**Datenfluss**:
```
MatrixResultEntry → user clicks cells → local state [{whiteId, blackId, result}] →
"Speichern" → saveAllRoundResults(tournamentId, round, results) → 
DB insert games → invalidate queries → Tabelle aktualisiert
```

**Fehlerfälle**: 
- Doppelte Paarung → Toast "Spieler X spielt bereits in Runde Y"
- Selbstpaarung → Zelle bleibt gesperrt (nicht klickbar)
- DB-Fehler → Toast mit Fehlermeldung, lokaler State bleibt erhalten

---

### Modul 2.2: Bulk-Operations Fertigstellung (S, 8h)

**Was**: Die in Phase 1 vorbereitete Bulk-Action-Bar wird funktional.

**Neue Dateien**:
- `src/lib/actions/bulk-members.ts` — Server-Actions:
  - `updateMemberStatusBulk(memberIds, newStatus)` — mit Audit-Log
  - `assignContributionRateBulk(memberIds, rateId)` — mit Validierung
  - `assignRoleBulk(memberIds, newRole)` — nur für Vorstand/Admin

**Betroffene Dateien**:
- `src/features/members/components/bulk-action-bar.tsx` — Buttons aktivieren, Dropdown-Menü mit Aktionen, `useTransition` für Loading-State

**UI**:
```
[3 ausgewählt]  [Status ändern ▾]  [Tarif zuweisen ▾]  [Abbrechen]
                  → Aktiv
                  → Passiv
                  → Ehrenmitglied
```

Bei Klick: Konfirmations-Dialog mit Vorschau ("Max Mustermann, Anna Schmidt → Status: Passiv"). Dann `useTransition` Loading + Toast "3 Mitglieder aktualisiert".

**Fehlerfälle**:
- Berechtigungsfehler pro Mitglied → Toast listet Erfolge + Fehler einzeln
- Teilweiser DB-Fehler → Rollback vermeiden, stattdessen Success/Error-Liste

---

### Modul 2.3: Turnier-Templates (QB, 10h)

**Was**: "Vereinsmeisterschaft 2026" mit 2 Klicks aus Vorlage erstellen.

**Neue Dateien**:
- `src/features/tournaments/components/tournament-template-dialog.tsx` — Modal mit Vorlagen-Auswahl
- `src/lib/data/tournament-templates.ts` — Objekt mit 3 Vorlagen

**Betroffene Dateien**:
- `src/app/dashboard/tournaments/new/page.tsx` — Button "Aus Vorlage erstellen" + Template-Dialog

**Vorlagen**:
| Vorlage | Typ | Runden | Bedenkzeit | Beschreibung |
|---|---|---|---|---|
| Vereinsmeisterschaft | swiss | 7 | 90min+30s | Standard-Jahresturnier |
| Blitz-Turnier | blitz | 13 | 3min+2s | Schnelles Abendturnier |
| Schnellschach-Open | rapid | 5 | 15min+10s | Offenes Monatsturnier |

**Datenfluss**:
```
TurnierNeu → "Aus Vorlage" Button → TemplateDialog → Auswahl →
Template-Daten in Formularfelder schreiben (setValue) → User bearbeitet + speichert
```

---

### Modul 2.4: Einnahmen-Prognose Dashboard (QB, 8h)

**Was**: Kassenwart sieht auf einen Blick die erwarteten Jahreseinnahmen.

**Neue Dateien**:
- `src/lib/queries/revenue-forecast.ts` — `getRevenueForecast(clubId)` — summiert `contribution_rates.amount * Mitglieder mit diesem Tarif und Status 'aktiv'`

**Betroffene Dateien**:
- `src/features/dashboard/pages/kassenwart-dashboard.tsx` — Neue Card-Komponente

**UI**:
```
┌──────────────────────────────────────┐
│ Erwartete Jahreseinnahmen            │
│ 4.320,00 €                           │
│ ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐ │ (Mini-Balken pro Monat)
│ │J │F │M │A │M │J │J │A │S │O │N │D │ │
│ └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘ │
│ 360 € / Monat bei 24 aktiven Mitgliedern│
└──────────────────────────────────────┘
```

---

## Phase 3 — "Dashboard wird Cockpit" (Wochen 8–10, ~35h)

### Modul 3.1: Dashboard-Quick-Actions (S, 14h)

**Was**: Jede Rollen-Variante des Dashboards bekommt 2-3 Inline-Aktionen, die ohne Seitenwechsel funktionieren.

**Neue Dateien**:
- `src/features/dashboard/components/quick-actions-bar.tsx` — Client: zeigt rollen-abhängige Buttons
- `src/features/dashboard/components/inline-availability.tsx` — Client: Verfügbarkeit Ja/Nein/Vielleicht per Button-Gruppe

**Betroffene Dateien**:
- `src/features/dashboard/pages/mitglied-dashboard.tsx` — Inline-Availability + "Nächstes Spiel ansehen"
- `src/features/dashboard/pages/trainer-dashboard.tsx` — "Training heute: Teilnehmerliste" Link + "Neues Training anlegen"
- `src/features/dashboard/pages/kassenwart-dashboard.tsx` — "Offene Zahlungen anmahnen" Button (1-Klick) + "Zahlung erfassen"
- `src/features/dashboard/pages/sportwart-dashboard.tsx` — DWZ-Sync Button (bestehend, prominent) + "Neuen Spieltag ansetzen"
- `src/features/dashboard/pages/vorstand-dashboard.tsx` — "Neue Mitteilung an alle" Link + "Neue Veranstaltung"
- `src/features/dashboard/pages/jugendwart-dashboard.tsx` — "Eltern benachrichtigen" + "Jugend-Training planen"
- `src/features/dashboard/pages/eltern-dashboard.tsx` — "Mein Kind: Verfügbarkeit melden"

**Jede Aktion**:
- Ist ein `form action={serverAction}` oder `<Link>` zu existierenden Seiten
- Kein neuer Server-Endpoint nötig, nur bestehende Actions/Seiten verlinkt
- Bei server actions: `useFormStatus` für Loading-Spinner, Toast nach Erfolg

---

### Modul 3.2: Schnellpost / Ankündigungs-Banner (QB, 12h)

**Was**: Vorstand kann mit einem Formular ein Banner auf der Club-Startseite setzen — ohne CMS-Seite bauen zu müssen.

**Neue DB-Tabelle** (via InsForge):
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info',           -- 'info', 'warning', 'success'
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Neue Dateien**:
- `src/lib/actions/announcements.ts` — `createAnnouncement()`, `deactivateAnnouncement()`, `getActiveAnnouncements(clubId)`
- `src/lib/validations/announcements.ts` — Zod-Schema
- `src/features/cms/blocks/announcement-banner.tsx` — Neuer Block-Typ für CMS (optional)
- `src/features/dashboard/components/announcement-bar.tsx` — Admin-Banner im Dashboard: "Keine aktive Ankündigung" → "Ankündigung erstellen"-Dialog

**Betroffene Dateien**:
- `src/app/clubs/[slug]/page.tsx` — Lädt `getActiveAnnouncements()` und rendert Banner oben
- `src/features/cms/components/editor/block-renderer.tsx` — Neuen Block-Typ registrieren
- `src/lib/store/editor-store.ts` — `type Block` erweitern um `announcement`

**UI**:
```
┌─────────────────────────────────────────────────────────┐
│ 🔔 ⚡ Trainingsausfall morgen (16.12.) — Heizungsdefekt │  [✕]
└─────────────────────────────────────────────────────────┘
```

**Admin-Dialog**:
```
┌──────────────────────────────┐
│ Neue Ankündigung            │
│ Titel: [Trainingsausfall...]│
│ Text:  [Heizungsdefekt...]  │
│ Typ:   [Info ▾]             │
│ Gültig bis: [16.12.2024   ] │
│        [Veröffentlichen]    │
└──────────────────────────────┘
```

---

### Modul 3.3: CMS Live-Vorschau Grundgerüst (S, Start — 6h)

**Was**: Split-View im CMS-Editor: Links Blöcke bearbeiten, rechts Vorschau. In Phase 3 nur Layout + manueller "Vorschau aktualisieren"-Button. In Phase 4 automatisch.

**Betroffene Dateien**:
- `src/features/cms/components/editor/editor-shell.tsx` — Layout auf `flex` mit zwei Panels umbauen
- `src/features/cms/components/editor/block-renderer.tsx` — `PreviewRenderer`-Modus (read-only, keine Edit-Overlays)

**UI Layout**:
```
┌──────────────────────┬──────────────────────┐
│ Editor (links, 50%)  │ Vorschau (rechts, 50%)│
│                      │                       │
│ + Block hinzufügen   │  [Mobile ▾] [Akt.]   │
│ ┌──────────────────┐ │ ┌──────────────────┐ │
│ │ ▸ Hero-Block     │ │ │                  │ │
│ │ ▸ Text-Block     │ │ │  Wie es live     │ │
│ │ ▸ Bild-Block     │ │ │  aussieht...    │ │
│ └──────────────────┘ │ │                  │ │
│                      │ └──────────────────┘ │
│ [Speichern]          │                      │
└──────────────────────┴──────────────────────┘
```

**Phase 3 Status**: Button "Aktualisieren" muss manuell geklickt werden — Preview updated aus gespeicherten Daten, nicht aus Dirty State.

---

## Phase 4 — "Finanz-Finish" (Wochen 11–14, ~45h)

### Modul 4.1: DATEV/CSV-Export (S, 12h)

**Was**: Kassenwart exportiert Zahlungen als DATEV-kompatibles CSV und importiert es in seine Buchhaltung.

**Neue Dateien**:
- `src/lib/export/datev-csv.ts` — `generateDatevCSV(payments, config)` — generiert DATEV-CSV-Header + Datenzeilen
- `src/lib/export/datev-config.ts` — Standard-DATEV-Feldzuordnung + `getClubDatevConfig(clubId)` für benutzerdefinierte Zuordnung
- `src/app/dashboard/finance/export/route.ts` — POST-Route: Body `{paymentIds, format: 'datev-csv'}` → Response `text/csv`

**Betroffene Dateien**:
- `src/features/finance/components/payments-overview.tsx` — "Exportieren"-Button (Dropdown: DATEV CSV | Standard CSV)

**DATEV-CSV-Format** (13 Pflichtfelder + variable Wahlfelder):
```
Umsatz;Buchungstag;Belegdatum;Sollkonto;Habenkonto;Betrag;Buchungstext;...
```

**Fehlerfälle**:
- Leere Zahlungsliste → Toast "Keine Zahlungen zum Exportieren"
- Konfigurationsfehler → Toast "DATEV-Einstellungen unvollständig. Bitte unter Finanzen → Einstellungen konfigurieren."

---

### Modul 4.2: CMS Live-Vorschau Fertigstellung (S, 6h)

**Was**: Vorschau aktualisiert sich automatisch via debounced save + Zustand-Listener.

**Betroffene Dateien**:
- `src/features/cms/components/editor/editor-shell.tsx` — `useEffect` auf `blocks` im Editor-Store → alle 2s Debounce → POST an `/api/pages/preview` → Response als HTML → in iframe rendern
- Neu: `src/app/api/pages/preview/route.ts` — Rendert Blöcke ohne Speichern als HTML zurück

**Alternativer Ansatz (einfacher)**: Client-seitiger Preview-Renderer teilt den selben `editor-store`. Keine API-Route nötig. Block-Änderungen → React re-rendert Preview-Panel automatisch.

Entscheidung fällt in Implementierung nach Test beider Ansätze auf Performance.

---

### Modul 4.3: Automatische Zahlungserinnerung (QB, 10h)

**Was**: Der Kassenwart kann überfällige Zahlungen mit einem Klick anmahnen (E-Mail) oder einen Cron-Job dafür einrichten.

**Neue Dateien**:
- `src/lib/jobs/payment-reminders.ts` — `sendPaymentReminders(clubId)` — findet überfällige `payments WHERE status = 'overdue' AND dunning_sent_at IS NULL`, sendet E-Mail via `template: paymentReminderTemplate`, setzt `dunning_sent_at`

**Betroffene Dateien**:
- `src/features/finance/components/payments-overview.tsx` — "Überfällige anmahnen"-Button
- `src/features/finance/actions.ts` — `sendDunningBatch(clubId)` Server-Action

**UI**: Button zeigt Zahl der überfälligen Zahlungen an: "5 überfällig — jetzt anmahnen"

**Cron**: Eintrag in `src/app/api/cron/` als optionaler Endpoint, der periodisch (z.B. wöchentlich) aufgerufen wird.

---

### Modul 4.4: CMS-Seiten-Navigation (QB, 10h)

**Was**: Admin kann das Menü der öffentlichen Club-Website selbst zusammenstellen.

**Neue Dateien**:
- `src/features/cms/components/navigation-editor.tsx` — Client: Drag & Drop Liste der sichtbaren Seiten mit Reihenfolge
- `src/lib/actions/navigation.ts` — `saveNavigation(clubId, pageIds[])` und `getNavigation(clubId)`

**Betroffene Dateien**:
- `src/components/public/Navbar.tsx` — Liest `getNavigation()` statt hartcodiertem Menü
- `src/app/dashboard/pages/page.tsx` — Neuer Button "Menü bearbeiten" → Navigation-Editor

**UI**:
```
┌──────────────────────────────┐
│ Menü bearbeiten             │
│ ☰ Über uns            [✕]  │
│ ☰ Mannschaften        [✕]  │
│ ☰ Termine             [✕]  │
│ ☰ Turniere            [✕]  │
│ ☰ Kontakt             [✕]  │
│ + Seite hinzufügen ▾       │
│        [Speichern]          │
└──────────────────────────────┘
```

---

## Phase 5 — "Kommunikation & Admin-Tools" (Wochen 15–18, ~50h)

### Modul 5.1: E-Mail-Anhänge (QB, 6h)

**Betroffene Dateien**:
- `src/app/dashboard/kommunikation/mail-form.tsx` — File-Upload-Feld (PDF, PNG, JPG, max 10 MB)
- `src/features/kommunikation/actions.ts` — `sendMail()` akzeptiert `attachments: File[]`, speichert in InsForge Storage Bucket, hängt öffentliche URL an

**UI**: "+ Anhang"-Button unter Textarea, zeigt Dateinamen + Größe, "Entfernen"-Button

---

### Modul 5.2: Impersonation-Modus (S, 14h)

**Was**: Super-Admin kann sich als beliebiger Club einloggen, um Support zu leisten.

**Neue Dateien**:
- `src/features/admin/components/impersonate-button.tsx` — Client: Button "Als Verein einloggen" in Super-Admin-Tabelle
- `src/features/admin/components/impersonation-banner.tsx` — Client: Fixiertes gelbes Banner oben: "Sie sind eingeloggt als [Club X]. [Zurück zum Admin]"

**Betroffene Dateien**:
- `src/lib/auth/session.ts` — `createImpersonationSession(userId, clubId)` setzt `impersonation_user_id` + `impersonation_club_id` Cookies (httpOnly, signed)
- `src/proxy.ts` — Middleware erkennt `impersonation_*` Cookies, überschreibt `getSession()` Return
- `src/app/super-admin/page.tsx` — Impersonate-Button pro Club-Zeile
- `src/app/api/auth/impersonate/route.ts` — POST: nimmt `clubId`, setzt Cookies, redirectet zu `/dashboard`
- `src/app/api/auth/unimpersonate/route.ts` — POST: löscht Cookies, redirectet zu `/super-admin`

**Sicherheit**:
- Nur Super-Admins (via `SUPER_ADMIN_EMAILS` env) können impersonieren
- Impersonation-Cookies sind signiert (AES-256-GCM wie bestehendes IBAN-Handling)
- Audit-Log: `audit_log` Eintrag: `action='impersonation_start'`, `entity='auth'`, `changes={targetClubId, adminId}`
- Banner ist nicht wegklickbar solange impersonation aktiv

**Datenfluss**:
```
SuperAdminDashboard → ImpersonateButton → POST /api/auth/impersonate {clubId} →
Server setzt Cookies → redirect /dashboard →
Middleware prüft impersonation_cookies → getSession() gibt Zielclub → 
Dashboard rendert als ob der Club-Admin eingeloggt ist →
ImpersonationBanner permanent sichtbar → Unimpersonate Button → 
POST /api/auth/unimpersonate → Cookies gelöscht → redirect /super-admin
```

---

### Modul 5.3: WhatsApp Cloud API Integration (S, 18h)

**Was**: Kommunikations-Seite bekommt einen "Auch per WhatsApp senden"-Toggle.

**Neue Dateien**:
- `src/lib/messaging/whatsapp.ts` — `sendWhatsAppBroadcast(clubId, recipients, templateName, params)` — ruft WhatsApp Cloud API
- `src/app/api/webhooks/whatsapp/route.ts` — Webhook-Endpunkt für Status-Updates (optional)

**Betroffene Dateien**:
- `src/app/dashboard/kommunikation/page.tsx` — Neuer Toggle
- `src/features/kommunikation/actions.ts` — `sendBroadcast()` dispatcht sowohl E-Mail als auch WhatsApp
- `src/lib/billing/features.ts` — WhatsApp als Teil des "Kommunikation"-Addons gaten

**WhatsApp Template Messages (Nur Templates, kein Freitext!)**:
1. `verein_ankuendigung` — "Hallo {{1}}, eine Mitteilung vom {{2}}: {{3}}"
2. `turnier_erinnerung` — "Hallo {{1}}, morgen um {{2}} ist {{3}}. Nicht vergessen!"
3. `training_ausfall` — "Hallo {{1}}, das Training am {{2}} fällt aus. Grund: {{3}}"

**Datenfluss**:
```
MailForm → WhatsApp-Toggle aktiv → "Senden" →
sendBroadcast() → sendMail() + sendWhatsAppBroadcast() (parallel) →
WhatsApp Cloud API (POST graph.facebook.com/v21.0/{phoneId}/messages) →
Success/Error → Toast anzeigen
```

**Konfiguration**: WhatsApp Business Phone ID + Token via Umgebungsvariablen `WHATSAPP_PHONE_ID`, `WHATSAPP_TOKEN`. Keine UI-Konfiguration in Phase 5.

**Fehlerfälle**:
- WhatsApp API nicht konfiguriert → Toggle grau/disabled mit Tooltip "WhatsApp noch nicht konfiguriert"
- API-Fehler → Toast "WhatsApp-Versand fehlgeschlagen. E-Mail wurde gesendet." (E-Mail unabhängig)

---

### Modul 5.4: Feature-Flag-System (QB, 6h)

**Was**: Super-Admin kann neue Features pro Club ein-/ausschalten.

**Neue Dateien**:
- `src/lib/feature-flags.ts` — Enum aller Flags + `isEnabled(flag, clubId)` Funktion
- `src/app/api/admin/feature-flags/route.ts` — GET/POST für Super-Admin

**Betroffene Dateien**:
- `src/app/super-admin/page.tsx` — Neues Tab "Feature-Flags"

**Initiale Flags**:
| Flag | Beschreibung | Default |
|---|---|---|
| `whatsapp_integration` | WhatsApp Broadcast | false (pro Club nach Konfiguration) |
| `matrix_tournament_input` | Matrix-Ergebniseingabe | true |
| `bulk_member_operations` | Bulk-Operationen bei Mitgliedern | true |
| `datev_export` | DATEV-CSV Export | true |
| `live_tournament_ticker` | Live-Ticker (Phase 6+) | false |

**Speicherung**: Einfaches JSON-Feld in `clubs` Tabelle: `feature_flags JSONB DEFAULT '{}'`.

**UI** (Super-Admin):
```
┌─────────────────────────────────────────┐
│ Feature-Flags                           │
│ Club: [SV Musterhausen ▾]              │
│ ☑ Matrix-Ergebniseingabe               │
│ ☑ Bulk-Mitglieder-Operationen          │
│ ☑ DATEV-Export                         │
│ ☐ WhatsApp-Integration                 │
│ ☐ Live-Turnier-Ticker                  │
│              [Speichern]                │
└─────────────────────────────────────────┘
```

---

## Phase 6 — Polishing (Wochen 19–20, ~25h)

### Quick-Fixes (16h)

| Fix | Aufwand |
|---|---|
| Duplikat-Check beim CSV-Import: Hash aus Vor- + Nachname + Geburtsdatum, Warn-Dialog bei Kandidaten | 4h |
| DWZ-Schnitt pro Brett in Mannschafts-Detailseite: `AVG(dwz) WHERE board IN (1..4)` | 4h |
| Turnier-Paarungs-Druckansicht: Print-CSS für Paarungstabelle (klassisches Aushang-Format) | 4h |
| "Heute"-Button prominent im Kalender (neben Monatsnavigation, als `Button variant="outline"`) | 2h |
| Eltern-Dashboard: "Meine Kinder"-Widget (Liste verknüpfter Kinder mit Status, nächstem Event) | 4h |

### Tests (5h)

- E2E-Test: Bulk-Status-Änderung (Playwright) — `e2e/bulk-operations.spec.ts`
- E2E-Test: Matrix-Eingabe (Playwright) — `e2e/matrix-input.spec.ts`
- E2E-Test: Impersonation-Flow — `e2e/impersonation.spec.ts`

### Responsive-Check (4h)

- Alle neuen Komponenten auf Mobile/Tablet prüfen
- Matrix-Eingabe auf Mobile: horizontales Scrollen + fixierte erste Spalte
- Bulk-Action-Bar auf Mobile: vereinfachte Darstellung

---

## Teststrategie

### Pro Modul

| Test-Typ | Abdeckung |
|---|---|
| Unit-Tests (Vitest) | `lib/ical/generator.ts`, `lib/email/placeholder-replacer.ts`, `lib/export/datev-csv.ts`, `lib/messaging/whatsapp.ts`, `lib/feature-flags.ts` |
| Integration (Vitest + Test-DB) | Bulk-Actions, Zahlungserinnerung, Announcement-CRUD |
| E2E (Playwright) | Matrix-Eingabe, Impersonation-Flow, Bulk-Operations |

### Generelle Regeln

- Alle Server-Actions bekommen Validierung via Zod vor DB-Operation
- Alle DB-Mutationen loggen in `audit_log`
- Alle neuen API-Routen haben `rateLimit()` aus `lib/rate-limit.ts`

---

## Risiken

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| WhatsApp Cloud API ändert sich | Mittel | Abstraktion in `lib/messaging/whatsapp.ts`, nur eine Datei anpassen |
| Bulk-Ops auf 200+ Mitglieder performant? | Gering | Batch-Inserts (25 pro DB-Call), Progress-Indikator |
| CMS Live-Vorschau Performance | Mittel | Client-seitiger Renderer zuerst, iframe-Ansatz als Fallback |
| InsForge SDK-Migration kollidiert mit neuen Features | Mittel | Alle neuen DB-Operationen nutzen bereits InsForge-SDK-Patterns, keine Drizzle-Referenzen |

## Offene Fragen

- WhatsApp: Eigene Telefonnummer für den Verein nötig? Ja — muss in Business-Portal registriert werden, ist Admin-Aufgabe außerhalb der Plattform.
- Sollen Mitglieder ihre eigene Handynummer für WhatsApp im Profil hinterlegen können? Ja — neues optionales Feld `phone` in `members`-Tabelle.

---

## Änderungshistorie

| Datum | Änderung |
|---|---|
| 2026-05-03 | Initiale Version |
