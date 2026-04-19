# FAQ - Häufig gestellte Fragen

## Überblick

Diese FAQ richtet sich an Vereinsvorstände, die eine moderne Softwarelösung für ihren Schachverein suchen. Sie beantwortet Fragen zu Funktionen, Technik, Preisen, Sicherheit und Migration.

---

## 📋 Allgemeine Fragen

### Was ist "schach.studio"?

"schach.studio" ist eine cloudbasierte Software-as-a-Service (SaaS) Plattform, die speziell für die Bedürfnisse von Schachvereinen entwickelt wurde. Sie vereint Mitgliederverwaltung, Turnierorganisation, Partiedatenbank und öffentliche Vereinswebsite in einem modernen System.

### Für welche Vereinsgrößen ist die Software geeignet?

Die Software skaliert von kleinen Vereinen mit 20 Mitgliedern bis zu großen Vereinen mit 500+ Mitgliedern. Alle Funktionen sind unabhängig von der Mitgliederzahl verfügbar.

### Was kostet die Software?

Die Preisgestaltung orientiert sich an der Vereinsgröße:

| Vereinsgröße | Monatlicher Preis | Jahrespreis (2 Monate gratis) |
|--------------|-------------------|-------------------------------|
| Bis 50 Mitglieder | 29 € | 290 € |
| 51–150 Mitglieder | 49 € | 490 € |
| 151–300 Mitglieder | 79 € | 790 € |
| Über 300 Mitglieder | Auf Anfrage | Auf Anfrage |

Alle Preise verstehen sich zzgl. MwSt. Eine 30-tägige kostenlose Testphase ist verfügbar.

### Gibt es eine kostenlose Testversion?

Ja, Sie können die Software 30 Tage lang kostenlos und unverbindlich testen. In dieser Zeit stehen alle Funktionen zur Verfügung. Eine Kreditkarte ist für die Registrierung nicht erforderlich.

### Kann ich mein bestehendes Abo jederzeit kündigen?

Ja, Abos können jederzeit zum Ende der laufenden Periode gekündigt werden. Bei monatlicher Zahlung erfolgt die Kündigung zum Monatsende, bei jährlicher Zahlung zum Ende des Vertragsjahres.

---

## 🎯 Funktionen & Features

### Welche Kernfunktionen sind enthalten?

**Mitgliederverwaltung:**
- Vollständige Mitgliederdatenbank mit Kontaktdaten
- DWZ/Elo-Tracking pro Mitglied
- Rollen und Berechtigungen (Admin, Vorstand, Sportwart, Jugendwart, Kassenwart, Trainer, Mitglied)
- CSV-Import/Export für Migration und Verbandsmeldungen
- Familienverknüpfungen (Eltern-Kind-Zuordnungen)

**Turnierverwaltung:**
- Rundenturniere mit automatischer Paarungsgenerierung
- Schweizer System (über Integration mit bbpPairings/JaVaFo)
- Ergebniserfassung und automatische Ranglisten
- TRF-Import aus SwissChess/ChessResults
- Druckbare Paarungslisten und Ergebnislisten

**Mannschaftskampf:**
- Mannschaftsverwaltung mit Brettreihenfolgen
- Ligabetrieb mit Spieltagen und Saisonübersicht
- Ergebniserfassung pro Brett
- Spielerverfügbarkeit

**Partiedatenbank:**
- Lichess-Integration: Verlinkung von Partien für Analyse
- Export von Turnier-Metadaten im PGN-Format
- Durchsuchbare Partiedatenbank (Spieler, Eröffnung, Ergebnis)
- Verknüpfung von Partien mit Turnieren

**Öffentliche Website:**
- Vereinspräsentation mit Logo und Beschreibung
- Terminkalender für Training und Turniere
- Mannschaftsübersicht und Liga-Zugehörigkeit
- News und Aktuelles
- Impressum und Datenschutz (DSGVO-konform)

**Kommunikation:**
- Rundmails an Gruppen (alle, Mannschaft X, Jugend etc.)
- Benachrichtigungen für Termine und Ergebnisse

### Ist eine Beitragsverwaltung enthalten?

Ja, die Beitragsverwaltung ist in allen Tarifen enthalten:
- Flexible Beitragsmodelle (Erwachsene, Jugend, Familie, Ermäßigt)
- Automatische Zuordnung basierend auf Alter/Status
- Zahlungsstatus pro Mitglied und Jahr
- SEPA-XML-Export für Lastschriftdateien
- Rechnungs-PDF (automatisch erzeugbar)
- Optionale Online-Zahlung via Stripe/Mollie

### Können wir unsere bestehende WordPress-Website ersetzen?

Ja, die Software beinhaltet eine vollständige öffentliche Website, die Ihre bestehende WordPress-Seite ersetzen kann. Alle wichtigen Inhalte (Vorstellung, Termine, Mannschaften, News) können abgebildet werden. Ein Import bestehender Inhalte ist möglich.

### Gibt es eine mobile App?

Die Software ist als Progressive Web App (PWA) verfügbar und kann auf Smartphones und Tablets wie eine native App installiert werden. Sie funktioniert offline-fähig für grundlegende Funktionen wie Ergebniseingabe. Eine native App für iOS/Android ist derzeit nicht geplant.

### Können Mitglieder sich selbst registrieren?

Nein, aus Datenschutzgründen erfolgt die Registrierung nur durch Einladung des Vorstands. Mitglieder erhalten einen Einladungslink per E-Mail und können sich dann mit E-Mail und Passwort registrieren. Optional ist ein Login über Lichess möglich.

### Ist das System mehrsprachig?

Die Oberfläche ist aktuell auf Deutsch verfügbar. Englisch ist in Planung. Bei Bedarf können wir für größere Vereine weitere Sprachen priorisiert implementieren.

---

## 🔒 Sicherheit & Datenschutz

### Wo werden die Daten gespeichert?

Alle Daten werden auf Servern in Deutschland gehostet (Hetzner Cloud). Die Server befinden sich in Rechenzentren mit ISO 27001-Zertifizierung.

### Ist die Software DSGVO-konform?

Ja, die Software wurde mit Fokus auf DSGVO-Anforderungen entwickelt:
- Hosting ausschließlich in der EU (Deutschland)
- Auftragsverarbeitungsverträge (AVV) mit allen Dienstleistern
- Rollen- und Rechtesystem mit granularer Zugriffskontrolle
- Audit-Log zur Protokollierung aller Datenänderungen
- Verschlüsselte Backups
- Löschkonzept mit automatischen Löschfristen
- Einwilligungsverwaltung für Fotos, Newsletter, Ergebnisveröffentlichung
- Getrennte Zugriffsrechte für Jugenddaten (wichtig bei minderjährigen Mitgliedern)
- Datenschutzerklärung auf der öffentlichen Website

### Wie werden Passwörter gespeichert?

Passwörter werden mit bcrypt gehasht und gesalzen gespeichert. Im Produktivbetrieb ist die Zwei-Faktor-Authentifizierung (2FA) für Admin-Rollen verpflichtend.

### Wer hat Zugriff auf die Daten?

Der Zugriff erfolgt über ein rollenbasiertes Berechtigungssystem:
- **Admin**: Vollzugriff auf alle Systemeinstellungen
- **Vorstand**: Vollzugriff auf Vereinsdaten
- **Sportwart**: Turnier- und Mannschaftsverwaltung
- **Jugendwart**: Zugriff auf Jugendmitglieder
- **Kassenwart**: Beitrags- und Finanzdaten
- **Trainer**: Zugriff auf Trainingsgruppen
- **Mitglied**: Eigene Daten, öffentliche Bereiche
- **Eltern-Zugang**: Nur eigene Kinder (bei Jugendspielern)

Jeder Verein verwaltet seine Daten isoliert. Es gibt keinen Zugriff durch andere Vereine oder Dritte.

### Werden Backups erstellt?

Ja, es werden tägliche automatische Backups der Datenbank erstellt. Die Backups werden verschlüsselt gespeichert und 30 Tage vorgehalten. Auf Anfrage kann ein manueller Backup-Export bereitgestellt werden.

### Was passiert mit den Daten bei Kündigung?

Bei Kündigung Ihres Abos erhalten Sie einen vollständigen Datenexport im CSV-Format (Mitglieder, Turniere, Partien). Anschließend werden alle Daten gemäß DSGVO gelöscht, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen.

---

## 🛠️ Technik & Integration

### Welche technischen Voraussetzungen benötigen wir?

Keine. Die Software läuft vollständig im Browser. Sie benötigen lediglich:
- Einen modernen Webbrowser (Chrome, Firefox, Safari, Edge)
- Eine Internetverbindung
- Keine Installation auf einzelnen Rechnern

### Können wir Daten aus unserer alten Software importieren?

Ja, Import-Funktionen sind für folgende Quellen verfügbar:
- **Excel/CSV**: Mitgliederlisten, Kontaktlisten
- **SwissChess/ChessResults**: Turnierdaten via TRF-Format
- **PGN-Dateien**: Import von Metadaten und Lichess-Links aus PGN-Dateien
- **DeWIS**: DWZ-Daten synchronisierbar

Bei speziellen Anforderungen unterstützen wir Sie gerne bei der Migration.

### Gibt es eine Schnittstelle zu Lichess?

Ja, folgende Lichess-Integrationen sind verfügbar:
- Login mit Lichess-Konto (OAuth)
- Verknüpfung von Lichess-Profilen mit Mitgliedern
- Import von Online-Turnierergebnissen (geplant)

### Können wir die Software auf unserem eigenen Server betreiben?

Ja, auf Anfrage ist eine Self-Hosting-Variante als Docker-Container verfügbar. Dies ist besonders für Vereine interessant, die aus Compliance-Gründen die Infrastruktur selbst kontrollieren müssen. Die Self-Hosting-Lizenz ist separat lizenziert.

### Wie oft gibt es Updates?

Die Software wird kontinuierlich weiterentwickelt. Neue Features werden in der Regel alle 2–4 Wochen ausgerollt. Sicherheitsupdates erfolgen umgehend. Downtime während Updates beträgt in der Regel weniger als 5 Minuten.

### Ist das System ausfallsicher?

Die Infrastruktur ist mit automatischem Failover ausgelegt. Die garantierte Verfügbarkeit beträgt 99,5% pro Jahr. Geplante Wartungsfenster werden mindestens 48 Stunden im Voraus angekündigt.

---

## 📞 Support & Schulung

### Wie erreichen wir den Support?

Der Support ist während der Geschäftszeiten (Mo–Fr, 9–17 Uhr) erreichbar:
- E-Mail: support@schach.studio
- Antwortzeit: Innerhalb von 24 Stunden an Werktagen
- Bei dringenden Problemen: Priorisierter Support für größere Vereine

### Gibt es eine Einarbeitung oder Schulung?

Ja, für neue Kunden bieten wir:
- Ausführliche Dokumentation und Video-Tutorials
- Onboarding-Call (30 Minuten) zur Einrichtung
- Auf Anfrage: Individuelle Schulung für den Vorstand (separat berechenbar)

### Können wir Feature-Wünsche einreichen?

Ja, Kunden können jederzeit Feature-Wünsche über das Support-Portal einreichen. Die Umsetzung wird priorisiert basierend auf:
- Anzahl der Anfragen
- Allgemeiner Nutzen für die Zielgruppe
- Technischer Aufwand

Kritische Bugs werden selbstverständlich priorisiert behoben.

---

## 🚀 Migration & Einführung

### Wie lange dauert die Einrichtung?

Die technische Einrichtung ist in weniger als 1 Stunde abgeschlossen:
1. Konto erstellen und Verein anlegen
2. Mitglieder per CSV importieren
3. Einladungsmails versenden
4. Website anpassen (Logo, Beschreibung, Termine)

In der Praxis empfehlen wir 2–4 Wochen für die vollständige Einführung, um dem Vorstand Zeit für die Einarbeitung zu geben.

### Können Mitglieder während der Umstellung parallel weiterarbeiten?

Ja, die Software kann parallel zu bestehenden Systemen betrieben werden. Ein paralleler Betrieb ist für eine Übergangsphase von 1–3 Monaten empfehlenswert.

### Was müssen wir bei der Umstellung beachten?

- **Datenqualität**: Prüfen Sie Ihre bestehenden Mitgliederlisten auf Aktualität
- **Einwilligungen**: Dokumentieren Sie Einwilligungen für Newsletter und Foto-Veröffentlichung
- **Kommunikation**: Informieren Sie Mitglieder frühzeitig über den Wechsel
- **Ansprechpartner**: Benennen Sie 1–2 Personen im Verein, die als Multiplikatoren dienen

### Müssen unsere Mitglieder neue Passwörter erstellen?

Ja, aus Sicherheitsgründen muss jedes Mitglied sein Passwort selbst setzen. Dies erfolgt über den Einladungslink, der per E-Mail versendet wird.

---

## 💳 Zahlung & Vertrag

### Wie kann ich bezahlen?

Die Zahlung erfolgt bequem per:
- SEPA-Lastschrift (monatlich oder jährlich)
- Überweisung (jährlich)
- Kreditkarte (in Planung)

### Gibt es versteckte Kosten?

Nein. Der angegebene Preis beinhaltet alle Funktionen, Hosting, Support und Updates. Es fallen keine zusätzlichen Kosten an.

### Können wir das Abo später upgraden?

Ja, bei Mitgliederzuwachs kann das Abo jederzeit auf die nächste Stufe upgegradet werden. Die Abrechnung erfolgt anteilig pro Monat.

### Gibt es Rabatte für neue Vereine oder Jugendarbeit?

Ja, Vereine mit überwiegend jugendlichen Mitgliedern (>50% unter 18) erhalten 20% Rabatt. Neue Vereine im ersten Gründungsjahr erhalten den ersten Jahrespreis gratis.

---

## ❓ Sonstige Fragen

### Wer entwickelt die Software?

Die Software wird von einem erfahrenen Softwareentwickler mit Schach-Hintergrund entwickelt. Der Fokus liegt auf langfristiger, zuverlässiger Betreuung ohne Venture-Capital-Druck.

### Was passiert, wenn der Anbieter insolvent geht?

Die Software ist als Open-Source-Projekt angelegt. Im unwahrscheinlichen Fall einer Einstellung des Betriebs können Kunden die Software auf eigenen Servern weiterbetreiben (Self-Hosting-Lizenz ist im Abo enthalten).

### Gibt es eine Demo-Umgebung?

Ja, auf Anfrage stellen wir gerne Zugang zu einer Demo-Umgebung mit Testdaten bereit. So können Sie die Software in Ruhe erkunden, bevor Sie sich entscheiden.

### Wie melde ich mich an?

Besuchen Sie [https://schach.studio](https://schach.studio) und klicken Sie auf "Kostenlos testen". Nach der Registrierung erhalten Sie umgehend Zugang.

---

## 📬 Weiterführende Links

- [Dokumentation](https://docs.schach.studio)
- [Preise](https://schach.studio/preise)
- [Kontakt](https://schach.studio/kontakt)
- [Datenschutz](https://schach.studio/datenschutz)
- [Impressum](https://schach.studio/impressum)

**Letzte Aktualisierung:** April 2026
