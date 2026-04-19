# Deployment Guide: All-Hetzner (Docker Compose)

Das "All-Hetzner" Deployment mit Docker Compose ist die bevorzugte, leistungsstärkste und DSGVO-konformste Methode, um den *CheckMate Manager* produktiv zu betreiben. 

Dieses Setup bündelt die **Web-App (Next.js)**, **Background-Worker (BullMQ)**, **PostgreSQL**, **Redis** und **MinIO** in einer abgeschlossenen Server-Umgebung in einem deutschen Rechenzentrum.

## 1. Server Voraussetzungen

Wir empfehlen einen **Hetzner Cloud Server** der CPX-Reihe:
- **Modell:** CPX21 oder CX32 (min. 4 GB RAM empfohlen, 8 GB ideal für MinIO/Docker).
- **Betriebssystem:** Ubuntu 22.04 oder 24.04 LTS.
- **Tools:** Docker, Docker Compose und Git müssen vorinstalliert sein.

## 2. Server vorbereiten (Einmalig)

1. **SSH-Login auf dem Server:**
   ```bash
   ssh root@<deine-server-ip>
   ```

2. **Docker installieren (falls nicht vorhanden):**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Repository klonen:**
   ```bash
   git clone https://github.com/dein-repo/schachverein.git /opt/schachverein
   cd /opt/schachverein
   ```

## 3. Konfiguration

Kopiere die `.env.example` in eine neue `.env` Datei und konfiguriere die Produktionswerte:

```bash
cp .env.example .env
nano .env
```

**Wichtige Werte:**
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://schachverein.deine-domain.de`
- `BETTER_AUTH_URL=https://schachverein.deine-domain.de`
- Generiere sichere Schlüssel für `BETTER_AUTH_SECRET` und `ENCRYPTION_KEY` (jeweils z.B. 32 Zeichen lang).
- `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `MINIO_ROOT_PASSWORD` müssen sicher gesetzt sein.

## 4. Reverse Proxy (Caddy)

Caddy ist ein exzellenter Reverse Proxy, der SSL-Zertifikate (Let's Encrypt) automatisch verwaltet.

1. Erstelle eine Datei `Caddyfile` im Projekt-Root `/opt/schachverein`:
   ```caddyfile
   schachverein.deine-domain.de {
       reverse_proxy app:3000
   }
   ```

2. Caddy dem `docker-compose.yml` hinzufügen (im Repository bereits oder füge es lokal ein):
   ```yaml
   caddy:
     image: caddy:2-alpine
     restart: always
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - ./Caddyfile:/etc/caddy/Caddyfile
       - caddy_data:/data
       - caddy_config:/config
   ```

## 5. Build & Start

Baue die Docker-Images (Next.js App) und starte alle Container:

```bash
cd /opt/schachverein
docker compose -f docker/docker-compose.yml up -d --build
```

Überprüfe den Status:
```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f app
```

## 6. Datenbank-Migration & Seeding

Nachdem die Container laufen, führe die initialen Drizzle-Migrationen aus:

```bash
docker exec -it schachverein-app npm run db:push
```

(Optional) Admin-Nutzer anlegen:
```bash
docker exec -it schachverein-app npm run db:seed
```

## 7. Updates installieren

Um eine neue Version auszurollen:

```bash
cd /opt/schachverein
git pull
docker compose -f docker/docker-compose.yml build app worker
docker compose -f docker/docker-compose.yml up -d --no-deps app worker
docker exec -it schachverein-app npm run db:push
```

## Warum dieses Setup?
1. **Keine Serverless Timeouts:** Bulk-Importe und komplexe Turnierauswertungen laufen problemlos über 60 Sekunden hinaus.
2. **Datenschutz (DSGVO):** Keine Speicherung in US-Clouds. Alle Daten liegen im verschlüsselten Hetzner-Server.
3. **Persistente Worker:** BullMQ läuft nativ als eigener Node-Prozess und verarbeitet Hintergrundaufgaben zuverlässig.
