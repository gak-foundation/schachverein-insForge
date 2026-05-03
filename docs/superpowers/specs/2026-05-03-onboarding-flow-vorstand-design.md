# Onboarding-Flow für den Administrator (Vorstand)

## Ziel

Der Onboarding-Flow führt einen neuen Nutzer (Vorstand/Administrator eines Schachvereins) durch die Ersteinrichtung der Plattform. Der Fokus liegt auf einer schlanken, aber vollständigen Ersterfahrung.

## Schritte

```
Welcome → Verein anlegen → Einladungen → [Termin ⏭️ überspringbar] → Finished
```

### 1. Welcome (unverändert)

Begrüßung mit Übersicht über die anstehenden Schritte. Keine Änderungen zum bestehenden Step.

### 2. Verein anlegen (unverändert)

- Vereinsname (required)
- Kontakt E-Mail (optional)
- Stadt & PLZ (optional)
- Erstellt den Club via `createClubAction`
- Setzt den Ersteller als `admin`-Rolle

### 3. Einladungen (NEU)

**UI:**
- Titel "Vorstandskollegen einladen" mit `Users`-Icon
- Erklärungstext: "Lade andere Vorstandsmitglieder per E-Mail ein"
- Dynamische Liste von Einladungszeilen, je mit:
  - E-Mail-Eingabefeld (required)
  - Rollen-Dropdown (Vorstand, Sportwart, Jugendwart, Kassenwart)
  - Entfernen-Button
- "Weiteres Mitglied hinzufügen"-Button
- **"Einladungen senden"** Primary-Button (versendet alle E-Mails + generiert Links)
- **"Überspringen"** Secondary-Button

**Backend:**
- Ruft `createInvitation` auf (existiert in `invitations.ts`)
- Ruft `sendClubInvitationEmail` auf (existiert in `email.ts`)
- Generiert zusätzlich Einladungs-Links zur manuellen Weitergabe
- Nach dem Senden: Liste der versendeten Einladungen mit Status anzeigen

### 4. Termin (angepasst)

- Bestehender Step bleibt fast identisch
- Wird als **optional** markiert mit Badge "Optional"
- Prominenter "Überspringen"-Button
- Titel: "Optional: Erster Vereinsabend"

### 5. Finished (unverändert)

- Erfolgsmeldung mit Vereinsname
- Button führt zum Dashboard
- Ruft `completeOnboardingAction` auf

## Architektur

- Der gesamte Flow bleibt als eine Client-Component in `src/app/onboarding/page.tsx`
- Der neue Einladungs-Step nutzt das existierende `createInvitation` aus `invitations.ts`
- Das Rollen-Dropdown ist auf die Rollen `admin`, `vorstand`, `spielleiter`, `jugendwart`, `kassenwart` beschränkt
- Der Progress-Bar und Schritt-Zähler wird automatisch an die 5 Schritte angepasst

## Datenfluss

```
Welcome → createClubAction → [success] → Einladungen → createInvitation() × N
         → [optional] Termin → createEvent → [success] → Finished → completeOnboardingAction → /dashboard
```

## Abgrenzung

Folgende Features sind NICHT Teil dieses Onboardings und bleiben dem Dashboard vorbehalten:
- Logo-Upload
- DSB-Mitgliederimport
- Manuelle Mitgliederverwaltung
- Club-Website/Pages
- Feingranulare Berechtigungen
