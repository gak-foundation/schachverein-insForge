# Schachverein - Sicherheitsrichtlinie

## Generieren sicherer Schlüssel

### Für AUTH_SECRET (NextAuth)
```bash
openssl rand -base64 32
```

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
REDIS_PASSWORD=dein-sicheres-passwort
MINIO_ROOT_PASSWORD=dein-sicheres-passwort-min-8-zeichen
```

Dann starten:
```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d
```

## 2FA Einrichtung

Benutzer mit den Rollen `admin` und `kassenwart` müssen 2FA aktivieren.

## Wichtige Sicherheitshinweise

1. **Niemals** die Standardpasswörter in Produktion verwenden
2. `.env` Dateien niemals committen
3. Regelmäßige Backups verschlüsseln
4. Datenbank-Zugriff auf localhost beschränken
