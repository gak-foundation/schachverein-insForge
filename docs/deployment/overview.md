# Deployment Übersicht

Die Schachvereins-Plattform nutzt eine moderne, serverlose Architektur basierend auf **Next.js auf Vercel** und **InsForge Cloud**. Dies reduziert den Wartungsaufwand für die Infrastruktur erheblich und ermöglicht automatisches Skalieren bei hoher Last.

## Infrastruktur-Komponenten

Das System ist für ein vollständiges Cloud-Deployment konzipiert.

### Bestandteile des Deployments

1. **App Node (Next.js):**
   - Führt die Webanwendung auf **Vercel** aus.
   - Automatisches Edge-Caching und globales CDN.
   - ISR (Incremental Static Regeneration) für optimale Performance.

2. **InsForge (Backend-as-a-Service):**
   - **Datenbank:** PostgreSQL 17 (InsForge Cloud EU-Region).
   - **Authentifizierung:** InsForge Auth (JWT-basiert).
   - **Storage:** InsForge Storage für Bilder und Dokumente.
   - **Realtime:** InsForge Realtime für Live-Turnierergebnisse.

3. **Background Tasks:**
   - Serverless Functions für E-Mail-Versand und Datenverarbeitung.
   - Edge Functions für zeitkritische Operationen.
   - Langlaufende Prozesse (z.B. DWZ-Sync) als Vercel Cron Jobs.

4. **Monitoring & Security:**
   - **Sentry:** Error-Tracking.
   - **Vercel Analytics:** Performance-Monitoring.

## Vercel Deployment-Guide

### Voraussetzungen

- Ein Vercel-Konto (vercel.com)
- Ein InsForge-Projekt in der EU-Region

### Schritt 1: Projekt auf Vercel anlegen

1. Verbinde dein GitHub/GitLab/Bitbucket Repository mit Vercel
2. Wähle das Repository aus
3. Vercel erkennt automatisch Next.js - keine Konfiguration nötig

### Schritt 2: Umgebungsvariablen setzen

Setze alle Variablen aus `.env.example` in den Vercel Project Settings:

- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `INSFORGE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ENCRYPTION_KEY`
- Weitere je nach Features

### Schritt 3: Deploy

Jeder Push auf den `main` Branch triggert automatisch ein Deployment.

### Schritt 4: Custom Domain (optional)

1. In Vercel Project Settings → Domains
2. Füge deine Domain hin
3. Folge den DNS-Anweisungen

## Technische Besonderheiten

- **Edge Runtime:** Next.js Middleware läuft auf Vercel Edge Network
- **Serverless Functions:** API-Routen und Server Actions laufen als Serverless Functions
- **Image Optimization:** Next.js Image Komponente nutzt Vercel's globales CDN
- **Preview Deployments:** Jeder PR erhält automatisch eine Preview-URL

---

**Hinweis:** Für Vercel-Spezifika siehe [Vercel Dokumentation](https://vercel.com/docs)
