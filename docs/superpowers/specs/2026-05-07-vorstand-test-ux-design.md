# Design-Dokument: "Vorstand-Test" UX-Verbesserungen

**Datum:** 2026-05-07  
**Scope:** Inkrementelle UX-Verbesserungen fuer die Zielgruppe Schachvereinsvoraende (55+)

---

## Zusammenfassung

Dieses Design beschreibt vier konkrete UX-Verbesserungen, um die Software fuer die Zielgruppe (Voraende 55+) besser nutzbar zu machen und die Conversion-Rate der Marketing-Website zu steigern:

1. **Dashboard-Cockpit** – Rollenspezifische "Aufmerksamkeits-Widgets"
2. **Schnelleingabe-Modus** – Mobile-optimierte Turnierergebniserfassung
3. **Mitglied-Wizard** – 3-Schritte statt 20-Felder-Formular
4. **Demo-Modus** – Interaktive Feature-Vorschau ohne Login

---

## 1. Dashboard-Cockpit: Rollenspezifische Aufmerksamkeits-Widgets

### Ziel
Jede Rolle sieht beim Login sofort: "Was erfordert meine Aufmerksamkeit JETZT?"

### Architektur
Wir erweitern getDashboardStats() in src/features/audit/actions.ts um rollenspezifische Aufgaben-Queries. Die Ergebnisse werden in einer neuen AttentionWidget-Komponente angezeigt, die **vor** den Statistiken erscheint.

### Neue Queries pro Rolle

#### Kassenwart
- overduePayments – Zahlungen mit status = 'overdue' AND due_date < NOW()
- upcomingSepaExport – Ausstehende SEPA-Lastschriften fuer naechsten Monat
- unreconciledPayments – Zahlungen ohne Zuordnung

#### Spielleiter
- missingResults – Aktive Turniere mit unvollstaendigen Runden (games.result IS NULL)
- upcomingTournaments – Turniere in den naechsten 7 Tagen ohne Paarungen
- 	eamMatchesWithoutLineup – Mannschaftskaempfe ohne Aufstellung

#### Vorstand
- pendingInvitations – Offene Einladungen (status = 'pending')
- upcomingGeneralMeeting – Naechste Mitgliederversammlung (aus Events)
- membersWithoutPayment – Mitglieder ohne Beitragszahlung > 90 Tage

### UI-Komponente AttentionWidget
- Horizontale Scroll-Liste (mobil) oder Grid (Desktop)
- Jede Karte zeigt: Zahl + Label + CTA-Button
- Farbcodierung:
  - Rot = dringend (>7 Tage ueberfaellig / kritisch)
  - Gelb = bald faellig (<=7 Tage)
  - Gruen = alles erledigt (nur als Bestaetigung anzeigen)
- Direkter Link zur entsprechenden Aktion

### Integration
- Ersetzt/ergaenzt die TodayItems-Komponente in den Dashboards
- Die DashboardData-Typ-Definition wird um ttentionItems: AttentionItem[] erweitert
- AttentionItem-Typ:
  `	ypescript
  type AttentionItem = {
    id: string;
    label: string;
    count: number;
    href: string;
    urgency: 'critical' | 'warning' | 'ok';
    icon: LucideIcon;
    actionLabel: string;
  };
  `

---

## 2. Schnelleingabe-Modus fuer Turniere

### Ziel
Ergebniserfassung in <30 Sekunden pro Partie, funktioniert auf dem Smartphone, offline-faehig.

### Architektur
Das bestehende MatrixResultEntry wird erweitert und in die Turnier-Detailseite integriert. Wir nutzen den bereits vorhandenen saveAllRoundResults Server Action.

### Verbesserungen am MatrixResultEntry

#### Touch-Optimierung
- Zellen mindestens 44x44px fuer iOS/Android Accessibility
- Groessere Touch-Ziele, keine dicht gepackten kleinen Zellen auf Mobilgeraeten

#### Offline-Support
- Ergebnisse werden zuerst in localStorage gespeichert (Key: 	ournament-results--)
- Bei Netzwerkverfuegbarkeit automatische Synchronisierung
- Visualisierung des Sync-Status (gruener Punkt = gespeichert, grau = lokal)

#### Schnellzugriff
- Große Buttons statt Zellen-Klick: "1-0", "Remis", "0-1" als Floating Action Bar
- Wenn ein Spieler angeklickt wird, erscheinen die drei Ergebnis-Buttons als Overlay
- Automatische Paarungsvorschlaege basierend auf Schweizer System

#### Mobile Ansicht
- @media (max-width: 640px): Matrix wird zu einer sortierbaren Liste pro Runde
- Swipe-Gesten zum Wechseln zwischen Runden (links/rechts)
- Automatisches Speichern bei Netzwerk-Verfuegbarkeit

### Neue Route
/dashboard/tournaments/[id]/quick-entry
- Vollbild-Layout, keine Ablenkung
- QR-Code-Scanner Integration (Spieler scannen sich gegenseitig via html5-qrcode)
- Sprachsteuerung (Experimentell): "Spieler A gewinnt" ? Eintrag

---

## 3. Wizard: "Neues Mitglied anlegen"

### Ziel
3-Schritte statt einer ueberwaeltigenden 20-Felder-Seite. Reduziert kognitive Belastung fuer Voraende 55+.

### Architektur
Der bestehende MemberForm wird in einen MemberWizard umgewandelt. Der Form-State bleibt ueber eact-hook-form mit zodResolver erhalten, aber die Felder werden in drei Schritte aufgeteilt. Zwischenspeicherung in sessionStorage.

### Schritt 1: Stammdaten (6 Felder, alle Pflicht)
- Vorname
- Nachname
- E-Mail
- Telefon
- Geburtsdatum
- Geschlecht

### Schritt 2: Status & Beitrag (4 Felder)
- Rolle im System (Dropdown: Mitglied, Trainer, Spielleiter, etc.)
- Mitgliedsstatus (Aktiv / Inaktiv / Ehrenmitglied / Ausgetreten)
- Beitragsstufe (aus contributionRates, dynamisch geladen)
- Eintrittsdatum (Default: heute)

### Schritt 3: Einladung & Finalisierung (3 Felder + CTA)
- Automatische E-Mail-Einladung (Checkbox, default: true)
- Zusammenfassung aller eingegebenen Daten (editierbar inline)
- "Mitglied anlegen" Button mit Lade-Animation

### UI-Pattern
- Fortschrittsbalken oben: Schritt 1/3 ? 2/3 ? 3/3
- "Zurueck"-Button nur in Schritt 2 und 3
- Validierung pro Schritt: Kein "Weiter" bei Fehlern
- In Schritt 3 koennen alle Daten inline bearbeitet werden, ohne zurueckzuspringen
- Zwischenspeicherung in sessionStorage (Key: member-wizard-draft)
- Bei erneutem Oeffnen: "Moechten Sie Ihren Entwurf fortsetzen?"

### Zusatz: DWZ-Import
- Suche nach Name im DeWIS
- Autofill von DWZ, DWZ-ID bei Treffer
- Optional, nicht blockierend

---

## 4. Demo-Modus fuer Marketing-Website

### Ziel
Interessierte Vereine koennen Features ohne Login erleben ? Conversion-Steigerung.

### Architektur
Neue Route /demo im (marketing) Layout. Wir nutzen den bestehenden MiniManager als Basis und erweitern ihn zu einem interaktiven Walkthrough.

### Demo-Konzept "SC Musterhausen"
- Fiktiver Verein mit 42 Mitgliedern, 3 Mannschaften, 1 Turnier
- Alle Dashboard-Ansichten sind klickbar, aber Daten sind statisch (hardcoded)
- Tooltips erklaeren Features beim ersten Besuch
- "Jetzt kostenlos starten"-CTA permanent sichtbar

### Interaktive Elemente
- **Dashboard:** Stats-Cards klickbar (zeigt Detail-Tooltips)
- **Mitglieder:** Suchfeld funktioniert (Client-Side Filter auf statischer Liste)
- **Turniere:** Matrix-Eingabe simuliert (nur UI, kein Server-Call)
- **Finanzen:** SEPA-Export-Button zeigt Vorschau-Modal
- **Kommunikation:** E-Mail-Vorschau mit Platzhaltern

### Barrierefreiheit
- Demo ist vollstaendig Tastatur-navigierbar
- Screenreader-Anmerkungen: "Dies ist eine Demo, Daten sind fiktiv"
- Kontrast und Lesbarkeit gemaess BFSG 2025
- Keine Animationen, die die Nutzung blockieren

### Tracking
- localStorage-Flag demoCompleted speichert, ob User die Demo durchlaufen hat
- Bei Abschluss: Personalisierter CTA-Text "Sie haben die Demo gesehen – bereit fuer Ihren Verein?"
- Einfache Event-Tracking (nur console.log oder Vercel Analytics, keine Cookies)

---

## Datenbank-Aenderungen

### announcements Tabelle (aus bestehendem Plan)
Bereits geplant, wird fuer Cockpit-Notifications genutzt.

### payments Tabelle
Bereits existent, keine Aenderung noetig.

### Neue Queries (keine Schema-Aenderungen)
Alle Cockpit-Daten kommen aus bestehenden Tabellen (payments, 	ournaments, games, invitations, events).

---

## Komponenten-Checkliste

### Neue Komponenten
- [ ] src/features/dashboard/components/attention-widget.tsx
- [ ] src/features/dashboard/components/attention-card.tsx
- [ ] src/features/members/components/member-wizard.tsx
- [ ] src/app/(marketing)/demo/page.tsx
- [ ] src/components/marketing/demo-manager.tsx (erweitert MiniManager)

### Modifizierte Komponenten
- [ ] src/features/audit/actions.ts – Neue rollenspezifische Queries
- [ ] src/features/dashboard/pages/vorstand-dashboard.tsx
- [ ] src/features/dashboard/pages/kassenwart-dashboard.tsx
- [ ] src/features/dashboard/pages/spielleiter-dashboard.tsx
- [ ] src/features/tournaments/components/matrix-result-entry.tsx – Touch-Optimierung
- [ ] src/app/dashboard/tournaments/[id]/page.tsx – Schnelleingabe-Tab
- [ ] src/app/dashboard/members/new/page.tsx – Wizard statt Formular
- [ ] src/components/marketing/mini-manager.tsx – Demo-Integration

### Neue Routen
- [ ] /demo – Oeffentlicher Demo-Modus
- [ ] /dashboard/tournaments/[id]/quick-entry – Mobile Schnelleingabe

---

## Rollout-Plan

### Phase 1 (Sofort): Dashboard-Cockpit
- AttentionWidget bauen
- getDashboardStats erweitern
- In alle 7 Rollen-Dashboards integrieren

### Phase 2 (Danach): Schnelleingabe
- MatrixResultEntry touch-optimieren
- Mobile Ansicht bauen
- localStorage-Offline-Support

### Phase 3 (Danach): Mitglied-Wizard
- MemberForm in 3 Schritte aufteilen
- sessionStorage-Zwischenspeicherung
- Inline-Edit in Zusammenfassung

### Phase 4 (Danach): Demo-Modus
- /demo-Route erstellen
- MiniManager erweitern
- Tooltips und Walkthrough hinzufuegen

---

## Akzeptanzkriterien

### Dashboard-Cockpit
- [ ] Kassenwart sieht sofort Anzahl ueberfaelliger Zahlungen
- [ ] Spielleiter sieht sofort fehlende Turnierergebnisse
- [ ] Vorstand sieht sofort offene Einladungen
- [ ] Alle Widgets haben direkten Link zur Aktion
- [ ] Mobile: Horizontales Scrollen funktioniert

### Schnelleingabe
- [ ] Ergebniseingabe auf Smartphone in <30 Sekunden
- [ ] Touch-Ziele mindestens 44x44px
- [ ] Offline: Daten bleiben nach Browser-Schliessen erhalten
- [ ] Automatische Synchronisierung bei Netzwerk

### Mitglied-Wizard
- [ ] Maximal 6 Felder pro Schritt
- [ ] Kein Datenverlust bei Browser-Schliessen
- [ ] Inline-Bearbeitung in Zusammenfassung funktioniert
- [ ] DWZ-Autofill bei Suche

### Demo-Modus
- [ ] Kein Login erforderlich
- [ ] Alle Hauptfeatures sichtbar
- [ ] Tastatur-navigierbar
- [ ] CTA fuehrt zu Registrierung
- [ ] Tracking speichert Abschluss-Status

---

## Referenzen

- Bestehender Plan: docs/superpowers/plans/2026-05-03-admin-verbesserungen.md
- Matrix-Komponente: src/features/tournaments/components/matrix-result-entry.tsx
- MiniManager: src/components/marketing/mini-manager.tsx
- Dashboard-Queries: src/lib/queries/dashboard.ts
- Audit Actions: src/features/audit/actions.ts

---

*Dieses Design wurde erstellt am 2026-05-07 und reflektiert den aktuellen Stand der Codebase.*

