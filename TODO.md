# 📋 TODO: Schachvereins-Software

Diese Liste enthält die verbleibenden Aufgaben, unterteilt in kleine, isolierte Arbeitsschritte für eine effiziente Bearbeitung.

---

## 🏗️ 0. Basis-Infrastruktur & Fixes
- [x] **Dashboard-Integration**: In `src/lib/actions/audit.ts` die Funktion `getDashboardStats` vervollständigt.
- [x] **Fehlerbehandlung**: Globalen Error-Boundary für das Dashboard verfeinern (in `src/app/dashboard/error.tsx`).

---

## 👥 1. Mitgliederverwaltung (Phase 1)
- [x] **CSV-Import Verfeinerung**: Zod-Validierung und Status-Historie integriert.
- [x] **Mitglieder-Historie**: Tabelle `member_status_history` und Anzeige in der Detailansicht implementiert.
- [x] **Familien-Verknüpfung**: Anzeige von Eltern/Kindern in der Detailansicht implementiert.

---

## 🏆 2. Turnier & Sportbetrieb (Phase 2)
- [x] **Ergebniseingabe Logik**: `updateGameResult` mit automatischer Tabellenberechnung implementiert.
- [x] **Schweizer System**: `generateSwissRound` via bbpPairings/Docker integriert.
- [x] **Mannschaftskampf**: `updateMatchResult` mit Gesamtergebnis-Berechnung implementiert.

---

## ♟️ 3. Schachbrett & Partien (Phase 3)
- [x] **Lichess-Integration**: Verlinkung zu Partien anstelle von lokaler PGN-Speicherung.
- [x] **Bulk-Import**: `importBulkPgn` Aktion extrahiert nun Metadaten und Lichess-Links.
- [x] **Datenbank-Suche**: Filter für ECO-Codes und Spieler in `getGames` integriert.

---

## 💰 4. Finanzen & SEPA (Phase 4)
- [x] **Automatisierung**: `generateAnnualPayments` Aktion für Massen-Generierung erstellt.
- [x] **Beleg-Generierung**: Daten-Aktion für Rechnungen und Print-Styles implementiert.

---

## 🔄 5. Integrationen & SaaS (Phase 5)
- [ ] **DWZ-Synchronisierung**: `syncAllMembersDwz` an BullMQ-Cronjob binden.
- [ ] **Lichess-Connect**: Automatischer Import von Partien via API.
- [x] **Audit-Log UI**: Administrative Ansicht unter `/dashboard/admin/audit` erstellt.

---

## 🎨 UI/UX & Polishing
- [x] **Print-Styles**: Optimiert für Mitgliederlisten und Turniere.
- [ ] **Loading States**: Skelett-Screens für alle Dashboard-Unterseiten hinzufügen.
