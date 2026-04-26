# Freemium + Addon-Modell: Umsetzungsplan

## Ziel
Die App wird **kostenlos für alle Vereine** — ohne Mitgliedslimit, ohne Zeitbegrenzung. 
Bezahlbare Addons können einzeln dazugebucht werden.

---

## Empfohlene Addon-Struktur

| Addon | Enthaltene Features | Preisvorschlag |
|-------|---------------------|----------------|
| **Kern (kostenlos)** | Mitgliederverwaltung, öffentliche Vereinsseite (Subdomain), Terminkalender, Mannschaften, Basis-Rundenturniere, Ergebniseingabe, DSGVO-Tools, E-Mail-Support | **0 €** |
| **Finanzmodul** | SEPA-Export, Mahnwesen, Beitragsstufen, Zahlungs-Tracking, Rechnungs-PDF | **9,90 €/Monat** |
| **Turnier-Pro** | Schweizer System (bbpPairings), TRF-Import/Export, Live-Ticker, Kreuztabellen, DSB-Export | **9,90 €/Monat** |
| **Professional** | Eigene Domain, White-Label (eigene Farben/Logo), API-Zugang, erweiterte Analytics | **4,90 €/Monat** |
| **Kommunikation** | Newsletter-System, Push-Benachrichtigungen, Eltern-Portal, Rundmails | **4,90 €/Monat** |
| **Speicher+** | Erweiterter Dokumentenspeicher (10 GB statt 500 MB), größere Datei-Uploads | **2,90 €/Monat** |

**Kombi-Rabatt:** 2 Addons = 10% Rabatt, 3+ Addons = 20% Rabatt

---

## Technische Umsetzung

### 1. Datenbank-Schema
- `subscription_plan` Enum entfernen (ersetzen durch `addon`-basiertes Modell)
- Neue Tabelle `club_addons`:
  - `club_id` (FK)
  - `addon_id` (z.B. `finance`, `tournament_pro`, `professional`, `communication`, `storage_plus`)
  - `stripe_subscription_id`
  - `status` (active, canceled, past_due)
  - `started_at`, `expires_at`
- `clubs.features` JSONB bleibt erhalten, wird aber dynamisch aus aktiven Addons berechnet

### 2. Feature-Gates
- `src/lib/billing/features.ts` wird komplett umgebaut
- Statt `plan === 'pro'` → `hasAddon(clubId, 'finance')`
- Limits (z.B. Speicher) werden aus Summe aller aktiven Addons berechnet

### 3. Stripe-Integration
- Pro Addon ein Stripe-Produkt + Price-ID
- Einzelne Subscriptions pro Addon (nicht ein Plan mit allem)
- Checkout-Session pro Addon
- Customer Portal für Verwaltung

### 4. UI-Anpassungen
- Pricing-Page zeigt Addon-Kacheln statt Plan-Vergleich
- Dashboard zeigt aktive Addons mit Kündeln-Option
- Feature-Lock-Screens zeigen spezifisches Addon zum Buchen

### 5. Migration
- Bestehende `pro`/`enterprise` Clubs → alle Addons aktivieren (Grace Period)
- `subscription_plan` Enum soft-deprecaten (nicht löschen, nur nicht mehr verwenden)

---

## Todo-Liste

- [ ] Datenbank-Schema: `club_addons` Tabelle erstellen
- [ ] `clubs.features` JSONB auf Addon-basiertes Modell umstellen
- [ ] Feature-Gates (`src/lib/billing/features.ts`) auf Addon-Prüfung umbauen
- [ ] Stripe-Produkt-Katalog für einzelne Addons definieren
- [ ] Billing-Logik für einzelne Addon-Buchungen implementieren
- [ ] Addon-Verwaltung UI im Dashboard
- [ ] Feature-Check Komponenten aktualisieren
- [ ] Webhook-Handler für Addon-Subscriptions anpassen
- [ ] Pricing-Cards auf Addon-Modell umstellen
- [ ] Migrationsskript für bestehende Clubs
- [ ] Dokumentation aktualisieren
