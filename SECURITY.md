# Schachverein - Sicherheitsrichtlinie

## Generieren sicherer Schlüssel

### Für ENCRYPTION_KEY (SEPA-Daten)
```bash
openssl rand -hex 32
```

### Für Datenbank-Passwörter
```bash
openssl rand -base64 24
```

## Docker-Compose mit sicheren Passwörtern starten

Erstelle eine `.env` Datei im `docker/` Verzeichnis:

```bash
POSTGRES_PASSWORD=dein-sicheres-passwort
```

Dann starten:
```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d
```

## 2FA Einrichtung

Die Zwei-Faktor-Authentifizierung (2FA) wird über InsForge Auth verwaltet. Administratoren und Kassenwarte sollten 2FA in ihren Profileinstellungen aktivieren.

## Wichtige Sicherheitshinweise

1. **Niemals** die Standardpasswörter in Produktion verwenden.
2. `.env` Dateien niemals committen.
3. Regelmäßige Backups der PostgreSQL Datenbank erstellen (auch bei InsForge).
4. AES-Verschlüsselung (`ENCRYPTION_KEY`) sicher verwahren – ohne diesen Key sind IBANs unwiderruflich verloren.
5. API-Keys (InsForge Service Role) nur serverseitig verwenden.
